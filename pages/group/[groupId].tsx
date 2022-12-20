import { ImageGrid } from "../../components/ImageGrid";
import { queryFnGetImageGroup } from "../../components/useGetImageGroup";
import { queryFnGetImageGroupStudies } from "../../components/useGetImageGroupStudies";

import type { GetServerSideProps } from "next";
import type { ImageGridProps } from "../../components/ImageGrid";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const groupId = params?.groupId as string;

  const initialData = await queryFnGetImageGroup({ queryKey: [groupId] });

  const initialStudies = await queryFnGetImageGroupStudies({
    queryKey: ["studies", groupId],
  });

  const props: ImageGridProps = {
    groupId,
    initialData,
    initialStudies,
  };

  return {
    props,
  };
};

export default function GroupPage(props: ImageGridProps) {
  return <ImageGrid {...props} />;
}
