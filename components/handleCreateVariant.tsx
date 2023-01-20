import { queryClient } from "./queryClient";

import { getRandomSeed, getUuid } from "../libs/shared-types/src";
import { useAppStore } from "../model/store";

import type { SdImage, SdImageEngines } from "../libs/shared-types/src";

export async function handleCreateVariant(
  item: SdImage,
  engine: SdImageEngines,
  strength?: number,
  imageCount = 1
) {
  // if engine is SD, need to match item unless it is DALL-E

  const createImageRequest = useAppStore.getState().createImageRequest;

  // TODO: consider building from all props instead of spreading
  const items = Array(imageCount)
    .fill(0)
    .map(() => {
      return {
        ...item,
        id: getUuid(),
        seed: getRandomSeed(),
        variantSourceId: item.url,
        prevImageId: item.id,
        engine,
        variantStrength: strength,
      };
    });

  await createImageRequest(items);

  await queryClient.invalidateQueries();
}
