import { useQuery } from "react-query";

import { getAbsUrl } from "./useGetAllGroups";

import type { SdImage } from "../libs/shared-types/src";

export function useGetImage(imageId: string, initialData?: SdImage) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [imageId],
    queryFn: queryFnGetImage,
    initialData,
  });

  return { image: data ?? [] };
}

export async function queryFnGetImage({ queryKey }: { queryKey: any[] }) {
  console.log("queryFnGetImageGroup", queryKey);
  const url = getAbsUrl(`/api/images/${queryKey[0]}`);

  const res = await fetch(url);
  const results = (await res.json()) as SdImage;
  return results;
}
