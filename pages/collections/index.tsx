import { Loader, TextInput } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "react-query";

import { Button } from "../../components/Button";
import { SimpleLayout } from "../../components/SimpleLayout";
import {
  api_createCollection,
  api_deleteCollection,
  queryFnGetCollections,
  useGetCollections,
} from "../../model/api_collections";

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
    <SimpleLayout
      title="collections"
      description="Use collections to organize images.  To add images you must first create an empty collection."
      rightChild={
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl">create new collection</h2>
            <div className="flex gap-2">
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

          <div className="flex flex-col gap-2">
            <h2 className="text-xl">existing collections</h2>

            <ul className="space-y-2">
              {collections.map((collection) => (
                <li key={collection.id} className="flex items-center gap-2">
                  <Link href={`/collections/${collection.id}`}>
                    <a className="hover:text-blue-600">{collection.name}</a>
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
      }
    />
  );
}
