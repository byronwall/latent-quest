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
import { useMemo, useState } from "react";
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
import { SdSubChooser } from "./SdSubChooser";
import { SeedPicker } from "./SeedPicker";
import { StepsPicker } from "./StepsPicker";
import {
  generateSortedTransformList,
  generateTableFromXform,
  genSimpleXFormList,
  getAllUniqueValuesForChoice,
  getFinalXFormList,
  getRowColHeaderText,
  getValueForXForm,
} from "./transform_helpers";
import { useCustomChoiceMap } from "./useCustomChoiceMap";

import { api_generateImage, api_upsertStudy } from "../model/api";
import { getImageDiffAsTransforms } from "../libs/helpers";

import type {
  SdImage,
  SdImageStudyDef,
  SdImageTransform,
} from "../libs/shared-types/src";

interface SdImageStudyProps {
  initialStudyDef: SdImageStudyDef;
  imageGroupData: SdImage[];
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

  // holds a map of var name to choices[]
  const { addChoice, customChoices, setChoice, removeChoice } =
    useCustomChoiceMap();

  // this list will track those items which should not be visible
  const {
    addChoice: hideChoice,
    customChoices: hiddenChoices,
    setChoice: setHiddenChoice,
  } = useCustomChoiceMap();

  const {
    customChoices: forcedChoices,
    addChoice: forceChoice,
    setChoice: setForcedChoices,
  } = useCustomChoiceMap();

  const handleHideItem = (key: string, xform: SdImageTransform) => {
    // check if item is in the customChoices -- if so, remove it

    const choice = getValueForXForm(xform);

    if (choice === undefined) {
      return;
    }

    if (customChoices[key]?.includes(choice)) {
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
    { cfg: 1, seed: 1, steps: 1, unknown: 1, engine: 1 }
  );

  const rowExtras = genSimpleXFormList(rowVar, getExtraChoice(rowVar));

  const rowXFormsToMap = getFinalXFormList(
    rowVar,
    diffXForm.concat(rowExtras),
    hiddenChoices[rowVar],
    forcedChoices[rowVar]
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
      : genSimpleXFormList(colVarToUse, getExtraChoice(colVarToUse));

  const colXFormsToMap = getFinalXFormList(
    colVarToUse,
    diffXForm.concat(colExtras),
    hiddenChoices[colVarToUse],
    forcedChoices[colVarToUse]
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveStudy = async () => {
    // fire off API request

    setIsSaving(true);

    await api_upsertStudy(studyDefState);
    qc.invalidateQueries();

    setIsSaving(false);
  };

  const isFieldVisible = (field: string) => {
    return rowVar === field || colVar === field;
  };

  const seedPickerComp = isFieldVisible("seed") && (
    <SeedPicker
      choices={getAllUniqueValuesForChoice("seed", allPossibleXForms)}
      onAddItem={(item) => addChoice("seed", item)}
      forcedChoices={forcedChoices.seed}
      onSetForcedChoice={(newChoices) => setForcedChoices("seed", newChoices)}
      exclusions={hiddenChoices.seed ?? []}
      onSetExclusion={(item) => setHiddenChoice("seed", item)}
    />
  );

  const cfgPickerComp = isFieldVisible("cfg") && (
    <CfgPicker
      choices={getAllUniqueValuesForChoice("cfg", allPossibleXForms)}
      onAddItem={(item) => addChoice("cfg", item)}
      forcedChoices={forcedChoices.cfg ?? []}
      onSetForcedChoice={(item) => setForcedChoices("cfg", item)}
      exclusions={hiddenChoices.cfg ?? []}
      onSetExclusion={(item) => setHiddenChoice("cfg", item)}
    />
  );

  const stepsPickerComp = isFieldVisible("steps") && (
    <StepsPicker
      choices={getAllUniqueValuesForChoice("steps", allPossibleXForms)}
      onAddItem={(item) => addChoice("steps", item)}
      forcedChoices={forcedChoices.steps ?? []}
      onSetForcedChoice={(item) => setForcedChoices("steps", item)}
      exclusions={hiddenChoices.steps ?? []}
      onSetExclusion={(item) => setHiddenChoice("steps", item)}
    />
  );

  const enginePickerComp = isFieldVisible("engine") && (
    <EnginePicker
      choices={getAllUniqueValuesForChoice("engine", allPossibleXForms)}
      onAddItem={(item) => addChoice("engine", item)}
      forcedChoices={forcedChoices.engine ?? []}
      onSetForcedChoice={(item) => setForcedChoices("engine", item)}
      exclusions={hiddenChoices.engine ?? []}
      onSetExclusion={(item) => setHiddenChoice("engine", item)}
    />
  );

  return (
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
        {rowSpecial}
        {colSpecial}
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
        {seedPickerComp}
        {cfgPickerComp}
        {stepsPickerComp}
        {enginePickerComp}
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
            {tableData.map((row, rowIdx) => {
              const rowXForm = rowTransformHolder.transforms[rowIdx];
              return (
                <div key={rowIdx} style={{ width: 200 }}>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Title order={3}>
                      {getRowColHeaderText(rowXForm, rowVar, mainImage)}
                    </Title>
                  </div>
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
