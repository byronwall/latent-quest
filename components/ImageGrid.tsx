import {
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Radio,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import axios from "axios";
import produce from "immer";
import { orderBy, uniqBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";

import {
  findImageDifferences,
  generatePlaceholderForTransforms,
  getImageDiffAsTransforms,
  isImageSameAsPlaceHolder,
  summarizeAllDifferences,
} from "../libs/helpers";
import {
  getTextForBreakdown,
  PromptBreakdownSortOrder,
  SdImage,
  SdImageGroup,
  SdImagePlaceHolder,
  SdImageTransform,
  SdImageTransformHolder,
  SdImageTransformMulti,
  SdImageTransformNone,
  SdImageTransformNonMulti,
  SdImageTransformNumberRaw,
  SdImageTransformText,
  TransformNone,
} from "../libs/shared-types/src";
import { SdGroupTable } from "./SdGroupTable";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";

interface ImageGridProps {
  groupId: string;
}

// as value label pairs - 4 6 8 10 12 14
const cfgChoices = [
  { value: "4", label: "4" },
  { value: "6", label: "6" },
  { value: "8", label: "8" },
  { value: "10", label: "10" },
  { value: "12", label: "12" },
  { value: "14", label: "14" },
];

// store step choices -- 20 50
const stepsChoices = [
  { value: "20", label: "20" },
  { value: "50", label: "50" },
];

// store seed choices -- 123123 1321312 3123 32313 555 6879 109873
const seedChoices = [
  { value: "123123", label: "123123" },
  { value: "1321312", label: "1321312" },
  { value: "3123", label: "3123" },
  { value: "32313", label: "32313" },
  { value: "555", label: "555" },
  { value: "6879", label: "6879" },
  { value: "109873", label: "109873" },
];

const variableChoices = ["cfg", "seed", "steps", "unknown", "loose"] as const;

export function ImageGrid(props: ImageGridProps) {
  console.log("ImageGrid - render");

  // des props
  const { groupId } = props;

  // create a query for 1 id
  const {
    data: _data,
    isLoading,
    isError,
    error,
  } = useQuery(groupId, async () => {
    const res = await fetch(`/api/images/group/${props.groupId}`);
    const results = (await res.json()) as SdImage[];
    return results;
  });

  const { data: groupData } = useQuery("group:" + groupId, async () => {
    const res = await fetch(`/api/group/${props.groupId}`);
    const results = (await res.json()) as SdImageGroup;
    return results;
  });

  console.log("group data", groupData);

  // push group data into the default view

  useEffect(() => {
    if (groupData === undefined) {
      return;
    }

    setRowVar(groupData.view_settings.defaultView.rowVar);
    setColVar(groupData.view_settings.defaultView.colVar);
  }, [groupData]);

  const saveGroupSettings = async () => {
    // fire off a post to the right api

    const postData = { ...groupData };
    postData.view_settings.defaultView.rowVar = rowVar;
    postData.view_settings.defaultView.colVar = colVar;

    axios.put<any, any, SdImageGroup>(`/api/group/${groupId}`, postData);
  };

  const data = useMemo(() => _data ?? [], [_data]);

  // store the main image in state
  const [mainImage, setMainImage] = useState<SdImage>(
    data?.[0] ?? ({} as SdImage)
  );

  useEffect(() => {
    setMainImage(data?.[0] ?? ({} as SdImage));
  }, [data]);

  console.log("mainImage", mainImage);

  // take those images and push into a table -- by default 3x3 with single image in center

  // this is an array of arrays
  // this will eventually by built by checking the CFG or prompt or other details

  // store row and colVar in state
  const [rowVar, setRowVar] = useState("cfg");
  const [colVar, setColVar] = useState("seed");

  // store some cfg and step choices in state also
  const [cfgChoice, setCfgChoice] = useState<string[]>([]);
  const [stepsChoice, setStepsChoice] = useState<string[]>([]);
  const [seedChoice, setSeedChoice] = useState<string[]>([]);

  const visibleIds: string[] = [];

  // add in the must show items from drop down
  const extraChoiceMap: { [key in typeof variableChoices[number]]: number[] } =
    {
      seed: seedChoice.map((x) => +x),
      cfg: cfgChoice.map((x) => +x),
      steps: stepsChoice.map((x) => +x),
      unknown: [],
      loose: [],
    };

  const diffSummary = summarizeAllDifferences(mainImage, data);

  const diffXForm = getImageDiffAsTransforms(mainImage, data);

  const [looseTransforms, setLooseTransforms] =
    useState<SdImageTransformHolder>({
      name: "loose",
      transforms: [],
    });

  // extra choices to transform

  // need to normalize loose transforms from the `set` to add/remove based on main image
  const looseTransformsNormalized = looseTransforms.transforms.map((xform) => {
    const tempImage = generatePlaceholderForTransforms(mainImage, [xform]);

    const diffsFound = findImageDifferences(mainImage, tempImage);

    const newXForm: SdImageTransformMulti = {
      field: xform.field,
      type: "multi",
      transforms: diffsFound,
    };

    return newXForm;
  });

  console.log("looseTransformsNormalized", looseTransformsNormalized);

  const rowExtras =
    rowVar === "unknown"
      ? looseTransformsNormalized
      : genSimpleXFormList(rowVar, extraChoiceMap[rowVar]);

  const rowTransformHolder = generateSortedTransformList(
    rowVar,
    diffXForm.concat(rowExtras),
    mainImage
  );

  console.log("rowTransformHolder", rowTransformHolder);

  const colExtras = genSimpleXFormList(colVar, extraChoiceMap[colVar]);

  const colTransformHolder: SdImageTransformHolder =
    generateSortedTransformList(colVar, diffXForm.concat(colExtras), mainImage);

  console.log("rowTransformHolder", { rowTransformHolder, colTransformHolder });

  const tableData = generateTableFromXform(
    rowTransformHolder,
    colTransformHolder,
    mainImage,
    data,
    visibleIds
  );

  const [imageSize, setImageSize] = useState(200);

  const handleAddLooseTransform = (t: SdImageTransform) => {
    setLooseTransforms(
      produce(looseTransforms, (draft) => {
        draft.transforms.push(t);
      })
    );
  };

  const handleRemoveLooseTransform = (idx: number) => {
    setLooseTransforms(
      produce(looseTransforms, (draft) => {
        draft.transforms.splice(idx, 1);
      })
    );
  };

  console.log("looseTransforms", looseTransforms);

  return (
    <div>
      <Title order={1}>grid of images</Title>
      <Title order={2}>transform chooser</Title>
      <Button onClick={() => saveGroupSettings()}>save view to DB</Button>

      <Stack>
        <Group>
          <b>row var</b>
          <Radio.Group value={rowVar} onChange={setRowVar}>
            {variableChoices.map((choice) => (
              <Radio key={choice} value={choice} label={choice} />
            ))}
          </Radio.Group>
        </Group>
        <Group>
          <b>col var</b>
          <Radio.Group value={colVar} onChange={setColVar}>
            {variableChoices.map((choice) => (
              <Radio key={choice} value={choice} label={choice} />
            ))}
          </Radio.Group>
        </Group>
      </Stack>
      <div>
        <p>loose transforms</p>
        {looseTransforms.transforms.map((xform, idx) => (
          <div key={idx}>
            {getDescForTransform(xform)}
            <Button onClick={() => handleRemoveLooseTransform(idx)}>
              remove
            </Button>
          </div>
        ))}
      </div>

      <Stack>
        <Group>
          <NumberInput label="size" value={imageSize} onChange={setImageSize} />
        </Group>

        <Group>
          <b>extra choices</b>
          <MultiSelect
            label="cfg"
            data={cfgChoices}
            value={cfgChoice}
            onChange={setCfgChoice}
            clearable
            searchable
          />
          <MultiSelect
            label="steps"
            data={stepsChoices}
            value={stepsChoice}
            onChange={setStepsChoice}
            clearable
            searchable
          />

          <MultiSelect
            label="seed"
            data={seedChoices}
            value={seedChoice}
            onChange={setSeedChoice}
            clearable
            searchable
          />
        </Group>

        <Table
          style={{
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th />
              {colTransformHolder.transforms.map((col, idx) => (
                <th key={idx}>{getRowColHeaderText(col, colVar, mainImage)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => {
              const rowXForm = rowTransformHolder.transforms[rowIndex];
              return (
                <tr key={rowIndex}>
                  <td>{getRowColHeaderText(rowXForm, rowVar, mainImage)}</td>

                  {row.map((cell, colIndex) => {
                    const content =
                      cell === undefined ? (
                        <div></div>
                      ) : !("id" in cell) ? (
                        <SdImagePlaceHolderComp
                          size={imageSize}
                          placeholder={cell}
                        />
                      ) : (
                        <SdImageComp image={cell} size={imageSize} />
                      );

                    return (
                      <td
                        key={colIndex}
                        onClick={() => "id" in cell && setMainImage(cell)}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Stack>

      <Stack>
        <Title order={1}>all images in group</Title>
        <SdGroupTable
          data={data}
          mainImage={mainImage}
          visibleItems={visibleIds}
          onNewTransform={handleAddLooseTransform}
          onSetMainImage={setMainImage}
        />
        <div>
          <Title order={4}>all differences</Title>
          <pre>{JSON.stringify(diffSummary, null, 2)}</pre>
        </div>
      </Stack>
    </div>
  );
}

function genSimpleXFormList(rowVar: string, uniqValues: any[]) {
  return uniqValues.map((rowHeader) =>
    generateTransformFromSimplerHeader(rowVar, rowHeader)
  );
}

function generateTransformFromSimplerHeader(rowVar: string, rowHeader: any) {
  let rowTransformTemp: SdImageTransform;
  if (PromptBreakdownSortOrder.includes(rowVar as any)) {
    rowTransformTemp = {
      type: "text",
      action: "set",
      field: rowVar,
      value: rowHeader,
    } as SdImageTransformText;
  } else {
    rowTransformTemp = {
      type: "num-raw",
      field: rowVar as any,
      value: rowHeader,
    } as SdImageTransformNumberRaw;
  }
  return rowTransformTemp;
}

type SdImageGrid = Array<Array<SdImage | SdImagePlaceHolder>>;

function generateTableFromXform(
  transformRow: SdImageTransformHolder,
  transformCol: SdImageTransformHolder,
  mainImage: SdImage,
  data: SdImage[],
  visibleIds: string[]
): SdImageGrid {
  const tableData: Array<Array<SdImage | SdImagePlaceHolder>> = [];
  if (transformRow && transformCol) {
    for (let row = 0; row < transformRow.transforms.length; row++) {
      const rowTransform = transformRow.transforms[row];
      const rowImages = [];
      tableData.push(rowImages);
      for (let col = 0; col < transformCol.transforms.length; col++) {
        const colTransform = transformCol.transforms[col];
        const placeholder = generatePlaceholderForTransforms(mainImage, [
          rowTransform,
          colTransform,
        ]);

        const found = data?.find((item) =>
          isImageSameAsPlaceHolder(item, placeholder)
        );

        if (found) {
          visibleIds.push(found.id);
        }

        tableData[row][col] = found ?? placeholder;
      }
    }
  }
  return tableData;
}

function getDescForTransform(transform: SdImageTransform): string {
  switch (transform.type) {
    case "text":
      return `${transform.action}     
      ${
        Array.isArray(transform.value)
          ? transform.value.join(" + ")
          : transform.value
      }`;
    case "num-raw":
      return `${transform.value}`;
    case "num-delta":
      return `${transform.delta}`;

    case "multi":
      return `${transform.transforms.map((t) => getDescForTransform(t))}`;
  }

  return "";
}

function generateSortedTransformList(
  rowColVar: string,
  diffXForm: SdImageTransform[],
  mainImage: SdImage
) {
  /// TODO: this needs to support extra choices and the loose transforms
  const rowTransformHolder: SdImageTransformHolder = {
    name: rowColVar,
    transforms: orderBy(
      uniqBy(
        diffXForm.filter((x) => x.type !== "none" && x.field === rowColVar),
        getDescForTransform
      ),
      (c) => {
        return getSortValueForXform(c);
      },
      "desc"
    ),
  };

  console.log("rowTransformHolder", ...rowTransformHolder.transforms);

  // add main image where needed

  let prevXform = undefined;

  let index = -1;
  let wasFlip = false;

  const dummy: SdImageTransformNone = {
    type: "none",
    field: "none",
  };

  for (const xform of rowTransformHolder.transforms) {
    index++;

    // determine where to place the main image = dummy xform

    switch (xform.type) {
      case "none":
        break;

      case "text":
        if (prevXform === undefined) {
          prevXform = xform;
          continue;
        }
        if (xform.action !== prevXform.action) {
          rowTransformHolder.transforms.splice(index, 0, dummy);
          wasFlip = true;
        }
        break;

      case "num-raw":
        if (xform.value <= mainImage[xform.field]) {
          rowTransformHolder.transforms.splice(index, 0, dummy);
          wasFlip = true;
        }
        break;

      case "num-delta":
        if (xform.delta > 0) {
          rowTransformHolder.transforms.splice(index, 0, dummy);
          wasFlip = true;
        }
        break;
    }

    if (wasFlip) {
      break;
    }
  }

  const firstXForm = rowTransformHolder
    .transforms[0] as SdImageTransformNonMulti;
  if (!wasFlip) {
    const lastIdx = rowTransformHolder.transforms.length;
    // if first is remove, place at top

    const insertIdx =
      firstXForm === undefined
        ? 0
        : firstXForm.type !== "text"
        ? firstXForm.type === "num-delta" || firstXForm.type === "none"
          ? 0
          : firstXForm.value < mainImage[rowColVar]
          ? 0
          : lastIdx
        : firstXForm.action === "remove"
        ? 0
        : lastIdx;

    rowTransformHolder.transforms.splice(insertIdx, 0, dummy);
  }

  return rowTransformHolder;
}

function getSortValueForXform(c: SdImageTransform) {
  switch (c.type) {
    case "text":
      const newLocal = getDescForTransform(c);
      return (c.action === "add" ? 1 : -1) * newLocal.length;

    case "num-raw":
      return c.value;

    case "num-delta":
      return c.delta;

    case "none":
      return 0;

    case "multi":
      const firstXForm = c.transforms[0];
      if (firstXForm === undefined) {
        return 0;
      }
      return getSortValueForXform(firstXForm);
  }
}

function getRowColHeaderText(
  col: SdImageTransform,
  colVar: string,
  mainImage: SdImage
) {
  const value =
    col.type === "none"
      ? colVar === "unknown"
        ? getTextForBreakdown(mainImage.promptBreakdown)
        : mainImage[colVar]
      : getDescForTransform(col);

  const lhsText = colVar === "unknown" ? "" : colVar + " = ";

  return `${lhsText}${value}`;
}
