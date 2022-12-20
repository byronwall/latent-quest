import { CopyButton, JsonInput, Popover, Table } from "@mantine/core";
import { orderBy } from "lodash-es";
import { useState } from "react";

import { Switch } from "./MantineWrappers";
import { SdCardViewer } from "./SdCardViewer";
import { SdImageComp } from "./SdImageComp";
import { Button } from "./Button";

import { getTextForBreakdown } from "../libs/shared-types/src";

import type { SdImage } from "../libs/shared-types/src";

type SdGroupTableProps = {
  data: SdImage[];
};

export function SdGroupTable(props: SdGroupTableProps) {
  const { data: _data } = props;

  const data = orderBy(_data, (c) => c.dateCreated, "desc");

  // state to track isCardView
  const [isCardView, setIsCardView] = useState(true);

  const tableView = (
    <Table>
      <thead>
        <tr>
          <th>image</th>
          <th>prompt</th>
          <th>cfg</th>
          <th>seed</th>
          <th>steps</th>
          <th />
          <th />
        </tr>
      </thead>
      <tbody>
        {data?.map((item: SdImage) => {
          const imgJson = JSON.stringify(item, null, 2);

          return (
            <tr key={item.id}>
              <td>
                <SdImageComp image={item} size={150} />{" "}
              </td>
              <td>
                <div style={{ display: "flex" }}>
                  <div style={{ flex: 1 }}>
                    {getTextForBreakdown(item.promptBreakdown)}
                  </div>
                </div>
              </td>
              <td>{item.cfg}</td>
              <td>{item.seed}</td>
              <td>{item.steps}</td>

              <td>
                <Popover closeOnClickOutside>
                  <Popover.Dropdown>
                    <div
                      style={{
                        width: 600,
                      }}
                    >
                      <b>JSON for image</b>
                      <CopyButton value={imgJson}>
                        {({ copied, copy }) => (
                          <Button
                            color={copied ? "teal" : "blue"}
                            onClick={copy}
                          >
                            {copied ? "Copied url" : "Copy url"}
                          </Button>
                        )}
                      </CopyButton>
                      <JsonInput value={imgJson} minRows={10} />
                    </div>
                  </Popover.Dropdown>
                  <Popover.Target>
                    <Button>JSON</Button>
                  </Popover.Target>
                </Popover>
              </td>
              <td>
                <Popover closeOnClickOutside>
                  <Popover.Dropdown>
                    <div
                      style={{
                        width: 600,
                      }}
                    >
                      <b>JSON for image</b>
                    </div>
                  </Popover.Dropdown>
                  <Popover.Target>
                    <Button>deltas</Button>
                  </Popover.Target>
                </Popover>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );

  return (
    <div>
      <Switch label="Card View" checked={isCardView} onChange={setIsCardView} />
      {isCardView ? <SdCardViewer imageGroupData={data} /> : tableView}
    </div>
  );
}
