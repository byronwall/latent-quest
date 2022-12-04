import type { SdImage } from "../libs/shared-types/src";

export interface LqDbCollectionInput {
  // optional fields will be supplied by the server (if needed)
  id?: string;
  dateCreated?: string;

  name: string;
}

export type LqDbCollection = Required<LqDbCollectionInput>;

export interface LqDbCollectionImage {
  // optional field will be supplied by the server (if needed)
  // using number here so the server can auto generate
  id?: number;

  collectionId: string;
  imageId: string;
}

export interface LqCollection extends LqDbCollection {
  images: SdImage[];
}
