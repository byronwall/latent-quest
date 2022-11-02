import { Badge, Button, Menu, Title, useMantineTheme } from "@mantine/core";
import { useTextSelection } from "@mantine/hooks";

import {
  getBreakdownForText,
  getTextForBreakdown,
  PromptBreakdown,
  PromptPart,
} from "../libs/shared-types/src";
import { useChoiceCategories } from "../model/api_hooks";
import { getSelectionFromPromptPart } from "./getSelectionFromPromptPart";
import { getTextOnlyFromPromptPartWithLabel } from "./getTextOnlyFromPromptPartWithLabel";
import { pickTextColorBasedOnBgColorAdvanced } from "./pickTextColorBasedOnBgColorAdvanced";
import { TextAreaWithButton } from "./TextAreaWithButton";
import { useControlledUncontrolled } from "./useControlledUncontrolled";

interface PromptEditorProps {
  onBreakdownChange: (newBreakdown: PromptBreakdown) => void;
  initialBreakdown: PromptBreakdown;

  shouldAllowSelection?: boolean;

  style?: React.CSSProperties;
}

const defaultBreakdown = { parts: [] };
export function PromptEditor(props: PromptEditorProps) {
  const { initialBreakdown, onBreakdownChange, shouldAllowSelection, ...rest } =
    props;

  // controlled and uncontrolled updates
  const [prompt, setPrompt] = useControlledUncontrolled<PromptBreakdown>(
    initialBreakdown,
    onBreakdownChange,
    defaultBreakdown
  );

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

  prompt.parts.forEach((part, index) => {
    getSelectionFromPromptPart(part);
  });

  const selection = useTextSelection();

  const selectedText = selection?.toString();

  const handleCreateSubFromSelection = (name: string) => {
    if (!selectedText) {
      return;
    }

    const inBreakdown = prompt.parts.findIndex((part) => {
      return part.text.includes(selectedText);
    });

    if (inBreakdown === -1) {
      return;
    }

    if (!name) {
      return;
    }

    const newParts = prompt.parts.map((part, index) => {
      if (index === inBreakdown) {
        const newPart: PromptPart = {
          ...part,
          text: part.text.replace(selectedText, `{${name}:${selectedText}}`),
        };

        return newPart;
      }

      return part;
    });

    // this needs to update the prompt part with:
    // {name: original}

    onBreakdownChange?.({
      parts: newParts,
    });
  };

  const { categories } = useChoiceCategories();

  return (
    <div {...rest}>
      <Title order={2}>prompt editor</Title>

      <p>
        <i>
          To activate substitution, select some text and hit the button that
          appears below.
        </i>
      </p>

      <TextAreaWithButton
        defaultText={simpleText}
        onChange={handleRawTextChange}
      />

      <div>
        {prompt.parts.map((part, idx) => {
          const colorName = "blue";
          const backgroundColor = theme.colors[colorName][9];
          const textColor = pickTextColorBasedOnBgColorAdvanced(
            backgroundColor,
            "#fff",
            "#000"
          );
          return (
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
              <span>{getTextOnlyFromPromptPartWithLabel(part.text)} </span>

              {getSelectionFromPromptPart(part).map((selection, idx) => (
                <Badge key={idx} color={"red"}>
                  {selection.name}
                </Badge>
              ))}

              <Button
                onClick={() => handleChunkRemove(idx)}
                compact
                color={colorName}
                variant="outline"
              >
                x
              </Button>
            </div>
          );
        })}
      </div>
      {shouldAllowSelection && selectedText && (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button>Apply label to selection</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Available Subs</Menu.Label>
            {categories.map((category) => (
              <Menu.Item
                key={category}
                onClick={() => {
                  handleCreateSubFromSelection(category);
                }}
              >
                {category}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </div>
  );
}
