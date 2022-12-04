import create from "zustand";

import { getUniversalIdFromImage } from "../libs/helpers";

import type { SdImage } from "../libs/shared-types/src";

interface AppStore {
  selectedImages: Record<string, SdImage>;

  toggleSelectedImage: (image: SdImage) => void;
  clearSelectedImages: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedImages: {},

  toggleSelectedImage: (image: SdImage) => {
    set((state) => {
      const { selectedImages } = state;

      const newSelectedImages = { ...selectedImages };

      const id = getUniversalIdFromImage(image);

      if (newSelectedImages[id]) {
        delete newSelectedImages[id];
      } else {
        newSelectedImages[id] = image;
      }

      return { selectedImages: newSelectedImages };
    });
  },

  clearSelectedImages: () => {
    set({ selectedImages: {} });
  },
}));
