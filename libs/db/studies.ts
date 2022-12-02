import { supabase } from "./supabase";

import type { SdImageStudyDef } from "../shared-types/src";

const STUDY_TABLE = "studies";

export async function db_upsertStudy(study: SdImageStudyDef) {
  console.log("db_insertStudy: study=", study);

  // insert into supabase
  const { error, data } = await supabase
    .from(STUDY_TABLE)
    .upsert(study)
    .select();

  if (error) {
    console.log("db_insertStudy: error=", error);
    throw error;
  }

  return data;
}

// method to delete a study
export async function db_deleteStudy(studyId: string) {
  console.log("db_deleteStudy: studyId=", studyId);

  // insert into supabase
  const { error, data } = await supabase
    .from(STUDY_TABLE)
    .delete()
    .eq("id", studyId);

  if (error) {
    console.log("db_deleteStudy: error=", error);
    throw error;
  }

  return data;
}

export async function db_getStudiesForGroupId(groupId: string) {
  const { data, error } = await supabase
    .from(STUDY_TABLE)
    .select("*")
    .eq("groupId", groupId);

  if (error) {
    console.error("Error loading studies from database", error);
    return [];
  }

  return data as SdImageStudyDef[];
}

export async function db_getStudyForId(studyId: string) {
  const { data, error } = await supabase
    .from(STUDY_TABLE)
    .select("*")
    .eq("id", studyId)
    .single();

  if (error) {
    console.error("Error loading study from database", error);
    return undefined;
  }

  return data as SdImageStudyDef;
}
