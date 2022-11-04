import { Button, Card } from "@mantine/core";
import axios from "axios";
import { result } from "lodash-es";
import Link from "next/link";
import { useQueryClient } from "react-query";

import { SdImage, SdImageGroup } from "../libs/shared-types/src";
import { ImageListProps } from "../pages";
import { SdImageComp } from "./SdImageComp";
import { useGetAllGroups } from "./useGetAllGroups";

export function getImageUrl(imageUrl: string): string {
  return `/api/images/s3/${imageUrl}`;
}

export interface AllGroupResponse extends SdImageGroup {
  images: (undefined | SdImage)[];
}

export function ImageList(props: ImageListProps) {
  const qc = useQueryClient();

  const initialData = props.groupList;

  const { groupList } = useGetAllGroups(initialData);

  // function post a delete based on group id

  const handleDelete = async (groupId: string) => {
    // are you sure?
    const result = window.confirm(
      "Are you sure you want to delete this group?"
    );
    if (!result) return;

    // use axios for post
    const res = await axios.delete(`/api/group/${groupId}`);

    // invalidate the query
    qc.invalidateQueries();
  };

  return (
    <div>
      <h1>image groups</h1>
      <div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {groupList.map((group) => {
            const img = group.images[0];
            if (img === undefined) {
              return null;
            }
            return (
              <Card key={group.id} style={{ border: "1px solid black" }}>
                <p>{group.view_settings.name} </p>
                <Link href={`/group/${group.id}`}>
                  <div>
                    <SdImageComp image={img} size={200} disablePopover />
                    <p>total items: {group.images.length}</p>
                  </div>
                </Link>
                <div>
                  <Button onClick={() => handleDelete(group.id)}>
                    delete...
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
