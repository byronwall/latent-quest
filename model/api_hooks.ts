import axios from "axios";
import { useQuery } from "react-query";
import { SdSubChoice } from "../libs/shared-types/src";

export function useChoices(activeCategory: string) {
  const queryFn = () =>
    axios
      .get(`/api/choices/${activeCategory}`)
      .then((res) => res.data.choices as SdSubChoice[]) ?? [];

  const {
    data: _choices,
    error: choicesError,
    isLoading: choicesLoading,
  } = useQuery("choices" + activeCategory, queryFn);

  const choices: SdSubChoice[] = _choices ?? [];

  return { choices, choicesError, choicesLoading };
}

export function useChoiceCategories() {
  const {
    data: _choices,
    error,
    isLoading,
  } = useQuery(
    "choices_categories",
    () =>
      axios
        .get(`/api/choices/list`)
        .then((res) => res.data.choices as string[]) ?? []
  );

  const categories: string[] = _choices ?? [];

  return { categories, categoriesError: error, categoriesLoading: isLoading };
}
