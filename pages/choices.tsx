import { Button, Select, Textarea, TextInput, Title } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { useQueryClient } from "react-query";

import { SdSubChooser } from "../components/SdSubChooser";
import { useChoiceCategories, useChoices } from "../model/api_hooks";

export default function Choices() {
  // get all via react query

  const qc = useQueryClient();

  const removeNumRegex = /^\d+\./g;
  const handleGroupAdd = async () => {
    // build an array of SdSubChoice
    const newValues = groupValues
      .split("\n")
      .map((c) => {
        return {
          value: c.replaceAll(removeNumRegex, "").trim(),
          category: groupTitle,
          tags: [],
        };
      })
      .filter((c) => c.value.length > 0);

    console.log("newValues", newValues);

    const res = await axios.post("/api/choices/group-add", newValues);

    await qc.invalidateQueries();
  };

  // groupTitle in state
  const [groupTitle, setGroupTitle] = useState("");

  // groupValues in state
  const [groupValues, setGroupValues] = useState("");

  // activeCategory in state
  const [activeCategory, setActiveCategory] = useState("");

  const { choices } = useChoices(activeCategory);

  const { categories } = useChoiceCategories();

  return (
    <div className="container">
      <div>
        <Title order={2} title="add new group" />
        <TextInput
          placeholder="group name"
          label="group name"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.currentTarget.value)}
        />
        <Textarea
          placeholder="group description"
          label="all values \n"
          autosize
          maxRows={12}
          value={groupValues}
          onChange={(e) => setGroupValues(e.currentTarget.value)}
        />
        <Button onClick={handleGroupAdd}>Add</Button>
      </div>
      <Select
        label="Select multiple values"
        placeholder="Select multiple values"
        data={categories}
        value={activeCategory}
        onChange={(e) => setActiveCategory(e ?? "")}
      />
      <SdSubChooser shouldExcludeModal activeCategory={activeCategory} />
    </div>
  );
}
