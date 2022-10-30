import { Button, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";

export function TextAreaWithButton(props: {
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
        autosize
        maxRows={10}
      />
      <Button onClick={handleAccept} disabled={!isDirty}>
        accept
      </Button>
    </div>
  );
}
