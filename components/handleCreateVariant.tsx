import { queryClient } from "./queryClient";

import { api_generateImage } from "../model/api";
import { getRandomSeed } from "../libs/shared-types/src";

import type { SdImage, SdImageEngines } from "../libs/shared-types/src";

export async function handleCreateVariant(
  item: SdImage,
  engine: SdImageEngines,
  strength?: number
) {
  // if engine is SD, need to match item unless it is DALL-E

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
