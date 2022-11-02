import {
  Button,
  Group,
  Loader,
  NumberInput,
  Stack,
  Title,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQueryClient } from "react-query";

import { getBreakdownForText, PromptBreakdown } from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import { PromptEditor } from "./PromptEditor";

const starterPrompt =
  "dump truck, poster art by Tomokazu Matsuyama, featured on pixiv, space art, 2d game art, cosmic horror, official art";

export function SdNewImagePrompt() {
  const [cfg, cfgSet] = useState(10);
  const [steps, stepsSet] = useState(20);

  const [seed, seedSet] = useState(Math.floor(Math.random() * 67823));

  const [isLoading, setIsLoading] = useState(false);

  const [breakdown, setBreakdown] = useState<PromptBreakdown>(
    getBreakdownForText(starterPrompt)
  );

  const queryClient = useQueryClient();

  const router = useRouter();

  const onGen = async () => {
    setIsLoading(true);
    const img = await api_generateImage({
      promptBreakdown: breakdown,
      cfg: cfg,
      steps: steps,
      seed: seed,
    });
    setIsLoading(false);
    queryClient.invalidateQueries();

    router.push(`/group/${img[0].groupId}`);
  };

  return (
    <div className="container">
      <Stack>
        <Title order={1}>test a prompt</Title>
        <PromptEditor
          initialBreakdown={breakdown}
          onBreakdownChange={setBreakdown}
          style={{ minWidth: 400 }}
          shouldAllowSelection
        />
        <Group align={"flex-start"}>
          <NumberInput
            label="cfg"
            value={cfg}
            onChange={(val) => cfgSet(val ?? 0)}
          />
          <NumberInput
            label="steps"
            value={steps}
            onChange={(val) => stepsSet(val ?? 0)}
          />
          <NumberInput
            label="seed"
            value={seed}
            onChange={(val) => seedSet(val ?? 0)}
          />
          {isLoading ? (
            <Loader />
          ) : (
            <Button onClick={() => onGen()}>Generate image</Button>
          )}
        </Group>
      </Stack>
    </div>
  );
}
