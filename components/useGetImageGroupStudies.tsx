import { useQuery } from "react-query";

import { getAbsUrl } from "./useGetAllGroups";

import type { QueryKey } from "react-query";
import type { SdImageStudyDef } from "../libs/shared-types/src";

// create the same hook and query function as above for study defs

export function useGetImageGroupStudies(
  groupId: string,
  initialData?: SdImageStudyDef[]
) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["studies", groupId],
    queryFn: queryFnGetImageGroupStudies,
    initialData,
  });

  return { imageGroupStudies: data ?? [] };
}

type ImageGroupQueryKey = {
  queryKey: QueryKey;
};

export async function queryFnGetImageGroupStudies({
  queryKey,
}: ImageGroupQueryKey) {
  const url = getAbsUrl(`/api/studies/for_group/${queryKey[1]}`);

  const res = await fetch(url);
  const results = (await res.json()) as SdImageStudyDef[];
  return results;
}
