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
import { orderBy, uniq, uniqBy } from "lodash-es";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

import {
  generatePlaceholderForTransforms,
  getImageDiffAsTransforms,
  isImageSameAsPlaceHolder,
  summarizeAllDifferences,
} from "../libs/helpers";
import {
  PromptBreakdownSortOrder,
  SdImage,
  SdImageGroup,
  SdImagePlaceHolder,
  SdImageTransform,
  SdImageTransformNone,
  SdImageTransformNumberRaw,
  SdImageTransformText,
  TransformNone,
} from "../libs/shared-types/src";
import { artists } from "../model/choices";
import { ImageTransformHolder } from "../model/transformers";
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

const artistChoices = artists.map((c) => ({ value: "by " + c, label: c }));

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

  const data = _data ?? [];

  // store the main image in state
  const [mainImage, setMainImage] = useState<SdImage>(
    data?.[0] ?? ({} as SdImage)
  );

  useEffect(() => {
    setMainImage(data?.[0] ?? ({} as SdImage));
  }, [data]);

  console.log("mainImage", mainImage);

  const [transformRow, setTransformRow] =
    useState<ImageTransformHolder>(undefined);

  const [transformCol, setTransformCol] =
    useState<ImageTransformHolder>(undefined);

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
  const [artistChoice, setArtistChoice] = useState<string[]>([]);

  const visibleIds: string[] = [];

  // add in the must show items from drop down
  const extraChoiceMap: { [key in typeof variableChoices[number]]: string[] } =
    {
      seed: seedChoice,
      cfg: cfgChoice,
      steps: stepsChoice,
      unknown: [],
      loose: [],
    };

  const diffSummary = summarizeAllDifferences(mainImage, data);

  const diffXForm = getImageDiffAsTransforms(mainImage, data);

  console.log("diffSummary", diffSummary);

  console.log("diffXForm", diffXForm);

  const [looseTransforms, setLooseTransforms] = useState<ImageTransformHolder>({
    name: "loose",
    transforms: [TransformNone],
  });

  const rowTransformHolder: ImageTransformHolder = {
    name: rowVar,
    transforms: orderBy(
      uniqBy(
        diffXForm.filter((x) => x.field === rowVar),
        getDescForTransform
      ),
      (c) => {
        const newLocal = getDescForTransform(c);
        return (c.action === "add" ? 1 : -1) * newLocal.length;
      },
      "desc"
    ),
  };

  // add main image where needed

  let prevXform = undefined;

  let index = -1;
  let wasFlip = false;

  const dummy: SdImageTransformNone = {
    type: "none",
  };

  for (const xform of rowTransformHolder.transforms) {
    index++;
    if (prevXform === undefined) {
      prevXform = xform;
      continue;
    }

    if (xform.action !== prevXform.action) {
      rowTransformHolder.transforms.splice(index, 0, dummy);
      wasFlip = true;
      break;
    }
  }

  if (!wasFlip) {
    // if first is remove, place at top

    const insertIndedx =
      rowTransformHolder.transforms[0]?.action === "remove"
        ? 0
        : rowTransformHolder.transforms.length;

    rowTransformHolder.transforms.splice(insertIndedx, 0, dummy);
  }

  // createTransformHolder(
  //   rowVar,
  //   diffSummary,
  //   mainImage,
  //   extraChoiceMap,
  //   looseTransforms,
  //   transformRow
  // );

  console.log("rowTransformHolder", rowTransformHolder);

  const colTransformHolder: ImageTransformHolder = createTransformHolder(
    colVar,
    diffSummary,
    mainImage,
    extraChoiceMap,
    looseTransforms,
    transformCol
  );

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
      <div> {isLoading ? "loading..." : ""} </div>
      <div> {isError ? "error" : ""} </div>
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

          <MultiSelect
            label="artist"
            data={artistChoices}
            value={artistChoice}
            onChange={setArtistChoice}
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
                <th key={idx}>{getDescForTransform(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  <td>
                    {getDescForTransform(
                      rowTransformHolder.transforms[rowIndex]
                    )}
                  </td>

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

function createTransformHolder(
  rowVar: string,
  diffSummary: any,
  mainImage: SdImage,
  extraChoiceMap: {
    seed: string[];
    cfg: string[];
    steps: string[];
  },
  looseTransforms: ImageTransformHolder,
  transformRow: ImageTransformHolder
) {
  let rowTransformHolder: ImageTransformHolder;

  switch (rowVar) {
    case "cfg":
    case "steps":
    case "unknown":
    case "seed": {
      // build the row headers
      let rowHeaders = diffSummary[rowVar] ?? [mainImage[rowVar]];
      extraChoiceMap[rowVar].forEach((c) => rowHeaders.push(+c));

      rowHeaders = uniq(rowHeaders);
      rowHeaders.sort((a, b) =>
        typeof a === "string" || Array.isArray(a) ? a.length - b.length : a - b
      );

      rowTransformHolder = generateSimpleTransformHolder(
        "row simple",
        rowHeaders,
        rowVar
      );

      break;
    }
    case "loose":
      rowTransformHolder = looseTransforms;
      break;

    case "known":
      rowTransformHolder = transformRow;
      break;
  }
  return rowTransformHolder;
}

function generateSimpleTransformHolder(
  name: string,
  uniqValues: any[],
  rowVar: string
) {
  const holder: ImageTransformHolder = {
    name,
    transforms: uniqValues.map((rowHeader) => {
      const rowTransformTemp = generateTransformFromSimplerHeader(
        rowVar,
        rowHeader
      );

      return rowTransformTemp;
    }),
  };

  return holder;
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
  transformRow: ImageTransformHolder,
  transformCol: ImageTransformHolder,
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
    case "multi":
      return "multi";
    case "text":
      return `${transform.field} = ${transform.action}     
      ${
        Array.isArray(transform.value)
          ? transform.value.join(" + ")
          : transform.value
      }`;
    case "num-raw":
      return `${transform.field} = ${transform.value}`;
    case "num-delta":
      return `${transform.field} = ${transform.delta}`;
  }

  return "";
}

// TODO: figure out how to sort the transform with the main image between the add and remove
// TODO: remove dupes when showing transform
// TODO: add the main image in by doing a null transform
