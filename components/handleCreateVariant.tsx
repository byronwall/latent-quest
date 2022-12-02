import { queryClient } from "./queryClient";

import { api_generateImage } from "../model/api";

import type { SdImage } from "../libs/shared-types/src";

export async function handleCreateVariant(
  item: SdImage,
  engine: SdImage["engine"],
  strength?: number
) {
  await api_generateImage({
    ...item,
    variantSourceId: item.url,
    prevImageId: item.id,
    engine,
    variantStrength: strength,
  });

  await queryClient.invalidateQueries();
}
