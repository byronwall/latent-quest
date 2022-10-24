import { Button, Textarea, Title, useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";

import {
  getBreakdownForText,
  getTextForBreakdown,
  PromptBreakdown,
} from "../libs/shared-types/src";
import { pickTextColorBasedOnBgColorAdvanced } from "./pickTextColorBasedOnBgColorAdvanced";
import { useControlledUncontrolled } from "./useControlledUncontrolled";

interface PromptEditorProps {
  //   initialPrompt?: string;
  //   onPromptChange: (newPrompt: string) => void;

  onBreakdownChange?: (newBreakdown: PromptBreakdown) => void;
  initialBreakdown?: PromptBreakdown;

  style?: React.CSSProperties;
}

const defaultBreakdown = { parts: [] };
export function PromptEditor(props: PromptEditorProps) {
  const { initialBreakdown, onBreakdownChange, ...rest } = props;

  // controlled and uncontrolled updates
  const [prompt, setPrompt] = useControlledUncontrolled(
    initialBreakdown,
    onBreakdownChange,
    defaultBreakdown
  );

  console.log("prompt", prompt);

  const theme = useMantineTheme();

  const simpleText = getTextForBreakdown(prompt);

  const handleRawTextChange = (newText: string) => {
    const newBreakdown = getBreakdownForText(newText);
    setPrompt(newBreakdown);
  };

  const handleChunkRemove = (index: number) => {
    const newParts = [...prompt.parts];
    newParts.splice(index, 1);
    setPrompt({
      parts: newParts,
    });
  };

  return (
    <div {...rest}>
      <Title order={2}>prompt editor</Title>
      {/* switch for isFancy */}
      <TextAreaWithButton
        defaultText={simpleText}
        onChange={handleRawTextChange}
      />
      <div>
        {prompt.parts.map((part, idx) => {
          const chunk = part.text;
          const colorName = "blue";
          const backgroundColor = theme.colors[colorName][9];
          const textColor = pickTextColorBasedOnBgColorAdvanced(
            backgroundColor,
            "#fff",
            "#000"
          );
          return (
            <>
              <div
                key={idx}
                style={{
                  backgroundColor,
                  color: textColor,
                  padding: 4,
                  borderRadius: 4,
                  margin: 4,
                  fontSize: 16,
                  display: "inline-flex",
                  gap: 4,
                }}
              >
                <span>{chunk} </span>

                <Button
                  onClick={() => handleChunkRemove(idx)}
                  compact
                  color={colorName}
                  variant="outline"
                >
                  x
                </Button>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}

function TextAreaWithButton(props: {
  onChange: (newText: string) => void;
  defaultText: string;
}) {
  const { onChange, defaultText } = props;

  const [text, setText] = useState("");

  const handleAccept = () => {
    onChange(text);
  };

  useEffect(() => {
    setText(defaultText);
  }, [defaultText]);

  const isDirty = text !== defaultText;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Textarea
        label="prompt"
        value={text}
        onChange={(evt) => setText(evt.target.value)}
        style={{ minWidth: 400, flex: 1 }}
      />
      <Button onClick={handleAccept} disabled={!isDirty}>
        accept
      </Button>
    </div>
  );
}
