import { createContext } from "react";

import type { SdImage } from "../libs/shared-types/src";

interface SdGroupContextValue {
  groupImages: Record<string, SdImage>;
}

export const SdGroupContext = createContext<SdGroupContextValue>({
  groupImages: {},
});
