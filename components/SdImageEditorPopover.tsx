import { Modal } from "@mantine/core";
import { useState } from "react";
import { IconPencil } from "@tabler/icons";

import { Button } from "./Button";
import { SdImageEditor } from "./SdImageEditor";

import type { SdImageEditorPopoverProps } from "./SdImageEditor";

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

      <Button color="orange" onClick={() => setIsOpen(true)}>
        <IconPencil />
      </Button>
    </>
  );
}
