import produce from "immer";
import { useCallback, useState } from "react";

export function convertStringToType(
  choice: string,
  values: string[] | undefined
) {
  if (values === undefined) {
    return [];
  }

  switch (choice) {
    case "seed":
    case "cfg":
    case "steps":
      return values.map((value) => parseInt(value));

    case "variantStrength":
      return values.map((value) => parseFloat(value ?? 1));

    case "engine":
      return values;
  }

  return values;
}

type primitive = string | number;

interface DataType {
  seed?: number[];
  cfg?: number[];
  steps?: number[];
  engine?: string[];
  variantStrength?: number[];

  [key: string]: primitive[] | undefined;
}

export function useCustomChoiceMap(initialState = {}) {
  const [customChoices, setCustomChoices] = useState<DataType>(initialState);

  const addChoice = useCallback(
    <K extends keyof DataType>(varName: K, choice: primitive | primitive[]) => {
      if (choice === undefined) {
        return;
      }

      setCustomChoices(
        produce((draft) => {
          if (draft[varName] === undefined) {
            draft[varName] = [];
          }
          const choices = Array.isArray(choice) ? choice : [choice];
          draft[varName]!.push(...choices);
        })
      );
    },
    []
  );

  const removeChoice = useCallback(
    <K extends keyof DataType>(varName: K, choice: string | number) => {
      setCustomChoices(
        produce((draft) => {
          if (draft[varName] === undefined) {
            return;
          }
          draft[varName] = draft[varName]!.filter((x) => x !== choice);
        })
      );
    },
    []
  );

  const setChoice = useCallback(
    <K extends keyof DataType>(varName: K, choices: DataType[K]) => {
      setCustomChoices(
        produce((draft) => {
          draft[varName] = choices;
        })
      );
    },
    []
  );

  return { customChoices, addChoice, setChoice, removeChoice };
}
