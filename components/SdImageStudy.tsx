import {
  Button,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { IconEyeOff, IconWand } from "@tabler/icons";
import produce from "immer";
import { orderBy, uniq } from "lodash-es";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useMap } from "react-use";

import { CfgPicker } from "./CfgPicker";
import { EnginePicker } from "./EnginePicker";
import {
  getSelectionAsLookup,
  getSelectionFromPromptPart,
} from "./getSelectionFromPromptPart";
import { isPlaceholder } from "./isPlaceholder";
import { Switch } from "./MantineWrappers";
import { SdCardOrTableCell } from "./SdCardOrTableCell";
import { SeedPicker } from "./SeedPicker";
import { StepsPicker } from "./StepsPicker";
import { SubPicker } from "./SubPicker";
import {
  generateSortedTransformList,
  generateTableFromXform,
  genSimpleXFormList,
  getAllUniqueValuesForChoice,
  getFinalXFormList,
  getRowColHeaderText,
  getValueForXForm,
  itemOrArrayContains,
} from "./transform_helpers";
import { convertStringToType, useCustomChoiceMap } from "./useCustomChoiceMap";
import { useGetImageGroup } from "./useGetImageGroup";
import { SdGroupContext } from "./SdGroupContext";
import { useGroupImageMap } from "./useGroupImageMap";
import { VariantStrengthPicker } from "./VariantStrengthPicker";

import { api_generateImage, api_upsertStudy } from "../model/api";
import {
  getImageDiffAsTransforms,
  getUniversalIdFromImage,
} from "../libs/helpers";
import { getUuid } from "../libs/shared-types/src";

import type { CommonPickerProps } from "./CommonPickerProps";
import type {
  SdImage,
  SdImageStudyDef,
  SdImageTransform,
  SdImageStudyDefSettings,
} from "../libs/shared-types/src";

export interface SdImageStudyProps {
  initialStudyDef: SdImageStudyDef;
  imageGroupData: SdImage[];
}

const fixedVariableChoices = [
  "cfg",
  "seed",
  "steps",
  "unknown",
  "engine",
  "variantStrength",
] as const;

export function SdImageStudy(props: SdImageStudyProps) {
  const { initialStudyDef, imageGroupData: xxx } = props;

  const [studyDefState, setStudyDefState] = useState(initialStudyDef);

  // use the hook which ensures updates pass through when loaded as a bare comp
  const { imageGroup: imageGroupData } = useGetImageGroup(
    studyDefState.groupId,
    xxx
  );

  const { rowVar = "none", colVar = "none" } = studyDefState;

  // holds a map of var name to choices[]
  const { addChoice, customChoices, setChoice, removeChoice } =
    useCustomChoiceMap();

  const {
    hiddenChoices: initialHiddenChoices,
    forcedChoices: initialForcedChoices,
    settings: initialSettings,
  } = useMemo(() => {
    const hiddenChoices = {};
    const forcedChoices = {};

    const { rowVar, colVar, rowValuesExcluded, colValuesExcluded } =
      initialStudyDef;

    if (rowVar) {
      hiddenChoices[rowVar] = convertStringToType(
        rowVar,
        rowValuesExcluded ?? []
      );

      forcedChoices[rowVar] = convertStringToType(
        rowVar,
        initialStudyDef.rowValuesForced ?? []
      );
    }

    if (colVar) {
      hiddenChoices[colVar] = convertStringToType(
        colVar,
        colValuesExcluded ?? []
      );

      forcedChoices[colVar] = convertStringToType(
        colVar,
        initialStudyDef.colValuesForced ?? []
      );
    }

    return { hiddenChoices, forcedChoices, settings: initialStudyDef.settings };
  }, [initialStudyDef]);

  // this list will track those items which should not be visible
  const {
    addChoice: hideChoice,
    customChoices: hiddenChoices,
    setChoice: setHiddenChoice,
  } = useCustomChoiceMap(initialHiddenChoices);

  const {
    customChoices: forcedChoices,
    addChoice: forceChoice,
    setChoice: setForcedChoices,
  } = useCustomChoiceMap(initialForcedChoices);

  const [studySettings, { set: setStudySettings }] =
    useMap<Record<string, SdImageStudyDefSettings>>(initialSettings);

  const handleHideItem = (key: string, xform: SdImageTransform) => {
    // check if item is in the customChoices -- if so, remove it

    const choice = getValueForXForm(xform);

    if (choice === undefined) {
      return;
    }

    // the sub variables should always put the hidden value into exclusions
    const isKeyLinkedToSub = isRowColSubVar(key);
    const isMatch = itemOrArrayContains(customChoices[key], xform);

    if (!isKeyLinkedToSub && isMatch) {
      removeChoice(key, choice);
    } else {
      hideChoice(key, choice);
    }

    // if not there, then add to the list of hiddenChoices
  };

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

  const variableChoices = [...fixedVariableChoices, ...availableSubNames];

  const allSpecialValues = useMemo(() => {
    return availableSubNames.reduce((acc, name) => {
      acc[name] = uniq(
        // false prevents the groups from being split up
        imageGroupData.flatMap((x) => getSelectionAsLookup(x, false)[name])
      );
      return acc;
    }, {} as { [key: string]: string[] });
  }, [imageGroupData, availableSubNames]);

  const resetCustomChoices = useCallback(
    (specificKey?: string) => {
      console.log("resetCustomChoices", specificKey, allSpecialValues);
      Object.entries(allSpecialValues).forEach(([key, values]) => {
        if (specificKey && key !== specificKey) {
          return;
        }
        setChoice(key, values);
      });
    },
    [allSpecialValues, setChoice]
  );

  useEffect(() => {
    // add all the special values to the customChoices
    resetCustomChoices();
  }, [resetCustomChoices]);

  function getExtraChoice(key: string) {
    return customChoices[key] ?? [];
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
    { cfg: 1, seed: 1, steps: 1, unknown: 1, engine: 1, variantStrength: 1 }
  );

  const rowExtras = genSimpleXFormList(
    rowVar,
    getExtraChoice(rowVar),
    mainImage
  );

  const rowXFormsToMap = getFinalXFormList(
    rowVar,
    diffXForm.concat(rowExtras),
    hiddenChoices[rowVar],
    forcedChoices[rowVar],
    studySettings[rowVar]
  );

  const rowTransformHolder = generateSortedTransformList(
    rowVar,
    rowXFormsToMap,
    mainImage
  );

  const isSingleVar = colVar === "none";

  const colVarToUse = colVar;

  // TODO: why does value: [undefined] happen?

  const colExtras =
    colVarToUse === "none"
      ? []
      : genSimpleXFormList(colVarToUse, getExtraChoice(colVarToUse), mainImage);

  const colXFormsToMap = getFinalXFormList(
    colVarToUse,
    diffXForm.concat(colExtras),
    hiddenChoices[colVarToUse],
    forcedChoices[colVarToUse],
    studySettings[colVarToUse]
  );

  const colTransformHolder = generateSortedTransformList(
    colVarToUse,
    colXFormsToMap,
    mainImage
  );

  const tableData = generateTableFromXform(
    rowTransformHolder,
    colTransformHolder,
    mainImage,
    imageGroupData
  );

  const allPossibleXForms = diffXForm.concat(rowExtras).concat(colExtras);

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

  const { groupImages } = useContext(SdGroupContext);

  const handleGenAll = async () => {
    // only run those images which are new
    const placeholders = tableData
      .flat()
      .filter(isPlaceholder)
      .filter((c) => groupImages[getUniversalIdFromImage(c)] === undefined);

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

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveStudy = async () => {
    // fire off API request

    setIsSaving(true);

    // do some logic here to convert the internal state to the saved include/force fields

    const saveData = produce(studyDefState, (draft) => {
      draft.rowValuesForced =
        (draft.rowVar ? forcedChoices[draft.rowVar]?.map(String) : []) ?? [];

      draft.rowValuesExcluded =
        (draft.rowVar ? hiddenChoices[draft.rowVar]?.map(String) : []) ?? [];

      draft.colValuesForced =
        (draft.colVar ? forcedChoices[draft.colVar]?.map(String) : []) ?? [];

      draft.colValuesExcluded =
        (draft.colVar ? hiddenChoices[draft.colVar]?.map(String) : []) ?? [];

      draft.settings = studySettings;

      if (draft.id === "") {
        draft.id = getUuid();
      }
    });

    console.log("saveData", saveData);

    // push save state into current - should give bumpless return
    await api_upsertStudy(saveData);
    setStudyDefState(saveData);

    qc.invalidateQueries();

    setIsSaving(false);
  };

  const isFieldVisible = (field: string) => {
    return rowVar === field || colVar === field;
  };

  const varNameComp = {
    cfg: CfgPicker,
    seed: SeedPicker,
    steps: StepsPicker,
    engine: EnginePicker,
    variantStrength: VariantStrengthPicker,
  };

  const isRowColSubVar = (field: string) => {
    return availableSubNames.includes(field);
  };

  // add the SubPicker if needed
  [rowVar, colVar].filter(isRowColSubVar).forEach((varName) => {
    varNameComp[varName] = SubPicker;
  });

  const groupDataMap = useGroupImageMap(imageGroupData);

  return (
    <SdGroupContext.Provider value={{ groupImages: groupDataMap }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Title order={2}>image study</Title>
        <div>
          {isSaving ? (
            <Loader />
          ) : (
            <Button onClick={handleSaveStudy}>save study</Button>
          )}
        </div>

        <Group>
          {rowVarSelect}

          {!isSingleVar && <> {colVarSelect} </>}
          {!isSingleVar && <Button onClick={handleFlipRowCol}>flip</Button>}

          <Switch
            label="row var only (will wrap)"
            checked={isSingleVar}
            onChange={(newVal) => {
              if (newVal) {
                setColVar("none");
              } else {
                setColVar("seed");
              }
            }}
          />
        </Group>

        <Stack>
          {Object.keys(varNameComp).map((varName) => {
            // iterates through all picker options and renders those that are needed
            if (!isFieldVisible(varName)) {
              return null;
            }

            const Comp = varNameComp[varName] as React.FC<
              CommonPickerProps<any>
            >;
            return (
              <Comp
                key={varName}
                rowColVar={varName}
                choices={getAllUniqueValuesForChoice(
                  varName,
                  allPossibleXForms
                )}
                onAddItem={(item) => addChoice(varName, item)}
                forcedChoices={forcedChoices[varName] ?? []}
                onSetForcedChoice={(item) => setForcedChoices(varName, item)}
                exclusions={hiddenChoices[varName] ?? []}
                onSetExclusion={(item) => setHiddenChoice(varName, item)}
                settings={studySettings[varName] ?? {}}
                onSetSettings={(newSettings) =>
                  setStudySettings(varName, newSettings)
                }
                mainImage={mainImage}
                onResetChoices={() => resetCustomChoices(varName)}
              />
            );
          })}
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
                gap: 5,
              }}
            >
              {tableData.map((row, rowIdx) => {
                const rowXForm = rowTransformHolder.transforms[rowIdx];
                return (
                  <div
                    key={rowIdx}
                    style={{
                      width: imageSize,
                    }}
                  >
                    <p
                      className="prompt-clip"
                      style={{
                        height: 54,
                        textOverflow: "ellipsis",
                        paddingLeft: 8,
                        background: "#E7F5FF",
                        WebkitLineClamp: 2,
                        borderTopRightRadius: 8,
                        borderTopLeftRadius: 8,
                        position: "relative",
                      }}
                    >
                      {getRowColHeaderText(rowXForm, rowVar, mainImage)}
                      <Button
                        style={{ position: "absolute", top: 0, right: 0 }}
                        compact
                        size="xs"
                        variant="subtle"
                        onClick={() => handleHideItem(rowVar, rowXForm)}
                      >
                        <IconEyeOff />
                      </Button>
                    </p>

                    <SdCardOrTableCell cell={row[0]} imageSize={imageSize} />
                  </div>
                );
              })}
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
                        position: "relative",
                      }}
                    >
                      {getRowColHeaderText(col, colVar, mainImage)}
                      <Button
                        style={{ position: "absolute", top: 0, right: 0 }}
                        compact
                        variant="subtle"
                        onClick={() => handleHideItem(colVar, col)}
                      >
                        <IconEyeOff />
                      </Button>
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
                        <div
                          className="prompt-clip"
                          style={{ position: "relative" }}
                        >
                          {getRowColHeaderText(rowXForm, rowVar, mainImage)}
                          <Button
                            style={{ position: "absolute", top: 0, right: 0 }}
                            compact
                            variant="subtle"
                            onClick={() => handleHideItem(rowVar, rowXForm)}
                          >
                            <IconEyeOff />
                          </Button>
                        </div>
                      </td>

                      {row.map((cell, colIndex) => (
                        <td key={colIndex}>
                          <SdCardOrTableCell
                            cell={cell}
                            imageSize={imageSize}
                            mainImage={mainImage}
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
      </div>
    </SdGroupContext.Provider>
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
    case "variantStrength":
      const labelText = `${_labelText} (${diffCounts[choice]})`;
      return labelText;

    default:
      return "**" + _labelText;
  }
}
