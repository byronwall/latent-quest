import produce from "immer";

import { Switch } from "./MantineWrappers";

import type { SdImageStudyDefSettingsPrompt } from "../libs/shared-types/src";
import type { CommonPickerProps } from "./CommonPickerProps";

type PromptPickerProps = CommonPickerProps<string> & {
  settings: SdImageStudyDefSettingsPrompt;
};

export function PromptPicker(props: PromptPickerProps) {
  const { settings, onSetSettings } = props;

  const { shouldShowFullPrompt = true } = settings;

  const handleShowFullToggle = (newVal: boolean) => {
    onSetSettings(
      produce(settings, (draft) => {
        draft.shouldShowFullPrompt = newVal;
      })
    );
  };

  return (
    <div style={{ display: "flex" }}>
      prompt picker
      <Switch
        label="show full prompt"
        checked={shouldShowFullPrompt}
        onChange={handleShowFullToggle}
      />
    </div>
  );
}
