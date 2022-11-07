import {
  Button,
  Loader,
  NumberInput,
  Paper,
  Popover,
  Stepper,
} from "@mantine/core";
import { useState } from "react";

import {
  getTextForBreakdown,
  SdImage,
  SdImageTransformTextSub,
} from "../libs/shared-types/src";
import { PopoverCommon, Switch } from "./MantineWrappers";
import { SdSubChooser } from "./SdSubChooser";

import {
  permutation,
  combination,
  Permutation,
  Combination,
} from "js-combinatorics";
import {
  generatePlaceholderForTransform,
  generatePlaceholderForTransforms,
} from "../libs/helpers";
import { api_generateImage } from "../model/api";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";
import { orderBy } from "lodash-es";
import { useQueryClient } from "react-query";

interface SdImageSubPopoverProps {
  activeCategory: string;

  image: SdImage;
}

export function SdImageSubPopover(props: SdImageSubPopoverProps) {
  const { activeCategory, image } = props;

  const [active, setActive] = useState(0);

  const [activeChoices, setActiveChoices] = useState<string[]>([]);

  const [subCountPerItem, setSubCountPerItem] = useState<number | undefined>(1);

  const [totalGenerations, setTotalGenerations] = useState<number | undefined>(
    10
  );

  const [shouldGenAll, setShouldGenAll] = useState(false);

  const [shouldConsiderOrderUnique, setShouldConsiderOrderUnique] =
    useState(false);

  const [shouldRepeatItems, setShouldRepeatItems] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const groupsToRun: Array<string[]> = [];

  const shuffledArray = orderBy(activeChoices, () => Math.random());

  for (let index = 0; index < shuffledArray.length; index++) {
    const element = shuffledArray[index];

    if (index % (subCountPerItem ?? 1) === 0) {
      groupsToRun.push([]);
    }

    groupsToRun[groupsToRun.length - 1].push(element);
  }

  const itemsToKeep = shouldGenAll ? groupsToRun.length : totalGenerations;

  const placeholders = groupsToRun.slice(0, itemsToKeep).map((group) => {
    const subXForm: SdImageTransformTextSub = {
      type: "text",
      action: "substitute",
      field: "unknown",
      subKey: activeCategory,
      value: group.join(", "),
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

  return (
    <PopoverCommon>
      <Popover.Dropdown>
        <div
          style={{
            width: 600,
          }}
        >
          <Stepper active={active} onStepClick={setActive} breakpoint="sm">
            <Stepper.Step label={`Choose subs (${activeChoices.length})`}>
              <div>
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
        <Button compact color="teal">
          {activeCategory}
        </Button>
      </Popover.Target>
    </PopoverCommon>
  );
}
