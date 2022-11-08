import {
  Button,
  Loader,
  NumberInput,
  Popover,
  Radio,
  Stepper,
} from "@mantine/core";
import { Combination, Permutation, PowerSet } from "js-combinatorics";
import { orderBy } from "lodash-es";
import { useState } from "react";
import { useQueryClient } from "react-query";

import { generatePlaceholderForTransform } from "../libs/helpers";
import {
  getTextForBreakdown,
  SdImage,
  SdImageTransformTextSub,
} from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import { getSelectionAsLookup } from "./getSelectionFromPromptPart";
import { PopoverCommon, Switch } from "./MantineWrappers";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";
import { SdSubChooser } from "./SdSubChooser";

interface SdImageSubPopoverProps {
  activeCategory: string;

  image: SdImage;
}

const methods = ["permutation", "combination", "pick_n", "power_set"] as const;
type SdSubMethod = typeof methods[number];

export function SdImageSubPopover(props: SdImageSubPopoverProps) {
  const { activeCategory, image } = props;

  const [active, setActive] = useState(0);

  const choicesInActivePrompt = getSelectionAsLookup(image);

  const choicesForActiveCategory = choicesInActivePrompt[activeCategory];

  const [activeChoices, setActiveChoices] = useState<string[]>(
    choicesForActiveCategory ?? []
  );

  const [subCountPerItem, setSubCountPerItem] = useState<number | undefined>(1);

  const [totalGenerations, setTotalGenerations] = useState<number | undefined>(
    10
  );

  const [shouldGenAll, setShouldGenAll] = useState(false);

  const [shouldConsiderOrderUnique, setShouldConsiderOrderUnique] =
    useState(false);

  const [shouldRepeatItems, setShouldRepeatItems] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [method, setMethod] = useState<string>("combination");

  const [shouldShuffle, setShouldShuffle] = useState(false);

  const shuffledArray = shouldShuffle
    ? orderBy(activeChoices, () => Math.random())
    : activeChoices;

  const groupsToRun = getGroupsFromMethod(
    shuffledArray,
    subCountPerItem ?? 1,
    method
  );

  const itemsToKeep = shouldGenAll ? groupsToRun.length : totalGenerations;

  const placeholders = groupsToRun.slice(0, itemsToKeep).map((group) => {
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

  const handleGenAll = async () => {
    setIsLoading(true);

    /// do the thing

    await api_generateImage(placeholders);

    setIsLoading(false);
    qc.invalidateQueries();
  };

  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    console.log(choicesInActivePrompt);
  }

  return (
    <PopoverCommon opened={isOpen} onClose={() => setIsOpen(false)}>
      <Popover.Dropdown>
        <div
          style={{
            width: 600,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Stepper active={active} onStepClick={setActive} breakpoint="sm">
            <Stepper.Step label={`Choose subs (${activeChoices.length})`}>
              <div>
                {choicesForActiveCategory?.length > 0 && (
                  <div>
                    <b>Items list in active prompt were already chosen.</b>
                  </div>
                )}
                <SdSubChooser
                  activeCategory={activeCategory}
                  shouldExcludeModal
                  onNewChoices={setActiveChoices}
                />
              </div>
            </Stepper.Step>
            <Stepper.Step label="Choice options">
              <div>
                <p>
                  <b>prompt: </b>
                  {getTextForBreakdown(image.promptBreakdown)}
                </p>

                <div>
                  <Radio.Group label="choose your method" onChange={setMethod}>
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
                  disabled={shouldGenAll}
                />

                <p>
                  <b>total possible items: </b>0
                </p>

                <Switch
                  label="Generate all"
                  checked={shouldGenAll}
                  onChange={setShouldGenAll}
                />
                <Switch
                  label="Consider order unique"
                  checked={shouldConsiderOrderUnique}
                  onChange={setShouldConsiderOrderUnique}
                />
                <Switch
                  label="Repeat items"
                  checked={shouldRepeatItems}
                  onChange={setShouldRepeatItems}
                />
                <Switch
                  label="Shuffle items"
                  checked={shouldShuffle}
                  onChange={setShouldShuffle}
                />
              </div>
            </Stepper.Step>
            <Stepper.Step label="Review and run">
              <div>
                <p>Following groups will be processed:</p>
                <ol>
                  {groupsToRun.map((group, i) => (
                    <li key={i}>{group.join(", ")}</li>
                  ))}
                </ol>
                {isLoading ? (
                  <Loader />
                ) : (
                  <Button onClick={handleGenAll}>generate all</Button>
                )}
                <div style={{ display: "flex", flexWrap: "wrap" }}>
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
      </Popover.Dropdown>
      <Popover.Target>
        <Button
          compact
          color="teal"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {activeCategory}
        </Button>
      </Popover.Target>
    </PopoverCommon>
  );
}

function getGroupsFromMethod(
  activeChoices: string[],
  subCountPerItem: number,
  method: string
): string[][] {
  switch (method) {
    case "permutation":
      return getPermutations(activeChoices, subCountPerItem);
    case "combination":
      return getCombinations(activeChoices, subCountPerItem);
    case "pick_n":
      return getPickN(activeChoices, subCountPerItem);
    case "power_set":
      return getPowerSet(activeChoices);
  }

  return [];
}

function getPermutations(activeChoices: string[], subCountPerItem: number) {
  return Array.from(new Permutation(activeChoices, subCountPerItem));
}

function getCombinations(activeChoices: string[], subCountPerItem: number) {
  return Array.from(new Combination(activeChoices, subCountPerItem));
}
function getPickN(activeChoices: string[], subCountPerItem: number) {
  const groupsToRun: string[][] = [];

  for (let index = 0; index < activeChoices.length; index++) {
    const element = activeChoices[index];

    if (index % (subCountPerItem ?? 1) === 0) {
      groupsToRun.push([]);
    }

    groupsToRun[groupsToRun.length - 1].push(element);
  }

  return groupsToRun;
}

function getPowerSet(activeChoices: string[]) {
  return Array.from(new PowerSet(activeChoices)).filter((c) => c.length > 0);
}
