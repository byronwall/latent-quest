import { Button, TextInput, Title } from "@mantine/core";
import {
  IconCaretDown,
  IconDeviceFloppy,
  IconPencil,
  IconX,
} from "@tabler/icons";
import { useState } from "react";

interface ViewOrEditProps {
  value: string;
  onChange: (newValue: string) => void;
}

export function ViewOrEdit(props: ViewOrEditProps) {
  const { value, onChange } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(value);

  const handleAccept = () => {
    setIsEditing(false);
    onChange(editText);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(value);
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Title>{value}</Title>
        <Button
          variant="subtle"
          compact
          onClick={() => setIsEditing(!isEditing)}
        >
          <IconPencil />
          <IconCaretDown />
        </Button>
      </div>
      {isEditing && (
        <div style={{ display: "flex" }}>
          <TextInput
            value={editText}
            onChange={(e) => setEditText(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleAccept} rightIcon={<IconDeviceFloppy />}>
            update
          </Button>
          <Button onClick={handleCancel}>
            <IconX />
          </Button>
        </div>
      )}
    </div>
  );
}
