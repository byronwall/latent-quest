import { Button, Chip, Modal, TextInput, Title } from "@mantine/core";
import { IconWindowMaximize } from "@tabler/icons";
import { orderBy, uniq, uniqBy } from "lodash-es";
import { useState } from "react";
import { useSet } from "react-use";

import { useChoices } from "../model/api_hooks";

interface SdSubChooserProps {
  onNewChoices?: (choices: string[]) => void;

  activeCategory: string;

  shouldExcludeModal?: boolean;
}

export function SdSubChooser(props: SdSubChooserProps) {
  const { onNewChoices, activeCategory, shouldExcludeModal } = props;

  // overlay interface with tabs  + tabs to pick desired items
  // main return in a prop that gives a list of SdSubChoices
  // provide some searching based on value or category

  const [isOpen, setIsOpen] = useState(false);

  const { choices: _commonChoices } = useChoices(activeCategory);

  const commonChoices = uniqBy(_commonChoices, (c) => c.value);

  const liveItems = commonChoices.filter(
    (choice) => choice.category === activeCategory
  );

  const [tagFilter, setTagFilter] = useState("");

  const [itemFilter, setItemFilter] = useState("");

  const allTags = orderBy(
    uniq(
      commonChoices
        .filter((c) => c.category === activeCategory)
        .flatMap((choice) => choice.tags)
        .map((c) => c.trim())
        .filter((c) => c.includes(tagFilter))
        .filter((c) => c.length > 0)
    ),
    (c) => c.toLowerCase()
  );

  // store an active tag
  const [activeTag, setActiveTag] = useState(allTags[0] ?? "");

  const items = orderBy(
    liveItems
      .filter(
        (item) =>
          activeTag === "" || item.tags.map((c) => c.trim()).includes(activeTag)
      )
      .filter((item) => item.value.includes(itemFilter)),
    (c) => c.value
  );

  // store itemChoices in state
  const [activeChoices, { toggle, add, has, reset }] = useSet<string>();

  const handleSelectAll = () => {
    items.forEach((item) => add(item.value));
  };

  const handleSave = () => {
    const choices = Array.from(activeChoices);
    onNewChoices?.(choices);

    setIsOpen(false);
  };

  const contents = (
    <div>
      <Title order={3}>Select {activeCategory}</Title>
      <p>Total items selected: {activeChoices.size}</p>
      <div />
      <div>
        <Button onClick={handleSave}>save choices</Button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          maxHeight: "70vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 200,
            overflow: "auto",
          }}
        >
          <div>All Tags</div>
          <div>
            <TextInput
              placeholder="filter"
              value={tagFilter}
              onChange={(evt) => setTagFilter(evt.currentTarget.value)}
            />
          </div>
          <Button compact onClick={() => setActiveTag("")}>
            show all
          </Button>
          {allTags.map((tag) => (
            <Button compact key={tag} onClick={() => setActiveTag(tag)}>
              {tag}
            </Button>
          ))}
        </div>
        <div
          style={{
            overflow: "auto",
            width: 400,
          }}
        >
          <div>
            <Button onClick={handleSelectAll}>select all</Button>
            <Button onClick={reset}>select none</Button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <p>
              showing available choices for tag:{" "}
              <b>{activeTag === "" ? "all" : activeTag}</b>
            </p>
            <TextInput
              placeholder="search"
              value={itemFilter}
              onChange={(evt) => setItemFilter(evt.currentTarget.value)}
            />
            {items.map((item) => (
              <Chip
                key={item.value}
                variant="filled"
                checked={has(item.value)}
                onChange={() => toggle(item.value)}
              >
                {item.value}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (shouldExcludeModal) {
    return contents;
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} compact>
        <IconWindowMaximize />
      </Button>

      <Modal opened={isOpen} onClose={() => setIsOpen(false)} size="auto">
        {contents}
      </Modal>
    </>
  );
}
