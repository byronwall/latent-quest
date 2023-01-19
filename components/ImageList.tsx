import axios from "axios";
import { useQueryClient } from "react-query";
import { Loader } from "@mantine/core";

import { SdGroupPreview } from "./SdGroupPreview";
import { useGetAllGroups } from "./useGetAllGroups";
import { useInfiniteScroll } from "./useInfiniteScroll";

import type { SdImage, SdImageGroup } from "../libs/shared-types/src";
import type { ImageListProps } from "../pages";

export function getImageUrl(imageUrl: string): string {
  return `/api/images/s3/${imageUrl}`;
}

export function getImageGridUrl(groupId: string): string {
  return `/api/images/grid/${groupId}`;
}

export interface AllGroupResponse extends SdImageGroup {
  images: SdImage[];
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
    if (!result) {
      return;
    }

    // use axios for post
    const res = await axios.delete(`/api/group/${groupId}`);

    // invalidate the query
    await qc.invalidateQueries();
  };

  const { refEndOfList, visibleItems, hasMore } = useInfiniteScroll(
    groupList,
    12,
    4
  );

  return (
    <div className="mb-4 grid grid-cols-2 gap-2  sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <div className="flex flex-col gap-2 p-3">
        <h1 className="text-3xl">image groups</h1>
        <p>This page provides a list of all image groups you have created.</p>
        <p>Groups are sorted by most recently edited.</p>
      </div>
      {visibleItems.map((group) => (
        <SdGroupPreview key={group.id} group={group} />
      ))}
      <div ref={refEndOfList} className="grid place-items-center">
        {hasMore && <Loader size={64} />}
      </div>
    </div>
  );
}
