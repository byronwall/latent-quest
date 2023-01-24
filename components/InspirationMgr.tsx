import { TextInput } from "@mantine/core";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "./Button";
import { getSelectionAsLookup } from "./getSelectionFromPromptPart";
import { getImageUrl } from "./ImageList";
import { queryFnGetImageGroup } from "./useGetImageGroup";

import { getTextForBreakdown } from "../libs/shared-types/src";

import type { SdImage } from "../libs/shared-types/src";

export type InspirationEntry = {
  prompt: string;
  category: string;
  value: string;

  imageUrl: string;
  imageId: string;
};

type InspirationFromGroup = Record<string, Record<string, SdImage>>;

type InspirationLookup = Record<string, InspirationEntry[]>;

type InspirationMgrProps = {
  onAddInspiration: (inspiration: InspirationEntry) => void;
};

export function InspirationMgr(props: InspirationMgrProps) {
  const { onAddInspiration } = props;

  const [testData, setTestData] = useState<InspirationEntry[]>([]);

  useEffect(() => {
    // load from test group
    async function buildInitial() {
      const testInspirs = await buildInspirationFromGroupId(
        "3d473223-16b6-4146-998c-1dc236ae319b"
      );

      setTestData(testInspirs);
    }

    buildInitial();
  }, []);

  // create a lookup table of category -> values
  const inspirationLookup = useMemo(() => {
    const lookup: InspirationLookup = {};
    testData.forEach((item) => {
      if (!lookup[item.category]) {
        lookup[item.category] = [];
      }
      lookup[item.category].push(item);
    });

    // sort the lookup values
    Object.keys(lookup).forEach((key) => {
      lookup[key].sort((a, b) => a.value.localeCompare(b.value));
    });

    return lookup;
  }, [testData]);

  // get categories and sort them - memo
  const categories = useMemo(() => {
    const categories = Object.keys(inspirationLookup);
    categories.sort();
    return categories;
  }, [inspirationLookup]);

  // pick 20 random inspirations from test data -- must be without replacement
  // const randomInspirations = useMemo(() => {
  //   const randomInspirations: InspirationEntry[] = [];
  //   const itemCount = Math.min(20, testData.length);
  //   for (let i = 0; i < itemCount; i++) {
  //     const randomIndex = Math.floor(Math.random() * testData.length);
  //     randomInspirations.push(testData[randomIndex]);
  //   }
  //   return randomInspirations;
  // }, [testData]);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);

  useEffect(() => {
    setActiveCategory(categories[0]);
  }, [categories]);

  const activeCategoryValues = useMemo(() => {
    return inspirationLookup[activeCategory] ?? [];
  }, [activeCategory, inspirationLookup]);

  const [testGroupId, setTestGroupId] = useState<string>("");

  const handleLoadTestGroup = async () => {
    // get the group images

    const inspirations = await buildInspirationFromGroupId(testGroupId);

    setTestData(inspirations);

    // remove "inspir" and split into groups
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <h1>inspiration</h1>
      <div>
        <p>build list from group ID</p>
        <div>
          <TextInput
            value={testGroupId}
            onChange={(e) => setTestGroupId(e.currentTarget.value)}
          />
          <Button onClick={handleLoadTestGroup}>load test group</Button>
        </div>
      </div>

      <div>
        <p>choose a base image</p>
        <div className="flex flex-wrap gap-4">
          {[
            "symmetrical face",
            "landscape of barn",
            "abstract",
            "moon and stars",
            "dump truck",
          ].map((item) => (
            <div key={item} className=" h-32 w-32   border">
              <button>{item}</button>
            </div>
          ))}
        </div>
      </div>
      {/* <div>
        <p>sample of 20 random modifiers or other term</p>
        <div className="flex flex-wrap gap-4">
          {randomInspirations.map((item, i) => (
            <div key={i} className=" h-32 w-32  border">
              <Image
                src={getImageUrl(item.imageUrl)}
                alt={item.prompt}
                width={32 * 4}
                height={32 * 4}
              />
            </div>
          ))}
        </div>
      </div> */}
      <div>
        <p>choose a category to see examples</p>
        <div className="flex flex-wrap gap-4">
          {categories.map((item) => (
            <div key={item} className=" h-32 w-32   border">
              <button onClick={() => setActiveCategory(item)}>{item}</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex flex-wrap gap-4">
          {activeCategoryValues.map((item, i) => (
            <div
              key={item.value}
              className=" group relative h-32 w-32 cursor-pointer border hover:z-10"
              onClick={() => onAddInspiration({ ...item })}
            >
              <Image
                src={getImageUrl(item.imageUrl)}
                alt={item.prompt}
                width={32 * 4}
                height={32 * 4}
                className="transition-all duration-200 group-hover:scale-150"
              />

              <div className="absolute top-0 left-0 hidden h-full w-full bg-black bg-opacity-20 p-2 group-hover:block group-hover:scale-150">
                <p className="bg-slate-900 text-center text-white opacity-90">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function createInspirationFromImage(
  image: SdImage,
  category = "?",
  value = "?"
): InspirationEntry {
  return {
    category,
    value,
    imageId: image.id,
    imageUrl: image.url,
    prompt: getTextForBreakdown(image.promptBreakdown),
  };
}

async function buildInspirationFromGroupId(testGroupId: string) {
  const imagesFromGroup = await queryFnGetImageGroup({
    queryKey: [testGroupId],
  });

  // parse the prompt and find those that include "inspir"

  const inspirLookup = imagesFromGroup.reduce((acc, item) => {
    const lookup = getSelectionAsLookup(item);

    Object.keys(lookup).forEach((key) => {
      if (!acc[key]) {
        acc[key] = {};
      }

      const value = lookup[key].join(", ");

      acc[key][value] = item;
    });

    return acc;
  }, {} as InspirationFromGroup);

  // convert that to InspirationEntry[] and setTestData

  const inspirations: InspirationEntry[] = [];

  Object.keys(inspirLookup).forEach((key) => {
    const values = inspirLookup[key];

    Object.keys(values).forEach((value) => {
      const image = values[value];

      const entry: InspirationEntry = {
        category: key,
        value,
        prompt: getTextForBreakdown(image.promptBreakdown),
        imageUrl: image.url,
        imageId: image.id,
      };

      inspirations.push(entry);
    });
  });

  return inspirations;
}
