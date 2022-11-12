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

const methods = [
  "permutation",
  "combination",
  "pick_n",
  "power_set",
  "peel_off",
] as const;
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

  const [shouldRepeatItems, setShouldRepeatItems] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [method, setMethod] = useState<string>("combination");

  const { results: groupsToRun, totalPossible } = getGroupsFromMethod(
    activeChoices,
    subCountPerItem ?? 1,
    totalGenerations ?? 1,
    method
  );

  const itemsToKeep = totalGenerations;

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

  const handleNewChoices = (newChoices: string[]) => {
    // add new items
    const newActiveChoices = [...activeChoices, ...newChoices];

    // remove duplicates
    const uniqueActiveChoices = Array.from(new Set(newActiveChoices));

    setActiveChoices(uniqueActiveChoices);
  };

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
                <Button
                  onClick={() => {
                    setActiveChoices([]);
                  }}
                >
                  clear list
                </Button>
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
                  {getTextForBreakdown(image.promptBreakdown)}
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

interface ComboResult {
  results: string[][];
  totalPossible: bigint | number;
}

function getGroupsFromMethod(
  activeChoices: string[],
  subCountPerItem: number,
  totalGenerations: number,
  method: string
): ComboResult {
  switch (method) {
    case "permutation":
      return getPermutations(activeChoices, subCountPerItem, totalGenerations);
    case "combination":
      return getCombinations(activeChoices, subCountPerItem, totalGenerations);
    case "pick_n":
      return getPickN(activeChoices, subCountPerItem, totalGenerations);
    case "power_set":
      return getPowerSet(activeChoices, totalGenerations);
    case "peel_off":
      return getPeelOff(activeChoices, totalGenerations);
  }

  throw new Error("invalid method");
}

function getPeelOff(
  activeChoices: string[],
  totalGenerations: number
): ComboResult {
  const groups: string[][] = [];

  for (let i = 0; i < totalGenerations; i++) {
    const indexToKeep = Math.floor(
      (i / totalGenerations) * activeChoices.length
    );

    const group = activeChoices.slice(0, activeChoices.length - indexToKeep);
    groups.push(group);
  }

  return {
    results: groups,
    totalPossible: activeChoices.length,
  };
}

function getPermutations(
  activeChoices: string[],
  subCountPerItem: number,
  totalCount: number
): ComboResult {
  const results: string[][] = [];

  const allPerms = new Permutation(activeChoices, subCountPerItem);

  const totalPossible = allPerms.length;
  if (totalPossible < totalCount) {
    return { results: Array.from(allPerms), totalPossible: allPerms.length };
  }

  for (let i = 0; i < totalCount; i++) {
    results.push(allPerms.sample() ?? []);
  }
  return { results, totalPossible };
}

function getCombinations(
  activeChoices: string[],
  subCountPerItem: number,
  totalCount: number
): ComboResult {
  const results: string[][] = [];

  const allCombs = new Combination(activeChoices, subCountPerItem);

  const totalPossible = allCombs.length;

  if (totalPossible < totalCount) {
    return { results: Array.from(allCombs), totalPossible };
  }

  for (let i = 0; i < totalCount; i++) {
    results.push(allCombs.sample() ?? []);
  }
  return { results, totalPossible };
}

function getPickN(
  _activeChoices: string[],
  subCountPerItem: number,
  totalCount: number
): ComboResult {
  const groupsToRun: string[][] = [];

  const activeChoices = orderBy(_activeChoices, (c) => Math.random());

  const itemCount = Math.min(totalCount, activeChoices.length);

  for (let index = 0; index < itemCount; index++) {
    // for i in subCountPerItem

    for (let i = 0; i < subCountPerItem; i++) {
      if (i === 0) {
        groupsToRun.push([]);
      }
      const group = activeChoices[index + i];
      groupsToRun[groupsToRun.length - 1].push(group);
    }
  }

  return {
    results: groupsToRun,
    totalPossible: activeChoices.length,
  };
}

function getPowerSet(activeChoices: string[], totalCount: number): ComboResult {
  const results: string[][] = [];

  const allPowerSets = new PowerSet(activeChoices);

  const totalPossible = allPowerSets.length;
  if (totalPossible < totalCount) {
    const results = Array.from(allPowerSets).filter((c) => c.length > 0);
    return { results: results, totalPossible };
  }

  for (let i = 0; i < totalCount; i++) {
    const sample = allPowerSets.sample() ?? [];

    console.log("sample", sample);

    if (sample.length === 0 || sample[0] === "") {
      continue;
    }

    results.push(sample);
  }
  return { results, totalPossible };
}
