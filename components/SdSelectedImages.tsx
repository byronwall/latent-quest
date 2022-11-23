import { Button, Modal } from "@mantine/core";
import { useState } from "react";
import { IconClearAll, IconX } from "@tabler/icons";

import { isPlaceholder } from "./isPlaceholder";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";

import { useAppStore } from "../model/store";

export function SdSelectedImages() {
  const selectedImages = useAppStore((s) => s.selectedImages);
  const clearSelectedImages = useAppStore((s) => s.clearSelectedImages);

  const selKeys = Object.keys(selectedImages);

  const [modalOpened, setModalOpened] = useState(false);

  if (selKeys.length === 0) {
    return null;
  }

  return (
    <>
      <div style={{ position: "fixed", bottom: 5, right: 5, display: "flex" }}>
        <Button onClick={() => setModalOpened(true)}>
          Selected Images {selKeys.length}
        </Button>
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
