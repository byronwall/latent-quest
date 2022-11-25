import { Select, Slider } from "@mantine/core";
import { groupBy, orderBy, uniq } from "lodash-es";
import { useState } from "react";

import { getSelectionAsLookup } from "./getSelectionFromPromptPart";
import { getFinalPromptText } from "./getTextOnlyFromPromptPartWithLabel";
import { SdImageComp } from "./SdImageComp";

import type { SdVariantHandler } from "./SdCardOrTableCell";
import type { SdImage } from "../libs/shared-types/src";

type SdCardViewerProps = {
  imageGroupData: SdImage[];

  onCreateVariant: SdVariantHandler | undefined;
};

export function SdCardViewer(props: SdCardViewerProps) {
  const { imageGroupData, onCreateVariant } = props;

  // mapping is sub name -> unique choices
  const allSubValues: Record<string, Set<string>> = {};

  // item id -> sub name -> sub value
  const subLookup = imageGroupData.reduce((acc, item) => {
    const lookup = getSelectionAsLookup(item);

    acc[item.id] = lookup;

    Object.keys(lookup).forEach((key) => {
      if (!allSubValues[key]) {
        allSubValues[key] = new Set();
      }

      lookup[key].forEach((val) => {
        allSubValues[key].add(val);
      });
    });

    return acc;
  }, {} as Record<string, Record<string, string[]>>);

  const subFields = Object.keys(allSubValues);

  const rawFields = uniq(imageGroupData.flatMap((item) => Object.keys(item)));

  const colFields = orderBy(rawFields.concat(subFields));

  const [colField, setColField] = useState<string | null>("prevImageId");

  const rowGroupsSub = Array.from(allSubValues[colField ?? ""] ?? []);

  const isKnownField = imageGroupData
    .flatMap((c) => Object.keys(c))
    .includes(colField ?? "");

  const rowGroups = isKnownField
    ? groupBy(imageGroupData, (item) => (colField ? item[colField] : ""))
    : rowGroupsSub.reduce((acc, rowGroup) => {
        const items = imageGroupData.filter((item) => {
          const subVals = subLookup[item.id][colField ?? ""] ?? [];

          return subVals.includes(rowGroup);
        });

        acc[rowGroup] = items;

        return acc;
      }, {} as Record<string, SdImage[]>);

  const rowGroupLabels = Object.keys(rowGroups);

  const [imageSize, setImageSize] = useState(280);

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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        {rowGroupLabels.map((label) => {
          const group = orderBy(
            rowGroups[label],
            (c) => getFinalPromptText(c).length
          );

          const willShowImage =
            colField === "variantSourceId" || colField === "prevImageId";
          // this is a little hokey
          // variants use the URL while prevImage uses the actual ID
          const sourceImage =
            willShowImage &&
            imageGroupData.find((c) => c.url === label || c.id === label);

          return (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: willShowImage ? "row" : "column",
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
                    position: "sticky",
                    top: 100,
                    bottom: 100,
                  }}
                >
                  <p>source</p>
                  <SdImageComp
                    image={sourceImage}
                    size={imageSize}
                    onCreateVariant={onCreateVariant}
                    imageGroupData={imageGroupData}
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
                      onCreateVariant={onCreateVariant}
                      imageGroupData={imageGroupData}
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
