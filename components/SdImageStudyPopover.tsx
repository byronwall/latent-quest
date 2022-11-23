import { Button, Modal } from "@mantine/core";
import { useState } from "react";

import { SdImageStudy } from "./SdImageStudy";

import type { SdImage, SdImageStudyDef } from "../libs/shared-types/src";

interface SdImageStudyPopoverCommon {
  groupId: string;
  imageGroupData: SdImage[];
}

interface SdImageStudyPopoverUnknown {
  mainImageId: string;
}

interface SdImageStudyPopoverKnown {
  initialStudyDef: SdImageStudyDef;
}

type SdImageStudyPopoverProps = SdImageStudyPopoverCommon &
  (SdImageStudyPopoverKnown | SdImageStudyPopoverUnknown);

export function SdImageStudyPopover(props: SdImageStudyPopoverProps) {
  const { imageGroupData, groupId } = props;

  const mainImageId =
    "mainImageId" in props
      ? props.mainImageId
      : props.initialStudyDef.mainImageId;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainImage = imageGroupData.find((i) => i.id === mainImageId);

  if (mainImage?.variantSourceId || mainImage?.urlImageSource) {
    // do not allow studies on image that were generated from image prompts -- for now
    return null;
  }

  const initialStudyDef: SdImageStudyDef =
    "initialStudyDef" in props
      ? props.initialStudyDef
      : {
          mainImageId,
          rowVar: "cfg",
          colVar: "seed",
          groupId,
          dateCreated: new Date().toISOString(),
          id: "",
          settings: {},
        };

  return (
    <>
      <div style={{ display: "flex", width: 300 }}>
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
          compact
        >
          study...
        </Button>
        <a
          target="_blank"
          rel="noreferrer"
          href={`/study/${initialStudyDef.id}`}
          style={{
            padding: 10,
            background: "white",
            border: "1px solid black",
          }}
        >
          open in new tab
        </a>
      </div>
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="auto"
      >
        <div
          style={{
            maxHeight: "calc(80vh - 40px)",
            maxWidth: "calc(90vw - 20px)",
            overflow: "auto",
            position: "relative",
          }}
        >
          <SdImageStudy
            imageGroupData={imageGroupData}
            initialStudyDef={initialStudyDef}
          />
          {initialStudyDef.id && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`/study/${initialStudyDef.id}`}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: 10,
                background: "white",
                border: "1px solid black",
              }}
            >
              open in new tab
            </a>
          )}
        </div>
      </Modal>
    </>
  );
}
