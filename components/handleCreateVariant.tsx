import { queryClient } from "./queryClient";

import { getRandomSeed } from "../libs/shared-types/src";
import { useAppStore } from "../model/store";

import type { SdImage, SdImageEngines } from "../libs/shared-types/src";

export async function handleCreateVariant(
  item: SdImage,
  engine: SdImageEngines,
  strength?: number
) {
  // if engine is SD, need to match item unless it is DALL-E

  const createImageRequest = useAppStore.getState().createImageRequest;

  await createImageRequest({
    ...item,
    seed: getRandomSeed(),
    variantSourceId: item.url,
    prevImageId: item.id,
    engine,
    variantStrength: strength,
  });

  await queryClient.invalidateQueries();
}
