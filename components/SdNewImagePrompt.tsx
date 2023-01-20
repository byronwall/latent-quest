import { NumberInput } from "@mantine/core";
import { IconArrowsShuffle } from "@tabler/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQueryClient } from "react-query";

import { Button } from "./Button";
import { PromptEditor } from "./PromptEditor";
import { SelectEngine } from "./SelectEngine";
import { IMAGE_COUNTS } from "./SdVariantMenu";

import { useAppStore } from "../model/store";
import {
  getBreakdownForText,
  getRandomSeed,
  getUuid,
} from "../libs/shared-types/src";

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
}

const defaultEngine: SdImageEngines = "SD 2.1 512px";

export function SdNewImagePrompt(props: SdNewImagePromptProps) {
  const { defaultImage } = props;

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

  const onGen = async () => {
    const groupId = defaultImage?.groupId ?? getUuid();

    const newImgReq: ImgOrImgArray = Array(imageCount)
      .fill(0)
      .map((_, idx) => {
        return {
          id: getUuid(),
          promptBreakdown: breakdown,
          cfg: cfg,
          steps: steps,

          // if this is the first image, use the seed from the state
          // otherwise, generate a new seed
          seed: idx > 0 ? getRandomSeed() : seed,

          engine: engine,
          prevImageId: defaultImage?.id,
          groupId: groupId,
        };
      });

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

  return (
    <div className="flex flex-col gap-4">
      <PromptEditor
        initialBreakdown={breakdown}
        onBreakdownChange={setBreakdown}
        shouldAllowSelection
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
      <div>
        <Button onClick={() => onGen()}>create</Button>
      </div>
    </div>
  );
}
