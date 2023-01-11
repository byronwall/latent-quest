import Head from "next/head";

import { SdImagePage } from "../../components/SdImagePage";
import { queryFnGetImage } from "../../components/useGetImageData";
import { getImageUrl } from "../../components/ImageList";

import type { GetServerSideProps } from "next";
import type { SdImagePageProps } from "../../components/SdImagePage";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const imageId = params?.imageId as string;

  const initialImage = await queryFnGetImage({ queryKey: [imageId] });

  const props: SdImagePageProps = {
    initialImage,
  };

  return {
    props,
  };
};

export default function GroupPage(props: SdImagePageProps) {
  return (
    <>
      <Head>
        <title>Latent Quest Image</title>
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
        <meta
          property="og:image"
          content={getImageUrl(props.initialImage.url)}
        />
      </Head>
      <SdImagePage {...props} />
    </>
  );
}
