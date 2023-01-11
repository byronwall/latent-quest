import { SdImagePage } from "../../components/SdImagePage";
import { queryFnGetImage } from "../../components/useGetImageData";

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
  return <SdImagePage {...props} />;
}
