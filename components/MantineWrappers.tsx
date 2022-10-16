import {
  SwitchProps as mSwitchProps,
  Switch as MSwitch,
  Popover,
  Button,
} from '@mantine/core';
import { useCallback } from 'react';

type SwitchProps = Omit<mSwitchProps, 'onChange'> & {
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
