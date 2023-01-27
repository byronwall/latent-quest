import { CopyButton, Modal, Stack } from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconX,
  IconZoomIn,
} from "@tabler/icons";
import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { useQueryClient } from "react-query";

import { Button } from "./Button";
import { getSelectionAsLookup } from "./getSelectionFromPromptPart";
import { getImageUrl } from "./ImageList";
import { Switch } from "./MantineWrappers";
import { SdImageBadgeBar } from "./SdImageBadgeBar";
import { SdImageEditorPopover } from "./SdImageEditorPopover";
import { SdImageStudyPopover } from "./SdImageStudyPopover";
import { SdImageSubPopover } from "./ImageSub/SdImageSubPopover";
import { SdVariantPopover } from "./SdVariantMenu";
import { createInspirationFromImage } from "./InspirationMgr";

import { useAppStore } from "../model/store";
import { api_deleteImage } from "../model/api_images";
import { getTextForBreakdown } from "../libs/shared-types/src";
import { getUniversalIdFromImage } from "../libs/helpers";

import type { SdImage } from "../libs/shared-types/src";

export type SdImageOrPlaceholderCommonProps = {
  size: number;
};

export type SdImageCompProps = SdImageOrPlaceholderCommonProps & {
  image: SdImage;

  disablePopover?: boolean;

  shouldShowDetails?: boolean;

  isMainImage?: boolean;

  imageGroupData?: SdImage[];
};

function _SdImageComp(props: SdImageCompProps) {
  const {
    image,
    size,
    disablePopover,
    shouldShowDetails,
    isMainImage,
    imageGroupData,
  } = props;

  // state for modal state
  const [modalOpened, setModalOpened] = useState(false);

  const selParts = getSelectionAsLookup(image);
  const selKeys = Object.keys(selParts);

  const [shouldShowSources, setShouldShowSources] = useState(false);

  const selectedImages = useAppStore((s) => s.selectedImages);
  const toggleSelectedImage = useAppStore((s) => s.toggleSelectedImage);

  const isSelected =
    selectedImages[getUniversalIdFromImage(image)] !== undefined;

  const qc = useQueryClient();

  if (image === undefined) {
    return null;
  }

  const handleDeleteClick = async () => {
    // prompt to confirm
    const shouldDelete = confirm(
      "Are you sure you want to delete this image?  This cannot be undone and will remove the image instantly."
    );
    if (!shouldDelete) {
      return;
    }

    // delete image -- fire off API request and refresh data
    await api_deleteImage(image);

    qc.invalidateQueries();
  };

  return (
    <>
      <div className="group relative">
        <div>
          <Link href={`/image/${image.id}`} passHref>
            <Image
              src={getImageUrl(image.url)}
              width={size}
              height={size}
              className="rounded-md"
              alt=""
            />
          </Link>
        </div>

        <div className="opacity-0 group-hover:opacity-100">
          {shouldShowDetails && (
            <div className="absolute bottom-0 p-1">
              <SdImageBadgeBar image={image} isMainImage={isMainImage} />

              <div className="flex flex-wrap gap-2">
                <SdVariantPopover image={image} />

                <SdImageEditorPopover image={image} />

                <SdImageStudyPopover
                  mainImageId={image.id}
                  imageGroupData={imageGroupData ?? []}
                  groupId={image.groupId}
                />

                <SdImageSubPopover
                  availableCategories={selKeys}
                  image={image}
                />

                <CopyButton
                  value={JSON.stringify(
                    createInspirationFromImage(image),
                    undefined,
                    2
                  )}
                >
                  {({ copied, copy }) => (
                    <Button onClick={copy}>
                      {copied ? "Copied url" : "Copy url"}
                    </Button>
                  )}
                </CopyButton>

                <Button onClick={handleDeleteClick}>
                  <IconX />
                </Button>
              </div>
            </div>
          )}

          <div className="absolute top-0 right-0">
            <Button
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                setModalOpened(true);
              }}
            >
              <IconZoomIn />
            </Button>
          </div>
          <div className="absolute top-0 left-0">
            <Button
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                toggleSelectedImage(image);
              }}
              color={isSelected ? "blue" : "gray"}
            >
              {isSelected ? <IconCircleCheck /> : <IconCircleDashed />}
            </Button>
          </div>
        </div>
      </div>
      {!disablePopover && (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
          <Stack>
            <SdImageBadgeBar image={image} isMainImage={isMainImage} />
            {(image.urlMaskSource || image.urlImageSource) && (
              <Switch
                checked={shouldShowSources}
                onChange={setShouldShowSources}
                label="show sources"
              />
            )}
            <Image
              src={getImageUrl(image.url)}
              width={512}
              height={512}
              alt=""
            />
            <div style={{ display: "flex" }}>
              {shouldShowSources && image.urlImageSource && (
                <Image
                  src={getImageUrl(image.urlImageSource)}
                  width={512}
                  height={512}
                  alt="image"
                />
              )}
              {shouldShowSources && image.urlMaskSource && (
                <Image
                  src={getImageUrl(image.urlMaskSource)}
                  width={512}
                  height={512}
                  style={{ border: "1px solid red" }}
                  alt=""
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

export const SdImageComp = memo(_SdImageComp);
