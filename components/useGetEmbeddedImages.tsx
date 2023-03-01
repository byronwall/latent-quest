import { useQuery } from "react-query";

import { api_getUmapImages } from "../model/api_images";

import type { SdImage } from "../libs/shared-types/src";

export function useGetEmbeddedImages(
  initialData?: SdImage[],
  groupId?: string
) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: groupId ? ["embeddings", groupId] : ["embeddings"],
    queryFn: queryFnGetEmbeddedImages,
    initialData,
  });

  return { imageGroup: data ?? [], isLoading };
}

export async function queryFnGetEmbeddedImages({
  queryKey,
}: {
  queryKey: any[];
}) {
  return api_getUmapImages({ groupId: queryKey[1] });
}
