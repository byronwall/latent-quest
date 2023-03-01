import { simpleDelete, simplePost } from "./api";

import type { SdImage } from "../libs/shared-types/src";

export const api_deleteImage = simpleDelete<SdImage, any>("/api/images");

export const api_getUmapImages = (data) =>
  simplePost<{ groupId?: string }, SdImage[]>(
    "/api/images/embedding/images",
    data
  );
