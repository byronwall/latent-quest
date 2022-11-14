import { Button, Modal } from "@mantine/core";
import { useState } from "react";
import { SdImageEditorPopoverProps, SdImageEditor } from "./SdImageEditor";

export function SdImageEditorPopover(props: SdImageEditorPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        size="80%"
      >
        <SdImageEditor {...props} />
      </Modal>

      <Button compact color="orange" onClick={() => setIsOpen(true)}>
        edit
      </Button>
    </>
  );
}
