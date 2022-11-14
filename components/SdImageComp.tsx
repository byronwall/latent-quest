import { Button, Menu, Modal, Stack } from "@mantine/core";
import { IconZoomIn } from "@tabler/icons";
import Image from "next/image";
import { useState } from "react";

import { getTextForBreakdown, SdImage } from "../libs/shared-types/src";
import { getSelectionAsLookup } from "./getSelectionFromPromptPart";
import { getImageUrl } from "./ImageList";
import { SdVariantHandler } from "./SdCardOrTableCell";
import { SdImageBadgeBar } from "./SdImageBadgeBar";
import { SdImageEditorPopover } from "./SdImageEditorPopover";
import { SdImageSubPopover } from "./SdImageSubPopover";
import { SdVariantMenu } from "./SdVariantMenu";

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

  const selParts = getSelectionAsLookup(image);
  const selKeys = Object.keys(selParts);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState(selKeys[0]);

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
                  flexWrap: "wrap",
                  maxWidth: 200,
                  gap: 5,
                }}
              >
                <SdVariantMenu
                  image={image}
                  onCreateVariant={props.onCreateVariant}
                />

                <SdImageEditorPopover image={image} />

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button compact color="green">
                      subs...
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>pick category...</Menu.Label>
                    {selKeys.map((key) => (
                      <Menu.Item
                        key={key}
                        onClick={() => {
                          setActiveCategory(key);
                          setIsModalOpen(true);
                        }}
                      >
                        {key}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
            )}
          </div>
        )}

        <SdImageSubPopover
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          activeCategory={activeCategory}
          image={image}
        />

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
