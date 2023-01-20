import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

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
    <div>
      <div className="flex gap-2">
        <label
          htmlFor="prompt"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          prompt
        </label>
        <p
          className="cursor-pointer text-sm text-red-800 hover:text-red-600"
          onClick={() => {
            setPromptText("");
          }}
        >
          clear
        </p>
      </div>
      <TextareaAutosize
        id="prompt"
        maxRows={10}
        value={promptText}
        onChange={(evt) => setPromptText(evt.currentTarget.value)}
        placeholder="Enter your prompt: photograph of a bear"
        className="block max-h-96 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5  text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      />
    </div>
  );
}
