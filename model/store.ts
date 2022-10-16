import create from 'zustand';

import { ImageTransformHolder, transforms } from './transformers';

interface AppStore {
  transformHolders: ImageTransformHolder[];
  // updateTransformHolders: (newTransformHolders: ImageTransformHolder[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  transformHolders: transforms,
}));
