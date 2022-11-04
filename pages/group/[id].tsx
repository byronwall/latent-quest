import { GetServerSideProps, GetStaticProps } from "next";
import { ImageGrid, ImageGridProps } from "../../components/ImageGrid";
import { queryFnGetImageGroup } from "../../components/useGetImageGroup";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const groupId = params?.id as string;

  const data = await queryFnGetImageGroup({ queryKey: [groupId] });

  const props: ImageGridProps = {
    groupId,
    initialData: data,
  };

  return {
    props,
  };
};

export default function GroupPage(props: ImageGridProps) {
  return (
    <div>
      <ImageGrid {...props} />
    </div>
  );
}
