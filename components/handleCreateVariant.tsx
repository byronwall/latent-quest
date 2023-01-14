import { queryClient } from "./queryClient";

import { api_generateImage } from "../model/api";
import { getRandomSeed } from "../libs/shared-types/src";

import type { SdImage } from "../libs/shared-types/src";

type EngineGroup = "SD" | "DALL-E";

export async function handleCreateVariant(
  item: SdImage,
  engineGroup: EngineGroup,
  strength?: number
) {
  // if engine is SD, need to match item unless it is DALL-E
  const engine: SdImage["engine"] =
    engineGroup === "SD"
      ? item.engine === "DALL-E"
        ? "SD 2.1 512px"
        : item.engine
      : "DALL-E";

  await api_generateImage({
    ...item,
    seed: getRandomSeed(),
    variantSourceId: item.url,
    prevImageId: item.id,
    engine,
    variantStrength: strength,
  });

  await queryClient.invalidateQueries();
}
