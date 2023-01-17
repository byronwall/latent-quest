import { useQuery } from "react-query";
import { useMemo, useState } from "react";
import { IconX } from "@tabler/icons";
import { orderBy } from "lodash-es";

import { GroupNameViewEdit } from "./GroupNameViewEdit";
import { SdCardViewer } from "./SdCardViewer";
import { SdGroupContext } from "./SdGroupContext";
import { SdImageStudyPopover } from "./SdImageStudyPopover";
import { useGetImageGroup } from "./useGetImageGroup";
import { useGetImageGroupStudies } from "./useGetImageGroupStudies";
import { useGroupImageMap } from "./useGroupImageMap";
import { Button } from "./Button";
import { SdNewImagePrompt } from "./SdNewImagePrompt";

import type {
  SdImage,
  SdImageGroup,
  SdImageStudyDef,
} from "../libs/shared-types/src";

export interface ImageGridProps {
  groupId: string;
  initialData?: SdImage[];
  initialStudies?: SdImageStudyDef[];
}

export function ImageGrid(props: ImageGridProps) {
  const { groupId, initialData, initialStudies } = props;

  // create a query for 1 id

  const { imageGroup: imageGroupData } = useGetImageGroup(groupId, initialData);

  const sortedImages = useMemo(
    () => orderBy(imageGroupData, "dateCreated", "desc"),
    [imageGroupData]
  );

  const { imageGroupStudies } = useGetImageGroupStudies(
    groupId,
    initialStudies
  );

  const { data: groupData } = useQuery("group:" + groupId, async () => {
    const res = await fetch(`/api/group/${props.groupId}`);
    const results = (await res.json()) as SdImageGroup;
    return results;
  });

  const groupImageMap = useGroupImageMap(imageGroupData);

  const [shouldShowCreateForm, setShouldShowCreateForm] = useState(false);

  const createForm = (
    <div className="relative  p-2 sm:col-span-2">
      <div className="absolute top-2 right-2">
        <Button
          onClick={() => {
            setShouldShowCreateForm(false);
          }}
        >
          <IconX />
        </Button>
      </div>
      <h1>add image to group</h1>
      <SdNewImagePrompt defaultImage={sortedImages[0]} />
    </div>
  );

  const childCard = shouldShowCreateForm ? (
    createForm
  ) : (
    <div className=" flex flex-col gap-1 ">
      <GroupNameViewEdit groupData={groupData} />

      <div>
        <h2 className="text-2xl lowercase">Studies for Group</h2>
        <div className="flex flex-col gap-2">
          {imageGroupStudies.map((study) => (
            <SdImageStudyPopover
              key={study.id}
              groupId={groupId}
              imageGroupData={imageGroupData}
              initialStudyDef={study}
            />
          ))}
        </div>
      </div>
      <p className="mt-4">
        Use this view to focus on images and manage the group.
      </p>
      <Button
        onClick={() => {
          setShouldShowCreateForm(true);
        }}
      >
        add image to group
      </Button>
    </div>
  );

  return (
    <SdGroupContext.Provider value={{ groupImages: groupImageMap }}>
      <SdCardViewer imageGroupData={sortedImages} childCard={childCard} />
    </SdGroupContext.Provider>
  );
}
