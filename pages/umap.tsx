import { Umap } from "../components/Umap";
import { queryFnGetEmbeddedImages } from "../components/useGetEmbeddedImages";

import type { UmapProps } from "../components/Umap";
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const initialData = await queryFnGetEmbeddedImages({ queryKey: [] });

  const props: UmapProps = {
    images: initialData,
  };

  return {
    props,
  };
};

export default function UmapPage(props: UmapProps) {
  return (
    <>
      <div className="p-4">
        <Umap {...props} />
      </div>
    </>
  );
}
