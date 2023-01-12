import Head from "next/head";

import { ImageGrid } from "../../components/ImageGrid";
import { getImageGridUrl } from "../../components/ImageList";
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
  return (
    <>
      <Head>
        <title>Latent Quest Group</title>
        <meta
          name="description"
          content="A tool for exploring generative art."
          key="desc"
        />
        <meta property="og:title" content="Latent Quest Image" />
        <meta
          property="og:description"
          content="A tool for exploring generative art."
        />
        <meta property="og:image" content={getImageGridUrl(props.groupId)} />
      </Head>
      <ImageGrid {...props} />
    </>
  );
}
