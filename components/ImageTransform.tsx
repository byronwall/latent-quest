import { Button, Group, Table, Title } from "@mantine/core";
import { useListState } from "@mantine/hooks";

import * as cloneDeep from "clone-deep";
import { SdImageTransform } from "../libs/shared-types/src";

import { ImageTransformEditor } from "./ImageTransformEditor";

export function ImageTransformBuilder() {
  const [transforms, { append, setItem, remove }] =
    useListState<SdImageTransform>([]);

  return (
    <div>
      <Title order={2}>image transform</Title>
      <p>
        Use these controls to build a set of transforms to apply to a base
        image.
      </p>

      <Title order={3}>edit transform list</Title>

      <Group>
        <Button
          onClick={() => append({ type: "num-raw", field: "cfg", value: 10 })}
        >
          new number raw
        </Button>
        <Button
          onClick={() => append({ type: "num-delta", field: "cfg", delta: 2 })}
        >
          new number delta
        </Button>
      </Group>
      <p>list</p>
      <Table>
        <thead>
          <tr>
            <th>type</th>
            <th>field</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {transforms.map((t, idx) => (
            <tr key={idx}>
              <td>{t.type}</td>
              <td>
                <ImageTransformEditor
                  transform={t}
                  onChange={(newT) => setItem(idx, newT)}
                />
              </td>
              <td>
                <Button onClick={() => remove(idx)}>remove</Button>
                <Button onClick={() => append(cloneDeep(t))}>dupe</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <pre>
        <code>{JSON.stringify(transforms, null, 2)}</code>
      </pre>
    </div>
  );
}
