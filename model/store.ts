import produce from "immer";
import create from "zustand";

import { api_generateImage } from "./api";

import { getUniversalIdFromImage } from "../libs/helpers";

import type { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";

interface AppStore {
  selectedImages: Record<string, SdImage>;

  toggleSelectedImage: (image: SdImage) => void;
  clearSelectedImages: () => void;

  pendingImages: SdImagePlaceHolder[];

  createImageRequest: (image: SdImagePlaceHolder) => Promise<SdImage>;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedImages: {},
  pendingImages: [],

  createImageRequest: async (image) => {
    // generate placeholders so comps can update
    set(
      produce((draft) => {
        const { pendingImages } = draft;
        pendingImages.push(image);
      })
    );

    // do the actual request
    const result = await api_generateImage(image);

    // remove the placeholder
    set(
      produce((draft) => {
        const { pendingImages } = draft;

        const index = pendingImages.findIndex((img) => img.id === image.id);

        pendingImages.splice(index, 1);
      })
    );

    return result[0];
  },

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
