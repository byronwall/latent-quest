import { Badge, Button, Modal, Stack, Tooltip } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";

import { getTextForBreakdown, SdImage } from "../libs/shared-types/src";
import { getImageUrl } from "./ImageList";

// import zoom in from tabler
import { IconTextRecognition, IconZoomIn } from "@tabler/icons";

// nextjs image
type SdImageCompProps = {
  image: SdImage;
  size: number;

  disablePopover?: boolean;

  shouldShowDetails?: boolean;

  isMainImage?: boolean;

  onSetMainImage?(): void;
};

export function SdImageComp(props: SdImageCompProps) {
  // des props
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
            <p style={{ display: "flex" }}>
              <Tooltip label="cfg">
                <Badge>{image.cfg}</Badge>
              </Tooltip>
              <Tooltip label="seed">
                <Badge>{image.seed}</Badge>
              </Tooltip>
              <Tooltip
                label={getTextForBreakdown(image.promptBreakdown)}
                width={400}
                color="blue"
                position="bottom"
                multiline
              >
                <Badge>
                  <IconTextRecognition />
                </Badge>
              </Tooltip>
              {onSetMainImage && (
                <Badge
                  color={isMainImage ? "green" : "blue"}
                  onClick={() => onSetMainImage()}
                >
                  main
                </Badge>
              )}
            </p>
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
