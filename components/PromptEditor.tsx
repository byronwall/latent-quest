import { Textarea } from "@mantine/core";
import { useEffect, useState } from "react";

import { useControlledUncontrolled } from "./useControlledUncontrolled";

import {
  getBreakdownForText,
  getTextForBreakdown,
} from "../libs/shared-types/src";

import type { PromptBreakdown } from "../libs/shared-types/src";

interface PromptEditorProps {
  onBreakdownChange: (newBreakdown: PromptBreakdown) => void;
  initialBreakdown: PromptBreakdown;

  shouldAllowSelection?: boolean;

  onIsDirtyChange?: (isDirty: boolean) => void;
}

const defaultBreakdown = { parts: [] };
export function PromptEditor(props: PromptEditorProps) {
  const { initialBreakdown, onBreakdownChange, shouldAllowSelection } = props;

  // controlled and uncontrolled updates
  const [prompt, setPrompt] = useControlledUncontrolled<PromptBreakdown>(
    initialBreakdown,
    onBreakdownChange,
    defaultBreakdown
  );

  const simpleText = getTextForBreakdown(prompt);

  const [promptText, setPromptText] = useState(simpleText);

  useEffect(() => {
    // update breakdown when text changes
    const newBreakdown = getBreakdownForText(promptText);

    setPrompt(newBreakdown);
  }, [promptText, setPrompt]);

  return (
    <Textarea
      label="prompt"
      value={promptText}
      onChange={(evt) => setPromptText(evt.currentTarget.value)}
      autosize
      maxRows={10}
      minRows={3}
    />
  );
}
