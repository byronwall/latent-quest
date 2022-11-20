import { supabase } from "./supabase";

import type { SdSubChoice } from "../shared-types/src";

export async function db_insertSubChoice(choice: SdSubChoice | SdSubChoice[]) {
  const { data, error } = await supabase.from("choices").insert(choice);

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data;
}

export async function db_getAllSubChoices() {
  const { data, error } = await supabase.from("choices").select("*");

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data as SdSubChoice[];
}

export async function db_getAllSubChoicesCategory(category: string) {
  const { data, error } = await supabase
    .from("choices")
    .select("*")
    .eq("category", category);

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data as SdSubChoice[];
}
