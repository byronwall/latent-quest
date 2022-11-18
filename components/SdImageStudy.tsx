import {
  Button,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { IconWand } from "@tabler/icons";
import produce from "immer";
import { orderBy, uniq } from "lodash-es";
import { useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useMap } from "react-use";

import { getImageDiffAsTransforms } from "../libs/helpers";
import { SdImage } from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import {
  getSelectionAsLookup,
  getSelectionFromPromptPart,
} from "./getSelectionFromPromptPart";
import { isPlaceholder } from "./isPlaceholder";
import { Switch } from "./MantineWrappers";
import { SdCardOrTableCell } from "./SdCardOrTableCell";
import { SdSubChooser } from "./SdSubChooser";
import {
  generateSortedTransformList,
  generateTableFromXform,
  genSimpleXFormList,
  getRowColHeaderText,
} from "./transform_helpers";

interface SdImageStudyProps {
  initialStudyDef: SdImageStudyDef;
  imageGroupData: SdImage[];
}

interface SdImageStudyDef {
  title?: string;
  description?: string;

  rowVar?: string;

  // 1D study will have an undefined colVar
  colVar?: string | undefined;

  // these will store the known values at time of creation
  // these will also store the desired order if the user moved things around
  rowValues?: string[];
  colValues?: string[] | undefined;

  // these will store the items being displayed
  rowValuesDisplayed?: string[];
  colValuesDisplayed?: string[] | undefined;

  mainImageId: string;
}

export function SdImageStudy(props: SdImageStudyProps) {
  const { initialStudyDef, imageGroupData } = props;

  const [studyDefState, setStudyDefState] = useState(initialStudyDef);

  const {
    rowVar = "none",
    colVar = "none",
    rowValues,
    colValues,
  } = studyDefState;

  const availableSubNames = useMemo(
    () =>
      uniq(
        imageGroupData.reduce((acc, item) => {
          item.promptBreakdown.parts.forEach((part) => {
            const selections = getSelectionFromPromptPart(part);

            acc.push(...selections.map((sel) => sel.name));
          });
          return acc;
        }, [] as string[])
      ),
    [imageGroupData]
  );

  const fixedVariableChoices = [
    "cfg",
    "seed",
    "steps",
    "unknown",
    "engine",
  ] as const;

  const variableChoices = [...fixedVariableChoices, ...availableSubNames];

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

  const allSpecialValues = useMemo(() => {
    return availableSubNames.reduce((acc, name) => {
      acc[name] = uniq(
        // false prevents the groups from being split up
        imageGroupData.flatMap((x) => getSelectionAsLookup(x, false)[name])
      );
      return acc;
    }, {} as { [key: string]: string[] });
  }, [imageGroupData, availableSubNames]);

  function getExtraChoice(key: string) {
    switch (key) {
      case "cfg":
      case "seed":
      case "steps":
      case "engine":
      case "unknown":
        return [];

      default: {
        const results: string[] = [];

        if (specialChoicesCheckPopup[key]) {
          const extraMatch = specialChoices[key] ?? [];
          results.push(...extraMatch);
        }

        if (specialChoicesCheckAll[key]) {
          // get unique values for all
          const allValues = allSpecialValues[key] ?? [];

          results.push(...allValues);
        }

        return results;
      }
    }
  }

  const mainImage = useMemo(() => {
    const mainImage = imageGroupData.find(
      (x) => x.id === initialStudyDef.mainImageId
    );

    if (!mainImage) {
      throw new Error("mainImage not found");
    }

    return mainImage;
  }, [imageGroupData, initialStudyDef.mainImageId]);

  const diffXForm = getImageDiffAsTransforms(mainImage, imageGroupData);

  // extra choices to transform

  // get diff counts by field
  const diffCounts = diffXForm.reduce(
    (acc, x) => {
      acc[x.field] += 1;
      return acc;
    },
    { cfg: 1, seed: 1, steps: 1, unknown: 1, engine: 1 }
  );

  const rowExtras = genSimpleXFormList(rowVar, getExtraChoice(rowVar));

  const rowTransformHolder = generateSortedTransformList(
    rowVar,
    diffXForm.concat(rowExtras),
    mainImage
  );

  const isSingleVar = colVar === "none";

  const colVarToUse = colVar;

  // TODO: why does value: [undefined] happen?

  const colExtras =
    colVarToUse === "none"
      ? []
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
    imageGroupData
  );

  const getSelectorsForVariableList = (choice) =>
    fixedVariableChoices.indexOf(choice as any) === -1 ? (
      <div>
        <b>{choice}</b>
        <div>
          <Switch
            label={`group (${allSpecialValues[choice]?.length ?? 0})`}
            onChange={(newVal) => setSpecialChoicesCheckAll(choice, newVal)}
            checked={specialChoicesCheckAll[choice] ?? false}
          />
        </div>
        <div style={{ display: "flex" }}>
          <Switch
            label={`popup (${specialChoices[choice]?.length ?? 0})`}
            onChange={(newVal) => setSpecialChoicesCheckPopup(choice, newVal)}
            checked={specialChoicesCheckPopup[choice] ?? false}
          />
          <SdSubChooser
            activeCategory={choice}
            onNewChoices={(newChoices) => setSpecialChoices(choice, newChoices)}
          />
        </div>
      </div>
    ) : null;

  const rowSpecial = getSelectorsForVariableList(rowVar);
  const colSpecial = getSelectorsForVariableList(colVar);

  const getSelectForVar = (
    selectVar: string,
    handleChange: (newVal: string) => void,
    label: string
  ) => (
    <Select
      maxDropdownHeight={300}
      label={label}
      data={orderBy(variableChoices).map((choice) => ({
        label: getTextForChoice(choice, diffCounts),
        value: choice,
      }))}
      value={selectVar}
      onChange={(val) => handleChange(val ?? "cfg")}
      searchable
    />
  );

  const setRowVar = (newVal: string) => {
    setStudyDefState(
      produce((draft) => {
        draft.rowVar = newVal;
      })
    );
  };

  const setColVar = (newVal: string) => {
    setStudyDefState(
      produce((draft) => {
        draft.colVar = newVal;
      })
    );
  };

  const rowVarSelect = getSelectForVar(rowVar, setRowVar, "row var");
  const colVarSelect = getSelectForVar(colVar, setColVar, "col var");

  const imageSize = 200;

  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const newItemCount = tableData.flat().filter(isPlaceholder).length;

  const qc = useQueryClient();

  const handleGenAll = async () => {
    const placeholders = tableData.flat().filter(isPlaceholder);

    setIsBulkLoading(true);

    await api_generateImage(placeholders);

    setIsBulkLoading(false);

    qc.invalidateQueries();
  };

  const btnGenAll = isBulkLoading ? (
    <Loader />
  ) : (
    newItemCount > 0 && (
      <Button onClick={handleGenAll} rightIcon={<IconWand />}>
        gen all ({newItemCount})
      </Button>
    )
  );

  const handleFlipRowCol = () => {
    setStudyDefState(
      produce((draft) => {
        const tmp = draft.rowVar;
        draft.rowVar = draft.colVar;
        draft.colVar = tmp;
      })
    );
  };

  return (
    <div>
      <Title order={2}>image study</Title>

      <Stack>
        <Group>
          <>
            {rowVarSelect}

            {!isSingleVar && <> {colVarSelect} </>}
            {!isSingleVar && <Button onClick={handleFlipRowCol}>flip</Button>}
            {rowSpecial}
            {colSpecial}
            <Switch
              label="single var only"
              checked={isSingleVar}
              onChange={(newVal) => {
                if (newVal) {
                  setColVar("none");
                } else {
                  setColVar("seed");
                }
              }}
            />
          </>
        </Group>
      </Stack>
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
                <SdCardOrTableCell cell={row[0]} imageSize={imageSize} />
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
                <th key={idx}>
                  <div
                    className="prompt-clip"
                    style={{
                      maxHeight: 300,
                    }}
                  >
                    {getRowColHeaderText(col, colVar, mainImage)}
                  </div>
                </th>
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
                      <div className="prompt-clip">
                        {getRowColHeaderText(rowXForm, rowVar, mainImage)}
                      </div>
                    </td>

                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <SdCardOrTableCell cell={cell} imageSize={imageSize} />
                      </td>
                    ))}
                  </>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function getTextForChoice(
  choice: any,
  diffCounts: {
    cfg: number;
    seed: number;
    steps: number;
    unknown: number;
    engine: number;
  }
) {
  const _labelText = choice === "unknown" ? "prompt" : choice;

  switch (choice) {
    case "cfg":
    case "seed":
    case "steps":
    case "engine":
    case "unknown":
      const labelText = `${_labelText} (${diffCounts[choice]})`;
      return labelText;

    default:
      return "**" + _labelText;
  }
}
