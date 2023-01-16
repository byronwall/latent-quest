import axios from "axios";
import { useQueryClient } from "react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrevious } from "react-use";

import { SdGroupPreview } from "./SdGroupPreview";
import { useGetAllGroups } from "./useGetAllGroups";
import useOnScreen from "./useOnScreen";

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

  const [visibleCount, setVisibleCount] = useState(12);

  const refEndOfList = useRef<HTMLDivElement>(null);

  const isVisible = useOnScreen(refEndOfList);

  const visibleItems = useMemo(
    () => groupList.slice(0, visibleCount),
    [groupList, visibleCount]
  );

  const prevImageCount = usePrevious(visibleCount);

  useEffect(() => {
    const didCountChange = prevImageCount !== visibleCount;

    if (didCountChange) {
      return;
    }

    if (isVisible) {
      setVisibleCount((prev) => prev + 12);
    }
  }, [isVisible, prevImageCount, visibleCount]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2  sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div className="flex flex-col gap-2 p-3">
          <h1 className="text-3xl">image groups</h1>
          <p>This page provides a list of all image groups you have created.</p>
          <p>Groups are sorted by most recently edited.</p>
        </div>
        {visibleItems.map((group) => (
          <SdGroupPreview key={group.id} group={group} />
        ))}
      </div>
      <div ref={refEndOfList} className="mb-4 p-3" />
    </div>
  );
}
