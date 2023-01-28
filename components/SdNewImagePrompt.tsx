import { NumberInput } from "@mantine/core";
import { IconArrowsShuffle } from "@tabler/icons";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { usePrevious } from "@mantine/hooks";
import axios from "axios";

import { Button } from "./Button";
import { PromptEditor } from "./PromptEditor";
import { SelectEngine } from "./SelectEngine";
import { IMAGE_COUNTS } from "./SdVariantMenu";
import { Switch } from "./MantineWrappers";

import { useAppStore } from "../model/store";
import {
  getBreakdownForText,
  getRandomSeed,
  getTextForBreakdown,
  getUuid,
} from "../libs/shared-types/src";
import { getBreakdownDelta } from "../libs/helpers";

import type { InspirationEntry } from "./InspirationMgr";
import type { ImgOrImgArray } from "../model/api";
import type {
  PromptBreakdown,
  SdImage,
  SdImagePlaceHolder,
  SdImageEngines,
} from "../libs/shared-types/src";

const starterPrompt =
  "dump truck, poster art by Tomokazu Matsuyama, featured on pixiv, space art, 2d game art, cosmic horror, official art";

export const engine_choices: SdImageEngines[] = [
  "DALL-E",
  "SD 1.4",
  "SD 1.5",
  "SD 2.0 512px",
  // "SD 2.0 768px",
  "SD 2.1 512px",
  // "SD 2.1 768px",
  "SD 2.0 inpaint",
];

export type CreateImageHandler = (
  image: SdImagePlaceHolder,
  imageCount: number
) => void;

interface SdNewImagePromptProps {
  defaultImage?: SdImage;
  onCreate?: CreateImageHandler;

  inspirationToAdd?: InspirationEntry;
}

const defaultEngine: SdImageEngines = "SD 2.1 512px";

export function SdNewImagePrompt(props: SdNewImagePromptProps) {
  const { defaultImage, inspirationToAdd } = props;

  const [cfg, cfgSet] = useState(defaultImage?.cfg ?? 10);
  const [steps, stepsSet] = useState(defaultImage?.steps ?? 30);

  const [seed, seedSet] = useState(defaultImage?.seed ?? getRandomSeed());

  const [engine, setEngine] = useState(defaultImage?.engine ?? defaultEngine);

  const [imageCount, setImageCount] = useState(1);

  const [breakdown, setBreakdown] = useState<PromptBreakdown>(
    defaultImage?.promptBreakdown ?? getBreakdownForText(starterPrompt)
  );

  const createImageRequest = useAppStore((s) => s.createImageRequest);

  const queryClient = useQueryClient();
  const router = useRouter();

  const isPartOfExistingGroup = defaultImage !== undefined;

  const [shouldSplitPrompt, setShouldSplitPrompt] = useState(false);

  const [promptText, setPromptText] = useState<string>(
    getTextForBreakdown(breakdown)
  );

  const promptCouldBeSplit = useMemo(() => {
    return (
      promptText
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c !== "").length > 1
    );
  }, [promptText]);

  const onGen = async () => {
    const groupId = defaultImage?.groupId ?? getUuid();

    // split on new line and remove leading number if shouldSplitPrompt

    let breakDowns = [breakdown];

    if (shouldSplitPrompt) {
      breakDowns = promptText
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c !== "")
        .map((c) => c.replace(/^[0-9]+\. /, ""))
        .map((c) => c.trim())
        .map((c) => getBreakdownForText(c));

      // generate a set of prompts for each breakdown
    }

    const seeds = Array(imageCount)
      .fill(0)
      .map((c) => getRandomSeed());

    const newImgReq: ImgOrImgArray = breakDowns.flatMap((breakdown) =>
      Array(imageCount)
        .fill(0)
        .map((_, idx) => {
          return {
            id: getUuid(),
            promptBreakdown: breakdown,
            cfg: cfg,
            steps: steps,

            // if this is the first image, use the seed from the state
            // otherwise, generate a new seed
            seed: idx > 0 ? seeds[idx] : seed,

            engine: engine,
            prevImageId: defaultImage?.id,
            groupId: groupId,
          };
        })
    );

    console.log("newImgReq", newImgReq);

    if (props.onCreate) {
      // the callback allows the button to disappear
      // just need the first one -- the rest will be created by the receiver
      props.onCreate(newImgReq[0], imageCount);
      return;
    }

    // navigate to the new page -- placeholders will be there
    router.push(`/group/${groupId}`);

    await createImageRequest(newImgReq);

    await queryClient.invalidateQueries();

    if (isPartOfExistingGroup) {
      // just be done
      return;
    }
  };

  // if inspirationToAdd is set, then we should add that value to the prompt
  const prevInspiration = usePrevious(inspirationToAdd);

  useEffect(() => {
    if (inspirationToAdd !== prevInspiration && inspirationToAdd) {
      const newPrompt = `${promptText}, ${inspirationToAdd.value}`;

      setPromptText(newPrompt);
    }
  }, [breakdown, inspirationToAdd, prevInspiration, promptText]);

  useEffect(() => {
    setBreakdown(getBreakdownForText(promptText));
  }, [promptText]);

  const handlePromptGpt = async () => {
    // send a POST to /api/prompts/gpt_helper using axios

    const topic = prompt("Enter a topic for the prompt: ");

    if (topic === null) {
      return;
    }

    const { data: newPrompt } = await axios.post("/api/prompts/gpt_help", {
      topic,
    });

    setPromptText(newPrompt);
  };

  return (
    <div className="flex flex-col gap-4">
      <PromptEditor
        initialPromptText={promptText}
        onPromptTextChange={setPromptText}
      />
      <div className="flex flex-wrap gap-4 md:flex-nowrap">
        <SelectEngine value={engine} onChange={setEngine} />

        <NumberInput
          label="cfg"
          value={cfg}
          onChange={(val) => cfgSet(val ?? 0)}
          disabled={engine === "DALL-E"}
          className="shrink"
        />
        <NumberInput
          label="steps"
          value={steps}
          onChange={(val) => stepsSet(val ?? 0)}
          disabled={engine === "DALL-E"}
          className="shrink"
        />

        <NumberInput
          label={
            <div>
              seed
              <span
                className="ml-3 cursor-pointer text-blue-500 hover:text-blue-300"
                onClick={() => seedSet(getRandomSeed())}
              >
                <IconArrowsShuffle size={16} className="inline" />
              </span>
            </div>
          }
          value={seed}
          onChange={(val) => seedSet(val ?? 0)}
          disabled={engine === "DALL-E"}
          className="min-w-[140px]"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <p>image count</p>
          <div className="flex gap-1">
            {IMAGE_COUNTS.map((count) => (
              <Button
                key={count}
                onClick={() => setImageCount(count)}
                active={imageCount === count}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>
        {promptCouldBeSplit && (
          <div>
            <Switch
              label="split prompt"
              checked={shouldSplitPrompt}
              onChange={setShouldSplitPrompt}
            />
          </div>
        )}
      </div>
      <div>
        <Button onClick={() => onGen()}>create</Button>
        <Button onClick={handlePromptGpt}>gpt help</Button>
      </div>
    </div>
  );
}
