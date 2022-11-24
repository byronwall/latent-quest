import { orderBy, uniq, uniqBy } from "lodash-es";

import { getSelectionAsLookup } from "./getSelectionFromPromptPart";

import {
  findImageDifferences,
  generatePlaceholderForTransform,
  generatePlaceholderForTransforms,
  isImageSameAsPlaceHolder,
  jsonStringifyStable,
} from "../libs/helpers";
import {
  getTextForBreakdown,
  PromptBreakdownSortOrder,
  TransformNone,
} from "../libs/shared-types/src";

import type {
  SdImage,
  SdImagePlaceHolder,
  SdImageTransform,
  SdImageTransformHolder,
  SdImageTransformNumberRaw,
  SdImageTransformSetTextProp,
  SdImageTransformText,
  SdImageTransformTextBasic,
  SdImageTransformTextSub,
  SdImageStudyDefSettings,
  SdImageTransformImagePromptVariant,
} from "../libs/shared-types/src";

export function generateTableFromXform(
  transformRow: SdImageTransformHolder,
  transformCol: SdImageTransformHolder,
  mainImage: SdImage,
  data: SdImage[]
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

        tableData[row][col] = found ?? placeholder;
      }
    }
  }
  return tableData;
}

export function genSimpleXFormList(
  rowVar: string,
  uniqValues: any[],
  mainImage: SdImage
) {
  return uniqValues.map((rowHeader) => {
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

    if (rowVar === "engine") {
      const rowTransformTemp: SdImageTransformSetTextProp = {
        type: "set-text-prop",
        field: rowVar as any,
        value: rowHeader,
      };

      return rowTransformTemp;
    }

    if (rowVar === "variantStrength") {
      const rowTransformTemp: SdImageTransformImagePromptVariant = {
        type: "image-prompt-variant",
        field: rowVar as any,
        value: rowHeader,
        variantSourceId: mainImage.url,
      };
      return rowTransformTemp;
    }

    // this is a substitution
    const rowTransformTemp: SdImageTransformTextSub = {
      type: "text",
      action: "substitute",
      field: "unknown",
      subKey: rowVar,
      value: [rowHeader],
    };

    return rowTransformTemp;
  });
}

export type SdImageGrid = Array<Array<SdImage | SdImagePlaceHolder>>;

export function generateSortedTransformList(
  rowColVar: string,
  diffXForm: SdImageTransform[],
  mainImage: SdImage
): SdImageTransformHolder {
  if (rowColVar === "none") {
    // short circuit is used when doing a 1D wrap and the col var is requested
    return {
      name: "none",
      transforms: [TransformNone],
    };
  }

  // create a dummy xform to recover the main image
  // choices =
  // get main image value as a num-raw for numerical fields
  // get the OG prompt if requesting prompt differences
  // sub in main image value if doing subs
  const dummy =
    rowColVar === "cfg" || rowColVar === "steps" || rowColVar === "seed"
      ? ({
          type: "num-raw",
          field: rowColVar as any,
          value: mainImage[rowColVar as any],
        } as SdImageTransformNumberRaw)
      : rowColVar === "engine"
      ? ({
          type: "set-text-prop",
          field: rowColVar as any,
          value: mainImage[rowColVar as any],
        } as SdImageTransformSetTextProp)
      : rowColVar === "unknown"
      ? ({
          type: "text",
          field: rowColVar as any,
          action: "set",
          value: getTextForBreakdown(mainImage.promptBreakdown),
        } as SdImageTransformTextBasic)
      : ({
          type: "text",
          field: "unknown",
          subKey: rowColVar,
          action: "substitute",
          value: getSelectionAsLookup(mainImage)[rowColVar],
        } as SdImageTransformTextSub);

  const isDummyPresent = diffXForm
    .filter((c) => c.type === rowColVar)
    .some((xform) => {
      // run the transform into main image and see if it's the same
      const placeholder = generatePlaceholderForTransform(mainImage, xform);
      const newDiffs = findImageDifferences(mainImage, placeholder);

      return newDiffs.length === 0;
    });

  if (!isDummyPresent) {
    diffXForm.unshift(dummy);
  }

  const rowTransformHolder: SdImageTransformHolder = {
    name: rowColVar,
    transforms: orderBy(
      uniqBy(diffXForm, jsonStringifyStable),
      getSortValueForXform,
      "desc"
    ),
  };

  return rowTransformHolder;
}

export function getAllUniqueValuesForChoice(
  rowColVar: string,
  allPossibleXForms: SdImageTransform[]
) {
  const allValues = allPossibleXForms
    .filter(
      (c) => c.field === rowColVar || ("subKey" in c && c.subKey === rowColVar)
    )
    .map(getValueForXForm);

  return orderBy(uniq(allValues));
}

export function getValueForXForm(xform: SdImageTransform) {
  if (xform.type === "multi" || xform.field === "none") {
    return;
  }

  if (
    xform.field === "seed" ||
    xform.field === "cfg" ||
    xform.field === "steps" ||
    xform.field === "variantStrength"
  ) {
    return xform.value;
  }

  if (xform.field === "engine") {
    return xform.value;
  }

  // TODO: this is not correct
  // needs to handle multi-value scenarios
  // needs to address prompt only changes vs. subs
  if (xform.field === "unknown") {
    if (xform.action === "substitute") {
      return xform.value[0];
    }

    return xform.value[0];
  }
}

export function getFinalXFormList(
  rowColVar: string,
  allPossibleXForms: any[],
  _exclusions: any[] | undefined,
  _forcedChoices: any[] | undefined,
  settings: SdImageStudyDefSettings
) {
  const { isExactMatch = true } = settings ?? {};

  const finalColTransforms = allPossibleXForms
    .filter(
      (x) =>
        x.type !== "none" &&
        (x.field === rowColVar || (x as any).subKey === rowColVar)
    )
    .filter(
      (c) => "value" in c && (c.value !== undefined || c.value[0] !== undefined)
    );

  // otherwise, apply the exclusions

  const forcedChoices = _forcedChoices ?? [];
  const exclusions = _exclusions ?? [];

  // forcing wins if present
  const results =
    forcedChoices.length > 0
      ? finalColTransforms.filter((xform) =>
          itemOrArrayContains(forcedChoices, xform, isExactMatch)
        )
      : finalColTransforms.filter(
          (xform) => !itemOrArrayContains(exclusions, xform, isExactMatch)
        );

  const uniqResults = uniqBy(results, jsonStringifyStable);

  const sortedUniqResults = orderBy(uniqResults, getSortValueForXform, "desc");

  return sortedUniqResults;
}

export function itemOrArrayContains(
  needles: any[] | undefined,
  haystack: SdImageTransform,
  isExactMatch = true
): boolean {
  if (needles === undefined) {
    return false;
  }

  const hasMulti = haystack.type === "multi";
  if (hasMulti) {
    return false;
  }

  const isNone = haystack.type === "none";
  if (isNone) {
    return false;
  }

  const searchVals = Array.isArray(haystack.value)
    ? haystack.value
    : [haystack.value];

  const searchObj = searchVals.flatMap((c) =>
    String(c)
      .split("|")
      .map((c) => c.trim())
  );

  return isExactMatch
    ? needles.some((v) => searchVals.includes(v))
    : needles.some((v) => searchObj.includes(v));
}

function getSortValueForXform(c: SdImageTransform) {
  switch (c.type) {
    case "image-prompt-variant":
      return c.value;

    case "text":
      if (c.action === "substitute") {
        return c.value;
      }

      const newLocal = getDescForTransform(c);
      return (c.action === "add" ? 1 : -1) * newLocal.length;

    case "num-raw":
      return c.value;

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

export function getRowColHeaderText(
  xForm: SdImageTransform,
  rowColVar: string,
  mainImage: SdImage
) {
  if (xForm.type === "none") {
    if (rowColVar === "unknown") {
      // get the entire prompt for main image = none xform
      const value = getTextForBreakdown(mainImage.promptBreakdown);
      return `${value}`;
    }

    const value = mainImage[rowColVar];
    return `${rowColVar} = ${value}`;
  }

  const value = getDescForTransform(xForm);

  let lhs = `${rowColVar === "unknown" ? "" : rowColVar + " = "}`;

  if (xForm.type === "text" && xForm.action === "substitute") {
    lhs = "";
  }

  if (rowColVar === "variantStrength") {
    lhs = "strength = ";
  }

  return `${lhs}${value}`;
}

export function getDescForTransform(transform: SdImageTransform): string {
  switch (transform.type) {
    case "text":
      // TODO: improve this so that the table can decide if to display the action
      // for now `substitute` will not appear

      const lhs = transform.action === "substitute" ? "" : transform.action;

      const rhs = Array.isArray(transform.value)
        ? transform.value.join(" + ")
        : transform.value;

      return `${lhs} ${rhs}`;

    case "num-raw":
      return `${transform.value}`;

    case "set-text-prop":
      return `${transform.value}`;

    case "multi":
      return `${transform.transforms.map((t) => getDescForTransform(t))}`;

    case "image-prompt-variant":
      return getVariantStrengthDisplayValue(transform.value);
  }

  return "";
}

export function getVariantStrengthDisplayValue(
  variantStrength: number | undefined
): string {
  if (variantStrength === undefined) {
    return "";
  }

  return `${Math.floor(100 - 100 * variantStrength)}%`;
}
