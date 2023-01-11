import { Loader, NumberInput, Select } from "@mantine/core";
import { IconArrowsShuffle } from "@tabler/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQueryClient } from "react-query";

import { Button } from "./Button";
import { PromptEditor } from "./PromptEditor";

import { getBreakdownForText, getRandomSeed } from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";

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

interface SdNewImagePromptProps {
  defaultImage?: SdImage;

  onCreate?: (image: SdImagePlaceHolder, cb: () => void) => void;
}

const defaultEngine: SdImageEngines = "SD 2.1 512px";

export function SdNewImagePrompt(props: SdNewImagePromptProps) {
  const { defaultImage } = props;

  const [cfg, cfgSet] = useState(defaultImage?.cfg ?? 10);
  const [steps, stepsSet] = useState(defaultImage?.steps ?? 20);

  const [seed, seedSet] = useState(defaultImage?.seed ?? getRandomSeed());

  const [engine, setEngine] = useState(defaultImage?.engine ?? defaultEngine);

  const [isLoading, setIsLoading] = useState(false);

  const [breakdown, setBreakdown] = useState<PromptBreakdown>(
    defaultImage?.promptBreakdown ?? getBreakdownForText(starterPrompt)
  );

  const queryClient = useQueryClient();

  const router = useRouter();

  const isPartOfExistingGroup = defaultImage !== undefined;

  const [isPromptDirty, setIsPromptDirty] = useState(false);

  const onGen = async () => {
    if (isPromptDirty) {
      const shouldCont = confirm(
        "You have unsaved changes to your prompt. Are you sure you want to continue?"
      );
      if (!shouldCont) {
        return;
      }
    }

    const newImgReq: SdImagePlaceHolder = {
      promptBreakdown: breakdown,
      cfg: cfg,
      steps: steps,
      seed: seed,
      engine: engine,
      prevImageId: defaultImage?.id,
      groupId: defaultImage?.groupId,
    };

    setIsLoading(true);

    if (props.onCreate) {
      // the callback allows the button to disappear
      props.onCreate(newImgReq, () => {
        setIsLoading(false);
      });
      return;
    }

    const img = await api_generateImage(newImgReq);
    setIsLoading(false);
    await queryClient.invalidateQueries();

    if (isPartOfExistingGroup) {
      // just be done
      return;
    }

    router.push(`/group/${img[0].groupId}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <PromptEditor
        initialBreakdown={breakdown}
        onBreakdownChange={setBreakdown}
        onIsDirtyChange={setIsPromptDirty}
        shouldAllowSelection
      />
      <div className="flex flex-wrap gap-4 md:flex-nowrap">
        <Select
          label="engine"
          placeholder="engine"
          data={engine_choices}
          value={engine}
          onChange={(val: any) => setEngine(val ?? "SD 1.5")}
          className="min-w-[140px]"
        />
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
      <div>
        {isLoading ? (
          <Loader />
        ) : (
          <Button onClick={() => onGen()} color="orange">
            create
          </Button>
        )}
      </div>
    </div>
  );
}
