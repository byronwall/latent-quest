import {
  Button,
  Group,
  Loader,
  MultiSelect,
  Radio,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { IconWand } from "@tabler/icons";
import axios from "axios";
import produce from "immer";
import { orderBy, uniq, uniqBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";

import {
  findImageDifferences,
  generatePlaceholderForTransform,
  generatePlaceholderForTransforms,
  getImageDiffAsTransforms,
  isImageSameAsPlaceHolder,
  jsonStringifyStable,
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
  SdImageTransformNumberRaw,
  SdImageTransformText,
  SdImageTransformTextBasic,
  SdImageTransformTextSub,
  TransformNone,
} from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import { commonChoiceMap } from "./common_choices";
import { getSelectionFromPromptPart } from "./getSelectionFromPromptPart";
import { Switch } from "./MantineWrappers";
import { SdGroupTable } from "./SdGroupTable";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";
import { SdPromptToTransform } from "./SdPromptToTransform";

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

export function ImageGrid(props: ImageGridProps) {
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

  // push group data into the default view

  useEffect(() => {
    if (groupData === undefined) {
      return;
    }

    setRowVar(groupData.view_settings.defaultView.rowVar);
    setColVar(groupData.view_settings.defaultView.colVar);
    setIsSingleVar(groupData.view_settings.defaultView.isSingleVar ?? false);
    // TODO: add main image here
  }, [groupData]);

  const saveGroupSettings = async () => {
    // fire off a post to the right api

    const postData = { ...groupData };
    postData.view_settings.defaultView.rowVar = rowVar;
    postData.view_settings.defaultView.colVar = colVar;
    if (mainImage) {
      postData.view_settings.defaultView.mainImageId = mainImage.id;
    }

    postData.view_settings.defaultView.isSingleVar = isSingleVar;

    axios.put<any, any, SdImageGroup>(`/api/group/${groupId}`, postData);
  };

  const data = useMemo(() => _data ?? [], [_data]);

  const availableSubNames = uniq(
    data.reduce((acc, item) => {
      item.promptBreakdown.parts.forEach((part) => {
        const selections = getSelectionFromPromptPart(part);

        acc.push(...selections.map((sel) => sel.name));
      });
      return acc;
    }, [] as string[])
  );

  const fixedVariableChoices = ["cfg", "seed", "steps", "unknown"] as const;
  const variableChoices = [
    ...fixedVariableChoices,
    ...availableSubNames,
  ] as const;

  // store the main image in state

  const mainImageIdFromSettings =
    groupData?.view_settings.defaultView.mainImageId;

  const mainImageFromSettings = useMemo(() => {
    return data.find((x) => x.id === mainImageIdFromSettings);
  }, [data, mainImageIdFromSettings]);

  const [mainImage, setMainImage] = useState<SdImage>(
    mainImageFromSettings ?? data[0] ?? ({} as SdImage)
  );

  // update main image if settings or data changes
  useEffect(() => {
    if (mainImageFromSettings) {
      setMainImage(mainImageFromSettings);
    }
  }, [mainImageFromSettings, data]);

  useEffect(() => {
    setMainImage(data?.[0] ?? ({} as SdImage));
  }, [data]);

  // take those images and push into a table -- by default 3x3 with single image in center

  // this is an array of arrays
  // this will eventually by built by checking the CFG or prompt or other details

  // store row and colVar in state
  const [rowVar, setRowVar] = useState("cfg");
  const [colVar, setColVar] = useState("seed");

  const [isSingleVar, setIsSingleVar] = useState(false);

  // store some cfg and step choices in state also
  const [cfgChoice, setCfgChoice] = useState<string[]>([]);
  const [stepsChoice, setStepsChoice] = useState<string[]>([]);
  const [seedChoice, setSeedChoice] = useState<string[]>([]);

  const visibleIds: string[] = [];

  function getExtraChoice(key: string) {
    switch (key) {
      case "cfg":
        return cfgChoice.map((x) => +x);

      case "seed":
        return seedChoice.map((x) => +x);

      case "steps":
        return stepsChoice.map((x) => +x);

      case "unknown":
        return [];

      default:
        const extraMatch = commonChoiceMap[key];
        if (extraMatch) {
          return extraMatch;
        }

        return [];
    }
  }

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

  // get diff counts by field
  const diffCounts = diffXForm.reduce(
    (acc, x) => {
      acc[x.field] += 1;
      return acc;
    },
    { cfg: 1, seed: 1, steps: 1, unknown: 1 }
  );

  const rowExtras =
    rowVar === "unknown"
      ? looseTransformsNormalized
      : genSimpleXFormList(rowVar, getExtraChoice(rowVar));

  const rowTransformHolder = generateSortedTransformList(
    rowVar,
    diffXForm.concat(rowExtras),
    mainImage
  );

  const colVarToUse = isSingleVar ? "none" : colVar;

  const colExtras =
    colVarToUse === "none"
      ? []
      : colVarToUse === "unknown"
      ? looseTransformsNormalized
      : genSimpleXFormList(colVarToUse, getExtraChoice(colVarToUse));

  const colTransformHolder = generateSortedTransformList(
    colVarToUse,
    diffXForm.concat(colExtras),
    mainImage
  );

  const tableData = generateTableFromXform(
    rowTransformHolder,
    colTransformHolder,
    mainImage,
    data,
    visibleIds
  );

  const imageSize = 200;

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

  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const qc = useQueryClient();

  const handleGenAll = async () => {
    const placeholders = tableData.flat().filter(isPlaceholder);

    setIsBulkLoading(true);

    await api_generateImage(placeholders);

    setIsBulkLoading(false);

    qc.invalidateQueries(groupId);
  };

  const btnGenAll = (
    <Button onClick={handleGenAll} rightIcon={<IconWand />}>
      gen all
    </Button>
  );
  return (
    <div>
      <div className="container">
        <h1>Group {groupId}</h1>
        <Title order={1}>grid of images</Title>
        <Title order={2}>transform chooser</Title>
        <Button onClick={() => saveGroupSettings()}>save view to DB</Button>
        <Stack>
          <Group>
            <b>row var</b>
            <Radio.Group value={rowVar} onChange={setRowVar}>
              {variableChoices.map((choice) => {
                return (
                  <Radio
                    key={choice}
                    value={choice}
                    label={getTextForChoice(choice, diffCounts)}
                  />
                );
              })}
            </Radio.Group>
            <Switch
              label="single var only"
              checked={isSingleVar}
              onChange={setIsSingleVar}
            />
          </Group>
          {!isSingleVar && (
            <Group>
              <b>col var</b>
              <Radio.Group value={colVar} onChange={setColVar}>
                {variableChoices.map((choice) => (
                  <Radio
                    key={choice}
                    value={choice}
                    label={getTextForChoice(choice, diffCounts)}
                  />
                ))}
              </Radio.Group>
            </Group>
          )}
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
      </div>

      {isSingleVar ? (
        <div>
          <div>{btnGenAll}</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              maxWidth: "90vw",
              margin: "auto",
            }}
          >
            {tableData.map((row, rowIdx) => (
              <div key={rowIdx} style={{ width: 200 }}>
                <p style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {getRowColHeaderText(
                    rowTransformHolder.transforms[rowIdx],
                    rowVar,
                    mainImage
                  )}
                </p>
                <SdCardOrTableCell
                  cell={row[0]}
                  imageSize={imageSize}
                  handleAddLooseTransform={handleAddLooseTransform}
                  mainImage={mainImage}
                  setMainImage={setMainImage}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Table
          style={{
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th>{isBulkLoading ? <Loader /> : btnGenAll}</th>
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
                  <>
                    <td>
                      <div>
                        {getRowColHeaderText(rowXForm, rowVar, mainImage)}
                      </div>
                    </td>

                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <SdCardOrTableCell
                          cell={cell}
                          mainImage={mainImage}
                          imageSize={imageSize}
                          handleAddLooseTransform={handleAddLooseTransform}
                          setMainImage={setMainImage}
                        />
                      </td>
                    ))}
                  </>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Stack>
        <Title order={1}>all images in group</Title>
        <SdGroupTable
          data={data}
          mainImage={mainImage}
          visibleItems={visibleIds}
          onNewTransform={handleAddLooseTransform}
          onSetMainImage={setMainImage}
        />
      </Stack>
    </div>
  );
}

function getTextForChoice(
  choice: any,
  diffCounts: { cfg: number; seed: number; steps: number; unknown: number }
) {
  const _labelText = choice === "unknown" ? "prompt" : choice;
  const labelText = `${_labelText} (${diffCounts[choice]})`;
  return labelText;
}

function genSimpleXFormList(rowVar: string, uniqValues: any[]) {
  return uniqValues.map((rowHeader) =>
    generateTransformFromSimplerHeader(rowVar, rowHeader)
  );
}

function generateTransformFromSimplerHeader(rowVar: string, rowHeader: any) {
  if (PromptBreakdownSortOrder.includes(rowVar as any)) {
    const rowTransformTemp: SdImageTransformText = {
      type: "text",
      action: "set",
      field: rowVar as any,
      value: rowHeader,
    };
    return rowTransformTemp;
  }

  if (rowVar === "cfg" || rowVar === "steps" || rowVar === "seed") {
    const rowTransformTemp: SdImageTransformNumberRaw = {
      type: "num-raw",
      field: rowVar as any,
      value: rowHeader,
    };
    return rowTransformTemp;
  }

  // this is a substitution
  const rowTransformTemp: SdImageTransformTextSub = {
    type: "text",
    action: "substitute",
    field: rowVar as any,
    value: rowHeader,
  };

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
): SdImageTransformHolder {
  // original process before substitutes

  if (rowColVar === "none") {
    return {
      name: "none",
      transforms: [TransformNone],
    };
  }

  // create a dummy xform to recover the main image
  const dummy =
    rowColVar === "cfg" || rowColVar === "steps" || rowColVar === "seed"
      ? ({
          type: "num-raw",
          field: rowColVar as any,
          value: mainImage[rowColVar as any],
        } as SdImageTransformNumberRaw)
      : ({
          type: "text",
          field: rowColVar as any,
          action: "set",
          value: getTextForBreakdown(mainImage.promptBreakdown),
        } as SdImageTransformTextBasic);

  const isDummyPresent = diffXForm
    .filter((c) => c.type === rowColVar)
    .some((xform) => {
      // run the transform into main image and see if it's the same
      const placeholder = generatePlaceholderForTransform(mainImage, xform);
      const newDiffs = findImageDifferences(mainImage, placeholder);

      return newDiffs.length === 0;
    });

  if (!isDummyPresent) {
    diffXForm.splice(0, 0, dummy);
  }

  const rowTransformHolder: SdImageTransformHolder = {
    name: rowColVar,
    transforms: orderBy(
      uniqBy(
        diffXForm.filter((x) => x.type !== "none" && x.field === rowColVar),
        jsonStringifyStable
      ),
      (c) => {
        return getSortValueForXform(c);
      },
      "desc"
    ),
  };

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

function isPlaceholder(
  item: SdImage | SdImagePlaceHolder
): item is SdImagePlaceHolder {
  return !("id" in item);
}

function SdCardOrTableCell(props: {
  cell: any;
  imageSize: any;
  handleAddLooseTransform: any;
  mainImage: any;
  setMainImage: any;
}) {
  const { cell, imageSize, handleAddLooseTransform, mainImage, setMainImage } =
    props;

  const content =
    cell === undefined ? (
      <div />
    ) : isPlaceholder(cell) ? (
      <SdImagePlaceHolderComp size={imageSize} placeholder={cell} />
    ) : (
      <SdImageComp image={cell} size={imageSize} />
    );

  return (
    <div>
      {content}
      <div style={{ display: "flex" }}>
        <SdPromptToTransform
          promptBreakdown={cell.promptBreakdown}
          onNewTransform={handleAddLooseTransform}
        />
        {"id" in cell && (
          <Button
            onClick={() => setMainImage(cell)}
            color={mainImage.id === cell.id ? "lime" : "blue"}
          >
            set main
          </Button>
        )}
      </div>
    </div>
  );
}
