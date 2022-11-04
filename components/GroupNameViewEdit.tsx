import { Button, TextInput } from "@mantine/core";
import { IconCircleX, IconDeviceFloppy, IconPencil } from "@tabler/icons";
import produce from "immer";
import { useState } from "react";
import { useQueryClient } from "react-query";

import { SdImageGroup } from "../libs/shared-types/src";
import { api_updateGroupData } from "../model/api";

interface GroupNameViewEditProps {
  groupData: SdImageGroup | undefined;
}

export function GroupNameViewEdit(props: GroupNameViewEditProps) {
  const { groupData } = props;

  const [isEditing, setIsEditing] = useState(false);

  const [editText, setEditText] = useState(groupData?.view_settings.name ?? "");

  const qc = useQueryClient();

  const handleSaveName = async () => {
    if (groupData === undefined) {
      return;
    }

    setIsEditing(false);

    // hit the API with the updated name

    const newGroup = produce(groupData, (draft) => {
      draft.view_settings.name = editText;
    });

    await api_updateGroupData(newGroup);

    // invalidate queries on return

    qc.invalidateQueries();
  };

  return (
    <div style={{ display: "flex" }}>
      <h1>Group: {groupData?.view_settings.name ?? groupData?.id}</h1>

      {isEditing ? (
        <div>
          <TextInput
            placeholder="enter name"
            value={editText}
            onChange={(e) => setEditText(e.currentTarget.value)}
            width={600}
          />
          <Button onClick={() => handleSaveName()}>
            <IconDeviceFloppy />
          </Button>
          <Button onClick={() => setIsEditing(false)}>
            <IconCircleX />
          </Button>
        </div>
      ) : (
        <Button onClick={() => setIsEditing(true)}>
          <IconPencil />
        </Button>
      )}
    </div>
  );
}
