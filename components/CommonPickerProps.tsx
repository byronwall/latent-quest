import type {
  SdImage,
  SdImageStudyDefSettings,
} from "../libs/shared-types/src";

export interface CommonPickerProps<T> {
  mainImage: SdImage;

  rowColVar: string;

  choices: T[];
  onAddItem: (cfg: T | T[]) => void;
  onResetChoices: () => void;

  forcedChoices?: T[];
  onSetForcedChoice: (cfg: T[]) => void;

  exclusions: T[];
  onSetExclusion: (cfg: T[]) => void;

  settings: SdImageStudyDefSettings;
  onSetSettings: (settings: SdImageStudyDefSettings) => void;
}
