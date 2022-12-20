import { Menu } from "@mantine/core";
import { IconCaretUp } from "@tabler/icons";

import { Button } from "./Button";

import { useGetCollections } from "../model/api_collections";

interface MenuAddToCollectionProps {
  onAddToCollection: (collectionId: string) => void;
}

export function MenuAddToCollection(props: MenuAddToCollectionProps) {
  const { onAddToCollection } = props;
  const { collections } = useGetCollections();

  return (
    <Menu>
      <Menu.Target>
        <Button rightIcon={<IconCaretUp />}>add to collection</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>choose collection</Menu.Label>
        {collections.map((collection) => (
          <Menu.Item
            key={collection.id}
            onClick={() => onAddToCollection(collection.id)}
          >
            {collection.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
