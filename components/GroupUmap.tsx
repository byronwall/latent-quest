import { useGetEmbeddedImages } from "./useGetEmbeddedImages";
import { Umap } from "./Umap";

import type { SdImage } from "../libs/shared-types/src";

type GroupUmapProps = {
  groupId: string;

  onFilterChange: (activeImages: SdImage[]) => void;
};

export function GroupUmap(props: GroupUmapProps) {
  const { groupId, onFilterChange } = props;
  const { imageGroup, isLoading } = useGetEmbeddedImages(undefined, groupId);

  if (isLoading) {
    return <div>loading</div>;
  }

  return (
    <Umap
      images={imageGroup}
      onFilterChange={onFilterChange}
      shouldHideImages
    />
  );
}
