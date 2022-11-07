import { Button, Modal, Stack } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";

import { getTextForBreakdown, SdImage } from "../libs/shared-types/src";
import { getImageUrl } from "./ImageList";

import { IconZoomIn } from "@tabler/icons";
import { SdImageBadgeBar } from "./SdImageBadgeBar";
import { SdVariantHandler } from "./SdCardOrTableCell";
import { SdVariantMenu } from "./SdVariantMenu";
import { SdImageModifyPopover } from "./SdImageModifyPrompt";
import { SdImageSubPopover } from "./SdImageSubPopover";
import {
  getSelectionAsLookup,
  getSelectionFromPromptPart,
} from "./getSelectionFromPromptPart";

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

  const selParts = getSelectionAsLookup(image);
  const selKeys = Object.keys(selParts);

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
                  flexWrap: "wrap",
                  maxWidth: 200,
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

                <SdImageModifyPopover defaultImage={image} />

                <>
                  {selKeys.map((key) => (
                    <SdImageSubPopover
                      key={key}
                      activeCategory={key}
                      image={image}
                    />
                  ))}
                </>
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
