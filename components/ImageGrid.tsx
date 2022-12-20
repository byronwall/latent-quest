import { Stack, Title } from "@mantine/core";
import { useQuery } from "react-query";

import { GroupNameViewEdit } from "./GroupNameViewEdit";
import { SdGroupContext } from "./SdGroupContext";
import { SdGroupTable } from "./SdGroupTable";
import { SdImageStudyPopover } from "./SdImageStudyPopover";
import { useGetImageGroup } from "./useGetImageGroup";
import { useGetImageGroupStudies } from "./useGetImageGroupStudies";
import { useGroupImageMap } from "./useGroupImageMap";

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

  return (
    <SdGroupContext.Provider value={{ groupImages: groupImageMap }}>
      <div>
        <div className="mx-auto flex max-w-2xl">
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
        </div>

        <Stack style={{ width: "90vw", margin: "auto" }}>
          <Title order={1}>all images in group</Title>
          <SdGroupTable data={imageGroupData} />
        </Stack>
      </div>
    </SdGroupContext.Provider>
  );
}
