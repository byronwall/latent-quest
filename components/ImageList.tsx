import { Button, Card } from "@mantine/core";
import axios from "axios";
import Link from "next/link";
import { useQuery, useQueryClient } from "react-query";

import { SdImage } from "../libs/shared-types/src";
import { SdImageComp } from "./SdImageComp";

export function getImageUrl(imageUrl: string): string {
  return `/api/images/s3/${imageUrl}`;
}

export function ImageList() {
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery("images", async () => {
    const res = await fetch("/api/images");
    const results = (await res.json()) as SdImage[];
    results.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
    return results;
  });

  const imageGroups = (data ?? []).reduce<{ [id: string]: SdImage[] }>(
    (acc, cur) => {
      const key = cur.groupId;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(cur);

      return acc;
    },
    {}
  );

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
        {isLoading ? "loading..." : ""}
        {isError ? "error" : ""}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {(Object.keys(imageGroups) ?? []).map((id) => {
            const group = imageGroups[id];
            const img = group[0];
            return (
              <Card key={img.id} style={{ border: "1px solid black" }}>
                <Link href={`/group/${img.groupId}`}>
                  <div>
                    <SdImageComp image={img} size={200} disablePopover />
                    <p>total items = {group.length}</p>
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
