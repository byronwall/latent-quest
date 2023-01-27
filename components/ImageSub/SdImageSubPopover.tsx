import {
  Loader,
  Menu,
  Modal,
  NumberInput,
  Radio,
  Stepper,
} from "@mantine/core";
import { useContext, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useUpdateEffect } from "react-use";

import { getGroupsFromMethod } from "./getGroupsFromMethod";

import { Button } from "../Button";
import { getSelectionAsLookup } from "../getSelectionFromPromptPart";
import { SdGroupContext } from "../SdGroupContext";
import { SdImagePlaceHolderComp } from "../SdImagePlaceHolderComp";
import { SdSubChooser } from "../SdSubChooser";
import { useAppStore } from "../../model/store";
import { getTextForBreakdown } from "../../libs/shared-types/src";
import {
  generatePlaceholderForTransform,
  getUniversalIdFromImage,
} from "../../libs/helpers";

import type {
  SdImage,
  SdImageTransformTextSub,
} from "../../libs/shared-types/src";

interface SdImageSubPopoverProps {
  availableCategories: string | string[];

  initialSelections?: string[];

  image?: SdImage;

  onReceiveSubs?: (subs: string[]) => void;
}

const methods = [
  "permutation",
  "combination",
  "pick_n",
  "power_set",
  "peel_off",
] as const;

export interface ComboResult {
  results: string[][];
  totalPossible: bigint | number;
}

export function SdImageSubPopover(props: SdImageSubPopoverProps) {
  const { image, availableCategories, initialSelections } = props;

  const isArrayOfCategories = Array.isArray(availableCategories);
  const selKeys = isArrayOfCategories
    ? availableCategories
    : [availableCategories];

  const [active, setActive] = useState(0);

  const choicesInActivePrompt = useMemo(
    () => getSelectionAsLookup(image),
    [image]
  );

  const [activeCategory, setActiveCategory] = useState(selKeys[0]);

  const choicesForActiveCategory = choicesInActivePrompt[activeCategory];

  const [activeChoices, setActiveChoices] = useState<string[]>(
    initialSelections ?? choicesForActiveCategory ?? []
  );

  useUpdateEffect(() => {
    setActiveChoices(choicesForActiveCategory ?? []);
  }, [choicesForActiveCategory]);

  const [subCountPerItem, setSubCountPerItem] = useState<number | undefined>(1);

  const [totalGenerations, setTotalGenerations] = useState<number | undefined>(
    10
  );

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [method, setMethod] = useState<string>("combination");

  const { results: groupsToRun, totalPossible } = getGroupsFromMethod({
    activeChoices,
    subCountPerItem: subCountPerItem ?? 1,
    totalGenerations: totalGenerations ?? 1,
    method,
  });

  const itemsToKeep = totalGenerations;

  const placeholders =
    image === undefined
      ? []
      : groupsToRun.slice(0, itemsToKeep).map((group) => {
          const subXForm: SdImageTransformTextSub = {
            type: "text",
            action: "substitute",
            field: "unknown",
            subKey: activeCategory,
            value: group,
          };

          const placeHolder = generatePlaceholderForTransform(image, subXForm);
          placeHolder.prevImageId = image.id;

          return placeHolder;
        });

  const qc = useQueryClient();

  const { groupImages } = useContext(SdGroupContext);

  const createImageRequest = useAppStore((s) => s.createImageRequest);

  const handleGenAll = async () => {
    setIsLoading(true);

    const nonExistingPlaceholders = placeholders.filter(
      (c) => groupImages[getUniversalIdFromImage(c)] === undefined
    );

    await createImageRequest(nonExistingPlaceholders);

    setIsLoading(false);
    await qc.invalidateQueries();
  };

  const handleNewChoices = (newChoices: string[]) => {
    // add new items
    const newActiveChoices = [...activeChoices, ...newChoices];

    // remove duplicates
    const uniqueActiveChoices = Array.from(new Set(newActiveChoices));

    setActiveChoices(uniqueActiveChoices);
  };

  const actionComp = isArrayOfCategories ? (
    selKeys.length > 0 && (
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button color="green">subs...</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>pick category...</Menu.Label>
          {selKeys.map((key) => (
            <Menu.Item
              key={key}
              onClick={() => {
                setActiveCategory(key);
                setIsModalOpen(true);
              }}
            >
              {key}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    )
  ) : (
    <Button color="lime" onClick={() => setIsModalOpen(true)}>
      chooser
    </Button>
  );

  return (
    <>
      {actionComp}

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="auto"
      >
        <div
          style={{
            width: 600,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Stepper active={active} onStepClick={setActive} breakpoint="sm">
            {initialSelections && (
              <Stepper.Step label={`Review subs (${initialSelections.length})`}>
                <div>
                  {initialSelections.map((choice) => (
                    <div key={choice}>{choice}</div>
                  ))}
                </div>
              </Stepper.Step>
            )}
            <Stepper.Step label={`Add new subs (${activeChoices.length})`}>
              <div>
                {choicesForActiveCategory?.length > 0 && (
                  <div>
                    <b>Items list in active prompt were already chosen.</b>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setActiveChoices([]);
                  }}
                >
                  clear list
                </Button>
                {props.onReceiveSubs && (
                  <Button
                    onClick={() => {
                      props.onReceiveSubs?.(activeChoices);
                      setIsModalOpen(false);
                    }}
                  >
                    send choices back to parent
                  </Button>
                )}
                <SdSubChooser
                  activeCategory={activeCategory}
                  shouldExcludeModal
                  onNewChoices={handleNewChoices}
                />
              </div>
            </Stepper.Step>
            <Stepper.Step label="Choice options">
              <div>
                <p>
                  <b>prompt: </b>
                  {getTextForBreakdown(image?.promptBreakdown)}
                </p>

                <div>
                  <Radio.Group
                    label="choose your method"
                    onChange={setMethod}
                    value={method}
                  >
                    {methods.map((method) => (
                      <Radio key={method} value={method} label={method} />
                    ))}
                  </Radio.Group>
                </div>

                <NumberInput
                  value={subCountPerItem}
                  onChange={setSubCountPerItem}
                  style={{ width: 200 }}
                  label="Number of subs to include per generation"
                />

                <NumberInput
                  value={totalGenerations}
                  onChange={setTotalGenerations}
                  style={{ width: 200 }}
                  label="Total images to generate"
                />

                <p>
                  <b>total possible items: </b>
                  {Number(totalPossible)}
                </p>
              </div>
            </Stepper.Step>
            <Stepper.Step label="Review and run">
              <div>
                <Button
                  color="pink"
                  onClick={() => {
                    props.onReceiveSubs?.(
                      groupsToRun.map((c) => c.join(" | "))
                    );
                  }}
                >
                  add items to parent
                </Button>
                <p>Following groups will be processed:</p>
                <div className="flex flex-wrap gap-2">
                  {groupsToRun.map((group, i) => (
                    <div key={i} className=" rounded border border-black p-1">
                      {group.join(", ")}
                    </div>
                  ))}
                </div>
                {isLoading ? (
                  <Loader />
                ) : (
                  <Button onClick={handleGenAll}>generate all</Button>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {placeholders.map((placeholder, i) => (
                    <SdImagePlaceHolderComp
                      key={i}
                      placeholder={placeholder}
                      size={200}
                    />
                  ))}
                </div>
              </div>
            </Stepper.Step>
            <Stepper.Completed>
              Completed, click back button to get to previous step
            </Stepper.Completed>
          </Stepper>
        </div>
      </Modal>
    </>
  );
}
