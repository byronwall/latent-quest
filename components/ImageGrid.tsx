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
import { IconDeviceFloppy, IconWand } from "@tabler/icons";
import axios from "axios";
import produce from "immer";
import { uniq } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useMap } from "react-use";

import {
  findImageDifferences,
  generatePlaceholderForTransforms,
  getImageDiffAsTransforms,
} from "../libs/helpers";
import {
  SdImage,
  SdImageGroup,
  SdImagePlaceHolder,
  SdImageTransform,
  SdImageTransformHolder,
  SdImageTransformMulti,
} from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import {
  getSelectionAsLookup,
  getSelectionFromPromptPart,
} from "./getSelectionFromPromptPart";
import { Switch } from "./MantineWrappers";
import { SdCardOrTableCell } from "./SdCardOrTableCell";
import { SdGroupTable } from "./SdGroupTable";
import { SdSubChooser } from "./SdSubChooser";
import {
  generateSortedTransformList,
  generateTableFromXform,
  genSimpleXFormList,
  getDescForTransform,
  getRowColHeaderText,
} from "./transform_helpers";

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

    initSpecialChoicesCheckAll(
      groupData.view_settings.defaultView.specialChoicesCheckAll ?? {}
    );

    initSpecialChoicesCheckPopup(
      groupData.view_settings.defaultView.specialChoicesCheckPopup ?? {}
    );

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

    postData.view_settings.defaultView.specialChoicesCheckAll =
      specialChoicesCheckAll;
    postData.view_settings.defaultView.specialChoicesCheckPopup =
      specialChoicesCheckPopup;

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

  const [specialChoices, { set: setSpecialChoices }] = useMap<{
    [key: string]: string[];
  }>({});

  const [
    specialChoicesCheckAll,
    { set: setSpecialChoicesCheckAll, setAll: initSpecialChoicesCheckAll },
  ] = useMap<{
    [key: string]: boolean;
  }>({});

  const [
    specialChoicesCheckPopup,
    { set: setSpecialChoicesCheckPopup, setAll: initSpecialChoicesCheckPopup },
  ] = useMap<{
    [key: string]: boolean;
  }>({});

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

      default: {
        const results = [];

        if (specialChoicesCheckPopup[key]) {
          const extraMatch = specialChoices[key] ?? [];
          results.push(...extraMatch);
        }

        if (specialChoicesCheckAll[key]) {
          // get unique values for all
          const allValues = uniq(data.map((x) => getSelectionAsLookup(x)[key]));

          results.push(...allValues);
        }

        return results;
      }
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

  const btnGenAll = isBulkLoading ? (
    <Loader />
  ) : (
    <Button onClick={handleGenAll} rightIcon={<IconWand />}>
      gen all
    </Button>
  );

  return (
    <div>
      <div className="container">
        <h1>Group {groupId}</h1>

        <Stack>
          <Group>
            <b>row var</b>
            <Radio.Group value={rowVar} onChange={setRowVar}>
              {variableChoices.map((choice) => {
                const isSpecial =
                  fixedVariableChoices.indexOf(choice as any) === -1;
                return (
                  <Radio
                    key={choice}
                    value={choice}
                    label={
                      <span>
                        {getTextForChoice(choice, diffCounts)}
                        {isSpecial && (
                          <div>
                            <div>
                              <Switch
                                label="all in group (XXX)"
                                onChange={(newVal) =>
                                  setSpecialChoicesCheckAll(choice, newVal)
                                }
                                checked={
                                  specialChoicesCheckAll[choice] ?? false
                                }
                              />
                            </div>
                            <div style={{ display: "flex" }}>
                              <Switch
                                label="all in popup (XXX)"
                                onChange={(newVal) =>
                                  setSpecialChoicesCheckPopup(choice, newVal)
                                }
                                checked={
                                  specialChoicesCheckPopup[choice] ?? false
                                }
                              />
                              <SdSubChooser
                                activeCategory={choice}
                                onNewChoices={(newChoices) =>
                                  setSpecialChoices(choice, newChoices)
                                }
                              />
                            </div>
                          </div>
                        )}
                      </span>
                    }
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
        <Button
          onClick={() => saveGroupSettings()}
          rightIcon={<IconDeviceFloppy />}
          compact
        >
          save
        </Button>
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
                <div style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  <Title order={3}>
                    {getRowColHeaderText(
                      rowTransformHolder.transforms[rowIdx],
                      rowVar,
                      mainImage
                    )}
                  </Title>
                </div>
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
              <th>{btnGenAll}</th>
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

export function isPlaceholder(
  item: SdImage | SdImagePlaceHolder
): item is SdImagePlaceHolder {
  return !("id" in item);
}
