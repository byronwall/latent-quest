import create from "zustand";
import { SdImageTransformHolder } from "../libs/shared-types/src";

import { transforms } from "./transformers";

interface AppStore {
  transformHolders: SdImageTransformHolder[];
  // updateTransformHolders: (newTransformHolders: ImageTransformHolder[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  transformHolders: transforms,
}));
