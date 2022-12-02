import { Stack, Title } from "@mantine/core";
import { useQuery, useQueryClient } from "react-query";

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

  // push group data into the default view

  // store the main image in state

  // take those images and push into a table -- by default 3x3 with single image in center

  // this is an array of arrays
  // this will eventually by built by checking the CFG or prompt or other details

  const qc = useQueryClient();

  const groupImageMap = useGroupImageMap(imageGroupData);

  return (
    <SdGroupContext.Provider value={{ groupImages: groupImageMap }}>
      <div>
        <div className="container">
          <GroupNameViewEdit groupData={groupData} />
        </div>

        <div className="container">
          <Title order={3}>Studies for Group</Title>
          <Stack>
            {imageGroupStudies.map((study) => (
              <SdImageStudyPopover
                key={study.id}
                groupId={groupId}
                imageGroupData={imageGroupData}
                initialStudyDef={study}
              />
            ))}
          </Stack>
        </div>

        <Stack style={{ width: "90vw", margin: "auto" }}>
          <Title order={1}>all images in group</Title>
          <SdGroupTable data={imageGroupData} />
        </Stack>
      </div>
    </SdGroupContext.Provider>
  );
}
