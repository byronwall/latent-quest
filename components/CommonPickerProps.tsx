import type {
  SdImage,
  SdImageStudyDefSettings,
  SdImageStudyDefSettingsPrompt,
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

  // TODO: these types are rough... dial in
  settings: SdImageStudyDefSettings | SdImageStudyDefSettingsPrompt;
  onSetSettings: (
    settings: SdImageStudyDefSettings | SdImageStudyDefSettingsPrompt
  ) => void;
}
