import { createContext } from "react";

import type { SdImage } from "../libs/shared-types/src";

interface SdGroupContextValue {
  groupImages: Record<string, SdImage>;
}

export const SdGroupContext = createContext<SdGroupContextValue>({
  groupImages: {},
});

// TODO: modify context so that it holds the img_gen request
// create a list of place holders in here that other pages can render
// track the group data and remove placeholders once they are in the main list
