import { Button, Loader, TextInput, Title } from "@mantine/core";
import { useState } from "react";
import { useQueryClient } from "react-query";
import Link from "next/link";

import {
  api_createCollection,
  api_deleteCollection,
  queryFnGetCollections,
  useGetCollections,
} from "../../model/api_collections";
import { api_deleteStudy } from "../../model/api";

import type { LqDbCollection } from "../../model/collections";
import type { GetServerSideProps } from "next";

interface CollectionsIndexPageProps {
  // TODO: real props will include the list of collections
  initialCollections: LqDbCollection[];
}

export const getServerSideProps: GetServerSideProps<
  CollectionsIndexPageProps
> = async ({ params }) => {
  const initialCollections = await queryFnGetCollections({});

  return {
    props: {
      initialCollections,
    },
  };
};

export default function CollectionsIndexPage(props: CollectionsIndexPageProps) {
  const { initialCollections } = props;

  const [newName, setNewName] = useState("");

  const { collections } = useGetCollections(initialCollections);

  const qc = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);

  const handleNewCollection = async () => {
    // fire off a request to create a new collection

    setIsSaving(true);

    await api_createCollection({
      name: newName,
    });

    qc.invalidateQueries("collections");

    setIsSaving(false);
    setNewName("");

    // refresh list of collections
  };

  const handleDeleteClick = async (collection: LqDbCollection) => {
    // fire off a request to delete a collection

    const shouldDelete = confirm(
      "Are you sure you want to delete this collection?"
    );

    if (!shouldDelete) {
      return;
    }

    await api_deleteCollection(collection);

    qc.invalidateQueries("collections");
  };

  return (
    <div style={{ width: "90vw", margin: "auto" }}>
      <Title order={1}>collections</Title>

      <div>
        <Title order={2}>create new collection</Title>
        <div style={{ display: "flex" }}>
          <TextInput
            value={newName}
            onChange={(event) => setNewName(event.currentTarget.value)}
          />
          {isSaving ? (
            <Loader />
          ) : (
            <Button onClick={handleNewCollection}>create</Button>
          )}
        </div>
      </div>

      <div>
        <Title order={2}>existing collections</Title>

        <ul>
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link href={`/collections/${collection.id}`}>
                {collection.name}
              </Link>

              <Button
                onClick={() => handleDeleteClick(collection)}
                color="red"
                compact
              >
                delete...
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
