import { Select, Slider } from "@mantine/core";
import { groupBy, orderBy, uniq } from "lodash-es";
import { useState } from "react";

import { SdImage } from "../libs/shared-types/src";
import { SdVariantHandler } from "./SdCardOrTableCell";
import { SdImageComp } from "./SdImageComp";

type SdCardViewerProps = {
  data: SdImage[];
  onSetMainImage: (arg0: SdImage) => void;
  id: string;
  onCreateVariant: SdVariantHandler | undefined;
};

export function SdCardViewer(props: SdCardViewerProps) {
  const { data, onSetMainImage, id, onCreateVariant } = props;

  const colFields = orderBy(uniq(data.flatMap((item) => Object.keys(item))));

  const [colField, setColField] = useState<string | null>(null);

  const rowGroups = groupBy(data, (item) => (colField ? item[colField] : ""));
  const rowGroupLabels = Object.keys(rowGroups);

  const [imageSize, setImageSize] = useState(320);

  return (
    <div>
      <p>
        Use the drop down to choose a grouping field. If you choose the variant
        ID field, a preview of the original image will be shown.
      </p>
      <div
        style={{
          display: "flex",
        }}
      >
        <div style={{ width: 300 }}>
          <Select
            label="group by..."
            data={colFields}
            value={colField}
            onChange={(value) => setColField(value)}
            clearable
            searchable
          />
        </div>
        <div style={{ width: 300 }}>
          <Slider
            label="image size"
            size={"xl"}
            min={100}
            max={512}
            step={10}
            value={imageSize}
            onChange={(value) => setImageSize(value)}
          />
          {imageSize}px
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {rowGroupLabels.map((label) => {
          const group = rowGroups[label];

          // this is a little hokey
          // variants use the URL while prevImage uses the actual ID
          const sourceImage =
            (colField === "variantSourceId" || colField === "prevImageId") &&
            data.find((c) => c.url === label || c.id === label);

          return (
            <div
              key={label}
              style={{
                display: "flex",
                border: "1px solid black",
                padding: 10,
                gap: 5,
                alignItems: "center",
              }}
            >
              {sourceImage ? (
                <div
                  style={{
                    background: "#b2c2cf",
                    padding: 10,
                    flexShrink: 0,
                    borderRadius: 5,
                  }}
                >
                  <p>source</p>
                  <SdImageComp
                    image={sourceImage}
                    size={imageSize}
                    onCreateVariant={onCreateVariant}
                    shouldShowDetails
                  />
                </div>
              ) : (
                <b>{label === "null" ? "" : label}</b>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {group?.map((item: SdImage) => (
                  <div key={item.id}>
                    <SdImageComp
                      image={item}
                      size={imageSize}
                      onSetMainImage={() => onSetMainImage(item)}
                      isMainImage={item.id === id}
                      onCreateVariant={onCreateVariant}
                      shouldShowDetails
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
