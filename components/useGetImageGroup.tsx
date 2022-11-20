import { useQuery } from "react-query";

import { getAbsUrl } from "./useGetAllGroups";

import type { SdImage } from "../libs/shared-types/src";

export function useGetImageGroup(groupId: string, initialData?: SdImage[]) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [groupId],
    queryFn: queryFnGetImageGroup,
    initialData,
  });

  return { imageGroup: data ?? [] };
}

export async function queryFnGetImageGroup({ queryKey }: { queryKey: any[] }) {
  const url = getAbsUrl(`/api/images/group/${queryKey[0]}`);

  const res = await fetch(url);
  const results = (await res.json()) as SdImage[];
  return results;
}
