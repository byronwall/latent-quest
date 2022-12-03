import type { SdImage } from "../libs/shared-types/src";

export interface LqDbCollection {
  id: string;
  name: string;
  dateCreated: string;
}

export interface LqDbCollectionImage {
  id: string;
  collectionId: string;
  imageId: string;
}

export interface LqCollection extends LqDbCollection {
  images: SdImage;
}
