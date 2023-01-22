import { useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { usePrevious } from "react-use";

interface PromptEditorProps {
  initialPromptText: string;
  onPromptTextChange: (newPromptText: string) => void;
}

export function PromptEditor(props: PromptEditorProps) {
  const { initialPromptText, onPromptTextChange } = props;

  const promptText = initialPromptText;
  const setPromptText = onPromptTextChange;

  const prevInitialPromptText = usePrevious(initialPromptText);
  const prevPromptText = usePrevious(promptText);

  useEffect(() => {
    if (initialPromptText !== prevInitialPromptText) {
      setPromptText(initialPromptText);
    }

    const didPromptChange = promptText !== prevPromptText;
    const isStateDiffThanProps = promptText !== initialPromptText;
    if (didPromptChange && isStateDiffThanProps) {
      onPromptTextChange(promptText);
    }
  }, [
    promptText,
    onPromptTextChange,
    initialPromptText,
    prevInitialPromptText,
    prevPromptText,
    setPromptText,
  ]);

  console.log("prompt", promptText);

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
