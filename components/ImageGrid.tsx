import { Stack, Title } from "@mantine/core";
import { useQuery, useQueryClient } from "react-query";

import { SdImage, SdImageGroup } from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import { GroupNameViewEdit } from "./GroupNameViewEdit";
import { SdVariantHandler } from "./SdCardOrTableCell";
import { SdGroupTable } from "./SdGroupTable";
import { SdImageStudy } from "./SdImageStudy";
import { useGetImageGroup } from "./useGetImageGroup";

export interface ImageGridProps {
  groupId: string;
  initialData?: SdImage[];
}

export function ImageGrid(props: ImageGridProps) {
  const { groupId, initialData } = props;

  // create a query for 1 id

  const { imageGroup: imageGroupData } = useGetImageGroup(groupId, initialData);

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

  const handleCreateVariant: SdVariantHandler = async (
    item,
    engine,
    strength
  ) => {
    await api_generateImage({
      ...item,
      variantSourceId: item.url,
      prevImageId: item.id,
      engine,
      variantStrength: strength,
    });

    qc.invalidateQueries();
  };

  return (
    <div>
      <div className="container">
        <GroupNameViewEdit groupData={groupData} />

        {/* <SdImageStudy
          initialStudyDef={{
            mainImageId: "a70a6f54-db9b-4b01-9045-7c3c4c05a5ab",
            rowVar: "cfg",
            colVar: "seed",
          }}
          imageGroupData={imageGroupData}
        /> */}
      </div>

      <Stack style={{ width: "90vw", margin: "auto" }}>
        <Title order={1}>all images in group</Title>
        <SdGroupTable
          data={imageGroupData}
          onCreateVariant={handleCreateVariant}
        />
      </Stack>
    </div>
  );
}
