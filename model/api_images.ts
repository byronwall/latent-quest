import { simpleDelete } from "./api";

import type { SdImage } from "../libs/shared-types/src";

export const api_deleteImage = simpleDelete<SdImage, any>("/api/images");
