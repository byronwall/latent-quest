import * as cloneDeep from "clone-deep";
import { isEqual, uniqBy } from "lodash-es";

import {
  getTextForBreakdown,
  PromptBreakdownSortOrder,
} from "./shared-types/src";

import { selRegex } from "../components/getSelectionFromPromptPart";
import { getTextOnlyFromPromptPartWithLabel } from "../components/getTextOnlyFromPromptPartWithLabel";

import type {
  PromptBreakdown,
  SdImage,
  SdImagePlaceHolder,
  SdImageTransform,
  SdImageTransformNonMulti,
  SdImageTransformText,
} from "./shared-types/src";

export function getUniversalIdFromImage(
  image: SdImage | SdImagePlaceHolder
): string {
  return [
    image.cfg,
    image.engine,
    image.seed,
    image.steps,
    image.urlImageSource,
    image.urlMaskSource,
    getTextForBreakdown(image.promptBreakdown),
  ].join("-");
}

export function isImageSameAsPlaceHolder(
  item: SdImage | SdImagePlaceHolder,
  placeholder: SdImage | SdImagePlaceHolder
): unknown {
  // force the prompt to true text for comparison
  const sortedItem = getTextOnlyFromPromptPartWithLabel(
    getTextForBreakdown(item.promptBreakdown)
  );
  const sortedPlaceholder = getTextOnlyFromPromptPartWithLabel(
    getTextForBreakdown(placeholder.promptBreakdown)
  );

  const promptSame = sortedItem === sortedPlaceholder;

  const sameCfg = item.cfg === placeholder.cfg;
  const sameSeed = item.seed === placeholder.seed;
  const sameSteps = item.steps === placeholder.steps;
  const sameEngine = item.engine === placeholder.engine;

  const sameVariant = item.variantSourceId === placeholder.variantSourceId;
  const sameVariantStrength =
    item.variantStrength === placeholder.variantStrength;

  const sameImageUrl = item.urlImageSource === placeholder.urlImageSource;
  const sameMaskUrl = item.urlMaskSource === placeholder.urlMaskSource;

  return (
    promptSame &&
    sameCfg &&
    sameSeed &&
    sameSteps &&
    sameEngine &&
    sameVariant &&
    sameVariantStrength &&
    sameImageUrl &&
    sameMaskUrl
  );
}

export function getImageDiffAsTransforms(
  base: SdImage,
  allImages: (SdImage | SdImagePlaceHolder)[]
) {
  const results: SdImageTransform[] = [];

  if (base === undefined || allImages === undefined || allImages.length === 0) {
    return results;
  }

  for (const image of allImages) {
    const diffs = findImageDifferences(base, image, {
      shouldReportAddRemove: true,
    });

    // group by diff type -- allows text changes to be grouped together
    const groupedDiffs = diffs.reduce((acc, cur) => {
      const key = cur.field;
      if (acc[key] === undefined) {
        acc[key] = [];
      }
      acc[key].push(cur);
      return acc;
    }, {} as Record<string, SdImageTransform[]>);

    for (const group of Object.values(groupedDiffs)) {
      if (group.length === 1) {
        results.push(group[0]);
      } else {
        results.push({
          type: "multi",
          transforms: group,
          field: group[0].field,
        });
      }
    }
  }

  // crude hack to avoid dealing with various data types
  return uniqBy(results, JSON.stringify);
}

export function summarizeAllDifferences(base: SdImage, allImages: SdImage[]) {
  const results: SdImageTransformNonMulti[] = [];

  if (base === undefined || allImages === undefined || allImages.length === 0) {
    return results;
  }

  for (const image of allImages) {
    const diffs = findImageDifferences(base, image, {
      shouldReportAddRemove: true,
    });
    results.push(...diffs);
  }

  // take all of those and build a unique summary

  const summary = results.reduce((acc, cur) => {
    if (cur.type === "none") {
      // skip deltas -- they won't appear
      return acc;
    }

    if (acc[cur.field] === undefined) {
      acc[cur.field] = [];
    }

    acc[cur.field].push(cur.value);

    return acc;
  }, {});

  // force those values to be unique
  for (const key of Object.keys(summary)) {
    const keep: string[] = [];
    const keepObj: any[] = [];
    for (const value of summary[key]) {
      const checkVal = JSON.stringify(value);
      if (!keep.includes(checkVal)) {
        keep.push(checkVal);
        keepObj.push(value);
      }
    }

    summary[key] = keepObj;
  }

  // for the fields that changed -- add the base values in too
  for (const key of Object.keys(summary)) {
    if (PromptBreakdownSortOrder.includes(key as any)) {
      // add in the baseline value
      summary[key].unshift(
        base.promptBreakdown.parts
          .filter((c) => c.label === key)
          .map((c) => c.text)
      );
      continue;
    }
    const baseVal = base[key];
    if (baseVal === null || baseVal === undefined) {
      continue;
    }
    summary[key].unshift(baseVal);
  }

  return summary;
}

export function findImageDifferences(
  base: SdImage | SdImagePlaceHolder,
  comp: SdImage | SdImagePlaceHolder,
  { shouldReportAddRemove = true } = {}
) {
  const results: SdImageTransformNonMulti[] = [];

  // find the differences between the base and the comp

  const numRawChecks = ["seed", "cfg", "steps"] as const;

  for (const numRawCheck of numRawChecks) {
    if (base[numRawCheck] !== comp[numRawCheck]) {
      results.push({
        field: numRawCheck,
        type: "num-raw",
        value: comp[numRawCheck] ?? 0,
      });
    }
  }

  const propCheckRaw = ["engine"] as const;

  for (const propRawCheck of propCheckRaw) {
    if (base[propRawCheck] !== comp[propRawCheck]) {
      results.push({
        field: propRawCheck,
        type: "set-text-prop",
        value: comp[propRawCheck],
      });
    }
  }

  // find the differences in the prompt breakdown
  const breakdownDeltas = getBreakdownDelta(
    base.promptBreakdown,
    comp.promptBreakdown,
    shouldReportAddRemove
  );

  results.push(...breakdownDeltas);

  return results;
}

export function getBreakdownDelta(
  baseBreakdown: PromptBreakdown,
  compBreakdown: PromptBreakdown,
  shouldReportAddRemove: boolean
) {
  const breakdownDeltas: SdImageTransformNonMulti[] = [];

  if (baseBreakdown === undefined || compBreakdown === undefined) {
    return breakdownDeltas;
  }

  for (const breakdownType of PromptBreakdownSortOrder) {
    const baseParts = baseBreakdown.parts.filter(
      (c) => c.label === breakdownType
    );
    const compParts = compBreakdown.parts.filter(
      (c) => c.label === breakdownType
    );

    if (shouldReportAddRemove) {
      const baseText = baseParts.map((c) => c.text);
      const compText = compParts.map((c) => c.text);

      compText.forEach((compTextItem, idx) => {
        if (baseText.includes(compTextItem)) {
          return;
        }

        const newDelta: SdImageTransformText = {
          type: "text",
          field: breakdownType,
          action: "add",
          value: compTextItem,
          index: idx,
        };

        breakdownDeltas.push(newDelta);
      });

      baseText.forEach((baseTextItem, idx) => {
        if (compText.includes(baseTextItem)) {
          return;
        }

        const newDelta: SdImageTransformText = {
          type: "text",
          field: breakdownType,
          action: "remove",
          value: baseTextItem,
          index: idx,
        };
        breakdownDeltas.push(newDelta);
      });
    } else {
      if (!isEqual(baseParts, compParts)) {
        breakdownDeltas.push({
          type: "text",
          field: breakdownType,
          action: "set",
          value: compParts.map((c) => c.text),
        });
      }
    }
  }
  return breakdownDeltas;
}

export function generatePlaceholderForTransforms(
  baseImage: SdImage,
  transform: SdImageTransform[]
): SdImagePlaceHolder {
  const finalImage = transform.reduce((acc, cur) => {
    if (cur.type === "multi") {
      cur.transforms.forEach((c) => {
        acc = generatePlaceholderForTransform(acc, c);
      });
    } else {
      acc = generatePlaceholderForTransform(acc, cur);
    }
    return acc;
  }, cloneDeep(baseImage));

  return finalImage;
}

export function generatePlaceholderForTransform(
  baseImage: SdImage,
  transform: SdImageTransform
): SdImagePlaceHolder {
  // deep copy the base image
  const placeholder = cloneDeep(baseImage);
  delete placeholder.id;
  delete placeholder.url;
  delete placeholder.dateCreated;

  switch (transform.type) {
    case "num-raw":
      placeholder[transform.field] = transform.value;
      break;

    case "set-text-prop":
      placeholder[transform.field] = transform.value;
      break;

    case "text": {
      if (placeholder.promptBreakdown === undefined) {
        break;
      }
      switch (transform.action) {
        case "add": {
          const toAdd = Array.isArray(transform.value)
            ? transform.value
            : [transform.value];

          // insert at index or end
          const index =
            transform.index ?? placeholder.promptBreakdown.parts.length;

          placeholder.promptBreakdown.parts.splice(
            index,
            0,
            ...toAdd.map((c) => ({ text: c, label: transform.field }))
          );
          break;
        }

        case "remove": {
          // removal currently ignores the index -- probably OK
          const toRemove = Array.isArray(transform.value)
            ? transform.value
            : [transform.value];

          placeholder.promptBreakdown.parts =
            placeholder.promptBreakdown.parts.filter((c) => {
              return !toRemove.includes(c.text) || c.label !== transform.field;
            });
          break;
        }
        case "set": {
          const toSet = Array.isArray(transform.value)
            ? transform.value
            : [transform.value];

          placeholder.promptBreakdown.parts =
            placeholder.promptBreakdown.parts.filter(
              (c) => c.label !== transform.field
            );
          placeholder.promptBreakdown.parts.push(
            ...toSet.map((c) => ({ text: c, label: transform.field }))
          );

          break;
        }

        case "substitute": {
          const toSubstitute = (transform.value ?? []).join("|");

          // if a given breakdown contains the {xxx: yyy} pattern, replace with transform
          placeholder.promptBreakdown.parts =
            placeholder.promptBreakdown.parts.map((c) => {
              let match;
              while ((match = selRegex.exec(c.text))) {
                if (match && match[1] === transform.subKey) {
                  if (toSubstitute) {
                    return {
                      ...c,
                      text: c.text.replace(
                        selRegex,
                        `{${transform.subKey}: ${toSubstitute}}`
                      ),
                    };
                  }
                }
              }

              return c;
            });
        }
      }
      break;
    }
  }
  return placeholder;
}

export function jsonStringifyStable(obj: any) {
  // built by CoPilot
  // similar https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      return Object.keys(value)
        .sort()
        .reduce((acc, cur) => {
          acc[cur] = value[cur];
          return acc;
        }, {} as any);
    }
    return value;
  });
}
