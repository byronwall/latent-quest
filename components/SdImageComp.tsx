import { Button, Modal, Stack } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";

import { getTextForBreakdown, SdImage } from "../libs/shared-types/src";
import { getImageUrl } from "./ImageList";

// import zoom in from tabler
import { IconZoomIn } from "@tabler/icons";
import { SdImageBadgeBar } from "./SdImageBadgeBar";
import { SdVariantHandler } from "./SdCardOrTableCell";
import { SdVariantMenu } from "./SdVariantMenu";

// nextjs image
type SdImageCompProps = {
  image: SdImage;
  size: number;

  disablePopover?: boolean;

  shouldShowDetails?: boolean;

  isMainImage?: boolean;

  onSetMainImage?(): void;
  onCreateVariant?: SdVariantHandler;
};

export function SdImageComp(props: SdImageCompProps) {
  const {
    image,
    size,
    disablePopover,
    onSetMainImage,
    shouldShowDetails,
    isMainImage,
  } = props;

  // state for modal state
  const [modalOpened, setModalOpened] = useState(false);

  if (image === undefined) {
    return null;
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        <Image src={getImageUrl(image.url)} width={size} height={size} />

        {shouldShowDetails && (
          <div>
            <SdImageBadgeBar
              image={image}
              onSetMainImage={onSetMainImage}
              isMainImage={isMainImage}
            />
            {props.onCreateVariant && (
              <div
                style={{
                  display: "flex",
                  gap: 5,
                }}
              >
                <SdVariantMenu
                  image={image}
                  onCreateVariant={props.onCreateVariant}
                />

                <Button
                  compact
                  color="indigo"
                  onClick={() => props.onCreateVariant?.(image, "DALL-E")}
                >
                  DALL-E variant
                </Button>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          <Button
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              setModalOpened(true);
            }}
            variant="subtle"
          >
            <IconZoomIn />
          </Button>
        </div>
      </div>
      {!disablePopover && (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
          <Stack>
            <div>
              <Image src={getImageUrl(image.url)} width={512} height={512} />
              <div style={{ width: "100%" }}>
                {getTextForBreakdown(image.promptBreakdown)}
              </div>
            </div>
          </Stack>
        </Modal>
      )}
    </>
  );
}
