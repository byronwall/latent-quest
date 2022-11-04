import { Button, Card } from "@mantine/core";
import axios from "axios";
import { result } from "lodash-es";
import Link from "next/link";
import { useQuery, useQueryClient } from "react-query";

import { SdImage, SdImageGroup } from "../libs/shared-types/src";
import { SdImageComp } from "./SdImageComp";

export function getImageUrl(imageUrl: string): string {
  return `/api/images/s3/${imageUrl}`;
}

interface AllGroupResponse extends SdImageGroup {
  images: (undefined | SdImage)[];
}

export function ImageList() {
  const qc = useQueryClient();

  const { groupList } = useGetAllGroups();

  // function post a delete based on group id

  const handleDelete = async (groupId: string) => {
    // use axios for post
    const res = await axios.delete(`/api/group/${groupId}`);

    // invalidate the query
    qc.invalidateQueries("images");
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
                  <Button onClick={() => handleDelete(img.groupId)}>
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
function useGetAllGroups() {
  const { data } = useQuery("groups", async () => {
    const res = await fetch("/api/group/all");

    const rsults = (await res.json()) as AllGroupResponse[];

    return rsults;
  });

  return { groupList: data ?? [] };
}
