import { IconX } from "@tabler/icons";
import axios from "axios";
import { orderBy, shuffle } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";

import { Button } from "./Button";
import { GroupNameViewEdit } from "./GroupNameViewEdit";
import { GroupUmap } from "./GroupUmap";
import { Switch } from "./MantineWrappers";
import { SdCardViewer } from "./SdCardViewer";
import { SdGroupContext } from "./SdGroupContext";
import { SdImageStudyPopover } from "./SdImageStudyPopover";
import { SdNewImagePrompt } from "./SdNewImagePrompt";
import { useGetImageGroup } from "./useGetImageGroup";
import { useGetImageGroupStudies } from "./useGetImageGroupStudies";
import { useGroupImageMap } from "./useGroupImageMap";

import { useAppStore } from "../model/store";

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

  const pendingImages = useAppStore((s) => s.pendingImages);

  const pendingForGroup = pendingImages.filter(
    (item) => item.groupId === groupId
  );

  const [filteredImages, setFilteredImages] = useState(imageGroupData);

  useEffect(() => {
    setFilteredImages(imageGroupData);
  }, [imageGroupData]);

  const sortedImages = useMemo(
    () => orderBy(filteredImages, "dateCreated", "desc"),
    [filteredImages]
  );

  const { imageGroupStudies } = useGetImageGroupStudies(
    groupId,
    initialStudies
  );

  const { data: groupData } = useQuery(`group:${groupId}`, async () => {
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

  // count of images with null embedding
  const imagesWithNullEmbedding = imageGroupData.filter(
    (c) => c.embedding === null
  );

  const qc = useQueryClient();

  const [isLoadingEmbedding, setIsLoadingEmbedding] = useState(false);

  const handleBulkMissingEmbeddings = async () => {
    // take 10 items from the list and hit API endpoint
    const items = shuffle(imagesWithNullEmbedding).slice(0, 20);

    setIsLoadingEmbedding(true);

    // convert items to list of promises
    const promises = items.map((image) => {
      return axios.post(`/api/images/embedding/${image.id}`);
    });

    // wait for all promises to resolve
    await Promise.all(promises);

    // invalidate query
    qc.invalidateQueries();

    setIsLoadingEmbedding(false);
  };

  const [shouldShowUmap, setShouldShowUmap] = useState(false);

  const hasEmbeddings = imageGroupData.some((c) => c.embedding !== null);
  const someImageNeedsEmbedding = imagesWithNullEmbedding.length > 0;

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
      {isLoadingEmbedding ? (
        <p>loading embeddings...</p>
      ) : (
        someImageNeedsEmbedding && (
          <Button onClick={handleBulkMissingEmbeddings}>
            load embeddings ({imagesWithNullEmbedding.length})
          </Button>
        )
      )}
      {hasEmbeddings && (
        <Switch onChange={setShouldShowUmap} label="show umap?" />
      )}
    </div>
  );

  const umapChild = shouldShowUmap ? (
    <div className="col-span-2 flex ">
      <GroupUmap groupId={groupId} onFilterChange={setFilteredImages} />
    </div>
  ) : null;

  return (
    <SdGroupContext.Provider value={{ groupImages: groupImageMap }}>
      <SdCardViewer
        imageGroupData={sortedImages}
        placeholderImages={pendingForGroup}
        childCard={childCard}
        childCard2={umapChild}
      />
    </SdGroupContext.Provider>
  );
}
