import { TextInput } from "@mantine/core";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconLink } from "@tabler/icons";
import Link from "next/link";

import { Button } from "./Button";
import { getSelectionAsLookup } from "./getSelectionFromPromptPart";
import { getImageUrl } from "./ImageList";
import { queryFnGetImageGroup } from "./useGetImageGroup";

import { getTextForBreakdown } from "../libs/shared-types/src";

import type { SdImage, SdImageEngines } from "../libs/shared-types/src";

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

type InspirationBase = Pick<
  InspirationEntry,
  "value" | "imageId" | "imageUrl"
> & {
  groupId: string;
  engine: SdImageEngines;
};

const baseInspirations: InspirationBase[] = [
  {
    value: "symmetrical face",
    imageUrl: "553c1fa0-27df-483e-ba76-ca37396854e9-0-2003297801.png",
    imageId: "82923473-8add-4664-b063-34cda3101614",
    groupId: "3d473223-16b6-4146-998c-1dc236ae319b",
    engine: "SD 1.5",
  },
  {
    value: "scenic landscape with a barn",
    imageUrl: "495d4f60-ae9b-4214-9516-f36e72ccaf1f-0-655742724.png",
    imageId: "5b40cf0d-62af-4859-97d0-37219784e2dc",
    groupId: "6cd51c4c-c94d-4d89-9ed8-a4c460c4618f",
    engine: "SD 1.5",
  },
  {
    value: "dump truck on a rugged road",
    imageId: "0c9e1840-0a29-4bed-a07d-a3dc146ed937",
    imageUrl: "3381a75f-f64d-4ec0-8bdd-94fd7d539e0a-0-1598926896.png",
    groupId: "0c9e1840-0a29-4bed-a07d-a3dc146ed937",
    engine: "SD 1.5",
  },
  {
    value: "wallpaper pattern with florals and woodland creatures",
    imageId: "64180379-695c-4717-af0b-a115025d713e",
    imageUrl: "f47a3f30-8e2b-4cb8-937a-dd9676dc93ff-0-210359331.png",
    groupId: "e31d2919-d46b-45ee-84f4-6d1229d6eff9",
    engine: "SD 1.5",
  },
];

export function InspirationMgr(props: InspirationMgrProps) {
  const { onAddInspiration } = props;

  const [testData, setTestData] = useState<InspirationEntry[]>([]);

  const [inspirGroupId, setInspirGroupId] = useState(
    baseInspirations[0].groupId
  );

  const buildInspirationData = useCallback(async () => {
    const testInspirs = await buildInspirationFromGroupId(inspirGroupId);

    setTestData(testInspirs);
  }, [inspirGroupId]);

  useEffect(() => {
    // load from test group

    buildInspirationData();
  }, [buildInspirationData]);

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
    <div className="flex flex-col gap-2 px-16">
      <h1>inspiration</h1>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-white">
            <p>1</p>
          </div>
          <p className="text-xl">choose a base image</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {baseInspirations.map((item) => (
            <div
              key={item.value}
              className="group relative h-72 w-72  cursor-pointer border"
              onClick={() => setInspirGroupId(item.groupId)}
            >
              <Image
                src={getImageUrl(item.imageUrl)}
                alt={item.value}
                width={512}
                height={512}
              />

              <div className="absolute top-0 left-0 hidden h-full w-full bg-black bg-opacity-20 p-2 group-hover:block ">
                <p className="bg-slate-900 text-center text-white opacity-90">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-white">
            <p>2</p>
          </div>
          <p className="text-xl">choose a category to explore</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {categories.map((item) => (
            <div key={item} className=" h-32 w-32   border">
              <button onClick={() => setActiveCategory(item)}>{item}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-white">
            <p>3</p>
          </div>
          <p className="text-xl">
            click image to add to prompt... be inspired!
          </p>
        </div>
        <p>
          you can also click the link icon to open the original image prompt
        </p>
        <p>
          images were generated with the same seeds and settings as the base
        </p>
      </div>

      <div className="grid grid-cols-2   gap-4  sm:grid-cols-3 md:grid-cols-5">
        {activeCategoryValues.map((item, i) => (
          <div
            key={item.value}
            className="group relative  cursor-pointer border  hover:z-10"
            onClick={() => onAddInspiration({ ...item })}
          >
            <p className="line-clamp-1">{item.value}</p>
            <Image
              src={getImageUrl(item.imageUrl)}
              alt={item.prompt}
              width={512}
              height={512}
              className="transition-all duration-200 group-hover:scale-150"
            />

            <div className="absolute top-0 left-0  hidden h-full w-full flex-col justify-between bg-black bg-opacity-20 p-2 group-hover:flex group-hover:scale-150">
              <p className="bg-slate-900 text-center text-white opacity-90">
                {item.value}
              </p>
              <div className="flex w-8 justify-center rounded bg-white opacity-30">
                <Link href={`/image/${item.imageId}`} target="_blank">
                  <IconLink />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
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
