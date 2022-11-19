import produce from "immer";
import { useState } from "react";

export function useCustomChoiceMap() {
  interface DataType {
    seed?: number[];
    cfg?: number[];
    steps?: number[];
    engine?: string[];

    [key: string]: (number | string)[] | undefined;
  }

  const [customChoices, setCustomChoices] = useState<DataType>({});

  const addChoice = <K extends keyof DataType>(
    varName: K,
    choice: string | number
  ) => {
    if (choice === undefined) {
      return;
    }

    setCustomChoices(
      produce((draft) => {
        if (draft[varName] === undefined) {
          draft[varName] = [];
        }
        draft[varName]!.push(choice);
      })
    );
  };

  const removeChoice = <K extends keyof DataType>(
    varName: K,
    choice: string | number
  ) => {
    setCustomChoices(
      produce((draft) => {
        if (draft[varName] === undefined) {
          return;
        }
        draft[varName] = draft[varName]!.filter((x) => x !== choice);
      })
    );
  };

  const setChoice = <K extends keyof DataType>(
    varName: K,
    choices: DataType[K]
  ) => {
    setCustomChoices(
      produce((draft) => {
        draft[varName] = choices;
      })
    );
  };

  return { customChoices, addChoice, setChoice, removeChoice };
}
