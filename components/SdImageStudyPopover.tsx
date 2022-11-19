import { Button, Modal } from "@mantine/core";
import { useState } from "react";
import { SdImage } from "../libs/shared-types/src";
import { SdImageStudy } from "./SdImageStudy";

interface SdImageStudyPopoverProps {
  mainImageId: string;
  imageGroupData: SdImage[];
}

export function SdImageStudyPopover(props: SdImageStudyPopoverProps) {
  const { mainImageId, imageGroupData } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
        compact
      >
        study...
      </Button>
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
          }}
        >
          <SdImageStudy
            imageGroupData={imageGroupData}
            initialStudyDef={{
              mainImageId,
              rowVar: "cfg",
              colVar: "seed",
            }}
          />
        </div>
      </Modal>
    </>
  );
}
