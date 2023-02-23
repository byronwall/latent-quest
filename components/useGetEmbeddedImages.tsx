import { useQuery } from "react-query";

import { getAbsUrl } from "./useGetAllGroups";

import type { SdImage } from "../libs/shared-types/src";

export function useGetEmbeddedImages(initialData?: SdImage[]) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [],
    queryFn: queryFnGetEmbeddedImages,
    initialData,
  });

  return { imageGroup: data ?? [] };
}

export async function queryFnGetEmbeddedImages({
  queryKey,
}: {
  queryKey: any[];
}) {
  console.log("queryFnGetEmbeddedImages", queryKey);
  const url = getAbsUrl(`/api/images/embedding/images`);

  const res = await fetch(url);
  const results = (await res.json()) as SdImage[];
  return results;
}
