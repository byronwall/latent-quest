import { Button, Menu, Modal, Stack } from "@mantine/core";
import { IconZoomIn } from "@tabler/icons";
import Image from "next/image";
import { useState } from "react";

import { getSelectionAsLookup } from "./getSelectionFromPromptPart";
import { getImageUrl } from "./ImageList";
import { Switch } from "./MantineWrappers";
import { SdImageBadgeBar } from "./SdImageBadgeBar";
import { SdImageEditorPopover } from "./SdImageEditorPopover";
import { SdImageStudyPopover } from "./SdImageStudyPopover";
import { SdImageSubPopover } from "./SdImageSubPopover";
import { SdVariantMenu } from "./SdVariantMenu";

import { getTextForBreakdown } from "../libs/shared-types/src";

import type { SdVariantHandler } from "./SdCardOrTableCell";
import type { SdImage } from "../libs/shared-types/src";

type SdImageCompProps = {
  image: SdImage;
  size: number;

  disablePopover?: boolean;

  shouldShowDetails?: boolean;

  isMainImage?: boolean;

  onSetMainImage?(): void;
  onCreateVariant?: SdVariantHandler;

  imageGroupData?: SdImage[];
};

export function SdImageComp(props: SdImageCompProps) {
  const {
    image,
    size,
    disablePopover,
    onSetMainImage,
    shouldShowDetails,
    isMainImage,
    imageGroupData,
  } = props;

  // state for modal state
  const [modalOpened, setModalOpened] = useState(false);

  const selParts = getSelectionAsLookup(image);
  const selKeys = Object.keys(selParts);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState(selKeys[0]);

  const [shouldShowSources, setShouldShowSources] = useState(false);

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

                {selKeys.length > 0 && (
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
                )}

                <SdImageStudyPopover
                  mainImageId={image.id}
                  imageGroupData={imageGroupData ?? []}
                  groupId={image.groupId}
                />
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
            {(image.urlMaskSource || image.urlImageSource) && (
              <Switch
                checked={shouldShowSources}
                onChange={setShouldShowSources}
                label="show sources"
              />
            )}
            <Image src={getImageUrl(image.url)} width={512} height={512} />
            <div style={{ display: "flex" }}>
              {shouldShowSources && image.urlImageSource && (
                <Image
                  src={getImageUrl(image.urlImageSource)}
                  width={512}
                  height={512}
                />
              )}
              {shouldShowSources && image.urlMaskSource && (
                <Image
                  src={getImageUrl(image.urlMaskSource)}
                  width={512}
                  height={512}
                  style={{ border: "1px solid red" }}
                />
              )}
            </div>
            <div>
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
