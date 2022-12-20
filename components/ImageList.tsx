import axios from "axios";
import Link from "next/link";
import { useQueryClient } from "react-query";

import { SdImageComp } from "./SdImageComp";
import { useGetAllGroups } from "./useGetAllGroups";

import type { SdImage, SdImageGroup } from "../libs/shared-types/src";
import type { ImageListProps } from "../pages";

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
    await qc.invalidateQueries();
  };

  return (
    <div>
      <div>
        <div className="grid grid-cols-2 gap-2  sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col gap-2 p-3">
            <h1 className="text-3xl">image groups</h1>
            <p>
              This page provides a list of all image groups you have created.
            </p>
          </div>
          {groupList.map((group) => {
            const img = group.images[0];
            if (img === undefined) {
              return null;
            }
            return (
              <div key={group.id} className="p-3">
                <Link href={`/group/${group.id}`}>
                  <div className="cursor-pointer hover:ring-2">
                    <SdImageComp image={img} size={256} disablePopover />
                    <p>total items: {group.images.length}</p>
                  </div>
                </Link>
                <p>{group.view_settings.name} </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
