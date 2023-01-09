import {
  Prompt,
  PromptParameters,
} from "stability-sdk/gooseai/generation/generation_pb";

export function createPromptListFromText(text: string): Array<Prompt> {
  const prompts: Prompt[] = [];

  const multiPrompts = text.split("|");
  // search prompt for | : -1 text
  multiPrompts.map((promptTextAndWeight) => {
    // find the first : and split the text
    const pieces = promptTextAndWeight.split(":");

    const promptText = pieces[0].trim();
    const weight = Number(pieces[1] ?? 1);

    const prompt = new Prompt();
    prompt.setText(promptText);

    const promptParams = new PromptParameters();
    promptParams.setWeight(weight);

    prompt.setParameters(promptParams);
    prompts.push(prompt);
  });

  return prompts;
}
