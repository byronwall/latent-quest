import { Button, Popover, Switch as MSwitch, Tooltip } from "@mantine/core";
import { useCallback } from "react";

import type {
  PopoverProps,
  SwitchProps as mSwitchProps,
  TooltipProps,
} from "@mantine/core";

type SwitchProps = Omit<mSwitchProps, "onChange"> & {
  onChange: (value: boolean) => void;
};

export function Switch(props: SwitchProps) {
  const { onChange, ...rest } = props;

  const handleChange = useCallback(
    (evt) => onChange(evt.currentTarget.checked),
    [onChange]
  );

  return <MSwitch {...rest} onChange={handleChange} />;
}

export function JsonButton(props: { obj: any }) {
  const { obj } = props;
  return (
    <Popover>
      <Popover.Target>
        <Button>JSON</Button>
      </Popover.Target>
      <Popover.Dropdown>
        <div>
          <pre>{JSON.stringify(obj, null, 2)}</pre>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

export function TooltipCommon(props: TooltipProps) {
  return (
    <Tooltip
      {...props}
      multiline
      label={<div style={{ width: 300 }}>{props.label}</div>}
    >
      {props.children}
    </Tooltip>
  );
}

export function PopoverCommon(props: PopoverProps) {
  return (
    <Popover
      {...props}
      closeOnClickOutside
      shadow={"rgba(0, 0, 0, 0.8) 15px 22px 70px 4px;"}
      withArrow
      arrowSize={30}
      position="right"
    >
      {props.children}
    </Popover>
  );
}
