import { Title } from "@mantine/core";

import { queryFnGetSingleCollection } from "../../model/api_collections";
import { SdImageComp } from "../../components/SdImageComp";

import type { LqCollection } from "../../model/collections";
import type { GetServerSideProps } from "next";

interface CollectionPageProps {
  collection: LqCollection;
}

export const getServerSideProps: GetServerSideProps<
  CollectionPageProps
> = async ({ params }) => {
  const collectionId = params?.collectionId as string;

  const collection = await queryFnGetSingleCollection({
    queryKey: ["collection", collectionId],
  });

  return {
    props: {
      collection,
    },
  };
};

export default function CollectionPage(props: CollectionPageProps) {
  const { collection } = props;

  const { images } = collection;

  return (
    <div style={{ width: "90vw", margin: "auto" }}>
      <Title order={1}>{collection.name}</Title>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {images.map((image) => (
          <SdImageComp key={image.id} image={image} size={256} />
        ))}
      </div>
    </div>
  );
}
