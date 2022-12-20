import { Textarea } from "@mantine/core";
import { useEffect, useState } from "react";

import { Button } from "./Button";

export function TextAreaWithButton(props: {
  onChange: (newText: string) => void;
  onIsDirtyChange?: (isDirty: boolean) => void;
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

  useEffect(() => {
    props.onIsDirtyChange?.(isDirty);
  }, [isDirty]);

  const handleCommaToPipe = () => {
    // convert all commas to pipes if they are between braces
    // iterate chars of text
    // if we see a comma, and we are in braces, then convert to pipe

    let newText = "";
    let isInBraces = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === "{") {
        isInBraces = true;
      } else if (char === "}") {
        isInBraces = false;
      } else if (char === ",") {
        if (isInBraces) {
          newText += "|";
          continue;
        }
      }
      newText += char;
    }

    setText(newText);
  };

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
        autosize
        maxRows={10}
      />
      <Button onClick={handleAccept} disabled={!isDirty}>
        accept
      </Button>
      <Button onClick={handleCommaToPipe}>comma to pipe</Button>
    </div>
  );
}
