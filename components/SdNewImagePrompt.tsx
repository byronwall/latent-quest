import {
  Button,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
} from "@mantine/core";
import { IconArrowsShuffle } from "@tabler/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQueryClient } from "react-query";

import {
  getBreakdownForText,
  getRandomSeed,
  getValidEngine,
  PromptBreakdown,
  SdImage,
} from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import { PromptEditor } from "./PromptEditor";

const starterPrompt =
  "dump truck, poster art by Tomokazu Matsuyama, featured on pixiv, space art, 2d game art, cosmic horror, official art";

export const engine_choices = ["DALL-E", "SD 1.5"];

interface SdNewImagePromptProps {
  defaultImage?: SdImage;
}

export function SdNewImagePrompt(props: SdNewImagePromptProps) {
  const { defaultImage } = props;

  const [cfg, cfgSet] = useState(defaultImage?.cfg ?? 10);
  const [steps, stepsSet] = useState(defaultImage?.steps ?? 20);

  const [seed, seedSet] = useState(defaultImage?.seed ?? getRandomSeed());

  const [engine, setEngine] = useState(defaultImage?.engine ?? "SD 1.5");

  const [isLoading, setIsLoading] = useState(false);

  const [breakdown, setBreakdown] = useState<PromptBreakdown>(
    defaultImage?.promptBreakdown ?? getBreakdownForText(starterPrompt)
  );

  const queryClient = useQueryClient();

  const router = useRouter();

  const isPartOfExistingGroup = defaultImage !== undefined;

  const onGen = async () => {
    setIsLoading(true);
    const img = await api_generateImage({
      promptBreakdown: breakdown,
      cfg: cfg,
      steps: steps,
      seed: seed,
      engine: getValidEngine(engine),
      prevImageId: defaultImage?.id,
      groupId: defaultImage?.groupId,
    });
    setIsLoading(false);
    queryClient.invalidateQueries();

    if (isPartOfExistingGroup) {
      // just be done
      return;
    }

    router.push(`/group/${img[0].groupId}`);
  };

  return (
    <div>
      <Stack>
        <PromptEditor
          initialBreakdown={breakdown}
          onBreakdownChange={setBreakdown}
          style={{ minWidth: 400 }}
          shouldAllowSelection
        />
        <Group align={"center"}>
          <NumberInput
            label="cfg"
            value={cfg}
            onChange={(val) => cfgSet(val ?? 0)}
            disabled={engine === "DALL-E"}
            style={{ width: 80 }}
          />
          <NumberInput
            label="steps"
            value={steps}
            onChange={(val) => stepsSet(val ?? 0)}
            disabled={engine === "DALL-E"}
            style={{ width: 80 }}
          />
          <NumberInput
            label="seed"
            value={seed}
            onChange={(val) => seedSet(val ?? 0)}
            disabled={engine === "DALL-E"}
            rightSection={
              <Button onClick={() => seedSet(getRandomSeed())} compact>
                <IconArrowsShuffle />
              </Button>
            }
            style={{ width: 150 }}
          />
          <Select
            label="engine"
            placeholder="engine"
            data={engine_choices}
            value={engine}
            onChange={(val: any) => setEngine(val ?? "SD 1.5")}
            style={{ width: 100 }}
          />
          {isLoading ? (
            <Loader />
          ) : (
            <Button onClick={() => onGen()}>create</Button>
          )}
        </Group>
      </Stack>
    </div>
  );
}
