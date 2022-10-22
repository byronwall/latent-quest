import {
  PromptBreakdown,
  PromptBreakdownSortOrder,
  SdImage,
  SdImagePlaceHolder,
  SdImageTransform,
  SdImageTransformNonMulti,
} from "./shared-types/src";
import * as cloneDeep from "clone-deep";
import { isEqual, orderBy } from "lodash-es";

export function isImageSameAsPlaceHolder(
  item: SdImage,
  placeholder: SdImagePlaceHolder
): unknown {
  const sortedItem = sortPromptBreakdown(item);
  const sortedPlaceholder = sortPromptBreakdown(placeholder);
  const promptSame = isEqual(sortedItem, sortedPlaceholder);

  return (
    promptSame &&
    item.cfg === placeholder.cfg &&
    item.seed === placeholder.seed &&
    item.steps === placeholder.steps
  );
}

function sortPromptBreakdown(item: SdImage | SdImagePlaceHolder) {
  return orderBy(item.promptBreakdown?.parts, (c) => c.label + c.text);
}

export function getImageDiffAsTransforms(base: SdImage, allImages: SdImage[]) {
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

  return results;
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
    if (cur.type === "num-delta" || cur.type === "none") {
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
    const keep = [];
    const keepObj = [];
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
  base: SdImage,
  comp: SdImage,
  { shouldReportAddRemove = true } = {}
): SdImageTransformNonMulti[] {
  const results: SdImageTransformNonMulti[] = [];

  // find the differences between the base and the comp

  const numRawChecks = ["seed", "cfg", "steps"] as const;

  for (const numRawCheck of numRawChecks) {
    if (base[numRawCheck] !== comp[numRawCheck]) {
      results.push({
        type: "num-raw",
        field: numRawCheck,
        value: comp[numRawCheck],
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

      const added = compText.filter((c) => !baseText.includes(c));
      const removed = baseText.filter((c) => !compText.includes(c));

      if (added.length > 0) {
        breakdownDeltas.push({
          type: "text",
          field: breakdownType,
          action: "add",
          value: added,
        });
      }

      if (removed.length > 0) {
        breakdownDeltas.push({
          type: "text",
          field: breakdownType,
          action: "remove",
          value: removed,
        });
      }
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
    case "num-delta":
      // TODO: apply a min/max
      placeholder[transform.field] += transform.delta;
      break;

    case "multi":
      console.error("multi transforms not supported");
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
          placeholder.promptBreakdown.parts.push(
            ...toAdd.map((c) => ({ text: c, label: transform.field }))
          );
          break;
        }

        case "remove": {
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
      }
      break;
    }
  }
  return placeholder;
}
