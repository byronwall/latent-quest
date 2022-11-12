import { Button, CopyButton, JsonInput, Popover, Table } from "@mantine/core";
import { orderBy } from "lodash-es";
import { useState } from "react";

import { findImageDifferences } from "../libs/helpers";
import {
  getTextForBreakdown,
  SdImage,
  SdImageTransform,
} from "../libs/shared-types/src";
import { Switch } from "./MantineWrappers";
import { SdVariantHandler } from "./SdCardOrTableCell";
import { SdCardViewer } from "./SdCardViewer";
import { SdImageComp } from "./SdImageComp";
import { SdPromptToTransform } from "./SdPromptToTransform";

type SdGroupTableProps = {
  data: SdImage[];
  mainImage: SdImage;
  visibleItems: string[];

  onSetMainImage: (image: SdImage) => void;

  onNewTransform: (newTransform: SdImageTransform) => void;
  onCreateVariant: SdVariantHandler;
};

export function SdGroupTable(props: SdGroupTableProps) {
  const {
    data: _data,
    mainImage,
    visibleItems,
    onNewTransform,
    onSetMainImage,
  } = props;

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
          <th>visible</th>
          <th />
          <th />
        </tr>
      </thead>
      <tbody>
        {data?.map((item: SdImage) => {
          const imgJson = JSON.stringify(item, null, 2);
          const baseDelta = findImageDifferences(mainImage, item, {
            shouldReportAddRemove: true,
          });
          const baseDeltaJson = JSON.stringify(baseDelta, null, 2);
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
                  <div>
                    <SdPromptToTransform
                      promptBreakdown={item.promptBreakdown}
                      onNewTransform={onNewTransform}
                    />
                  </div>
                </div>
              </td>
              <td>{item.cfg}</td>
              <td>{item.seed}</td>
              <td>{item.steps}</td>
              <td>
                <>
                  {visibleItems.find((c: any) => c === item.id) !== undefined
                    ? "true"
                    : ""}
                  <Button
                    onClick={() => {
                      props.onSetMainImage(item);
                    }}
                    variant="subtle"
                  >
                    {" "}
                    main
                  </Button>
                </>
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
                      <CopyButton value={baseDeltaJson}>
                        {({ copied, copy }) => (
                          <Button
                            color={copied ? "teal" : "blue"}
                            onClick={copy}
                          >
                            {copied ? "Copied url" : "Copy url"}
                          </Button>
                        )}
                      </CopyButton>
                      <JsonInput value={baseDeltaJson} size="xl" minRows={10} />
                    </div>
                  </Popover.Dropdown>
                  <Popover.Target>
                    <Button>deltas</Button>
                  </Popover.Target>
                </Popover>
                <div>
                  {baseDelta.map((delta, idx) => (
                    <div key={idx}>{JSON.stringify(delta)}</div>
                  ))}
                </div>
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
      {isCardView ? (
        <SdCardViewer
          data={data}
          id={mainImage.id}
          onSetMainImage={onSetMainImage}
          onCreateVariant={props.onCreateVariant}
        />
      ) : (
        tableView
      )}
    </div>
  );
}
