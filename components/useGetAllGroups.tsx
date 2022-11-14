import { useQuery } from "react-query";
import { AllGroupResponse } from "./ImageList";

export function useGetAllGroups(initialData?: AllGroupResponse[]) {
  const { data } = useQuery({
    queryKey: "groups",
    queryFn: queryFnGetAllGroups,
    initialData,
  });

  return { groupList: data ?? [] };
}
export async function queryFnGetAllGroups() {
  // absolute url is needed for server side
  // dev works with a hard coded url in .env
  const url = getAbsUrl("/api/group/all");

  const res = await fetch(url);

  const results = (await res.json()) as AllGroupResponse[];

  return results;
}

export function getAbsUrl(slug: string) {
  return (
    (process.env.ASSUMED_PROTOCOL ?? "") + (process.env.VERCEL_URL ?? "") + slug
  );
}
