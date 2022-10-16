import { Card, SimpleGrid } from "@mantine/core";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "react-query";
import { SdImage } from "../libs/shared-types/src";

import { ImageTransformBuilder } from "./ImageTransform";
import { SdImageComp } from "./SdImageComp";

export function getImageUrl(imageUrl: string): string {
  return `/api/images/s3/${imageUrl}`;
}

export function ImageList() {
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

  return (
    <div>
      <h1>image groups</h1>
      <div>
        {isLoading ? "loading..." : ""}
        {isError ? "error" : ""}
        <SimpleGrid cols={4}>
          {(Object.keys(imageGroups) ?? []).map((id) => {
            const group = imageGroups[id];
            const img = group[0];
            return (
              <Card key={img.id}>
                <Link href={`/group/${img.groupId}`}>
                  <div>
                    <SdImageComp image={img} size={200} disablePopover />
                    <p>total items = {group.length}</p>
                  </div>
                </Link>
              </Card>
            );
          })}
        </SimpleGrid>

        <ImageTransformBuilder />
      </div>
    </div>
  );
}
