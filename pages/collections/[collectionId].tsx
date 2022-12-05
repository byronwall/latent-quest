import { Title } from "@mantine/core";
import { useState } from "react";

import { queryFnGetSingleCollection } from "../../model/api_collections";
import { SdImageComp } from "../../components/SdImageComp";
import { Switch } from "../../components/MantineWrappers";

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

  const { images = [] } = collection;

  const [shouldShowControls, setShouldShowControls] = useState(false);

  return (
    <div
      style={{
        width: "90vw",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Title order={1}>{collection.name}</Title>
      <div>
        <Switch
          label="Show controls"
          checked={shouldShowControls}
          onChange={setShouldShowControls}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {images.map((image) => (
          <SdImageComp
            key={image.id}
            image={image}
            size={256}
            shouldShowDetails={shouldShowControls}
          />
        ))}
      </div>
    </div>
  );
}
