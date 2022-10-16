import { Button, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCaretDown } from '@tabler/icons';

interface HoverPopoverProps {
  children: React.ReactNode;
  buttonContent?: React.ReactNode;

  color: string;
}

export function HoverPopover(props: HoverPopoverProps) {
  //des props
  const { children, buttonContent, color } = props;

  const [opened, { close, open, toggle }] = useDisclosure(false);
  return (
    <Popover
      width={300}
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
      onClose={close}
      zIndex={1000}
    >
      <Popover.Target>
        <Button
          onClick={toggle}
          // onMouseEnter={open}
          rightIcon={<IconCaretDown />}
          variant="outline"
          compact
          color={color}
        >
          {buttonContent}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>{children}</Popover.Dropdown>
    </Popover>
  );
}
