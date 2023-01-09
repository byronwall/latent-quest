import { Modal } from "@mantine/core";
import { IconX } from "@tabler/icons";
import { useState } from "react";

import { Button } from "./Button";
import { isPlaceholder } from "./isPlaceholder";
import { MenuAddToCollection } from "./MenuAddToCollection";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";

import { useAppStore } from "../model/store";
import { api_addImageToCollection } from "../model/api_collections";

export function SdSelectedImages() {
  const selectedImages = useAppStore((s) => s.selectedImages);
  const clearSelectedImages = useAppStore((s) => s.clearSelectedImages);

  const selKeys = Object.keys(selectedImages);

  const [modalOpened, setModalOpened] = useState(false);

  if (selKeys.length === 0) {
    return null;
  }

  const handleAddToCollection = async (collectionId: string) => {
    await api_addImageToCollection(
      collectionId,
      Object.values(selectedImages).map((i) => i.id)
    );
  };

  return (
    <>
      <div className="fixed top-0 right-0 flex">
        <Button onClick={() => setModalOpened(true)}>
          Selected Images {selKeys.length}
        </Button>

        <MenuAddToCollection onAddToCollection={handleAddToCollection} />

        <Button onClick={clearSelectedImages} color="red" variant="subtle">
          <IconX />
        </Button>
      </div>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Selected Images"
        size="auto"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {selKeys.map((key) => {
            const image = selectedImages[key];

            return (
              <div key={key}>
                {isPlaceholder(image) ? (
                  <SdImagePlaceHolderComp size={512} placeholder={image} />
                ) : (
                  <SdImageComp
                    image={image}
                    size={512}
                    disablePopover
                    shouldShowDetails
                  />
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
