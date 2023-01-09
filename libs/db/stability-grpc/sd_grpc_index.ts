import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

import { grpc } from "@improbable-eng/grpc-web";
import { GenerationService } from "stability-sdk/gooseai/generation/generation_pb_service";
import {
  Artifact,
  Request,
  Prompt,
  ImageParameters,
  SamplerParameters,
  TransformType,
  StepParameter,
  ArtifactType,
  PromptParameters,
  ScheduleParameters,
} from "stability-sdk/gooseai/generation/generation_pb";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import uuid4 from "uuid4";
import mime from "mime";
import mkdirp from "mkdirp";

import { diffusionMap, randBetween } from "./sd_grpc_utils";

import type { Answer } from "stability-sdk/gooseai/generation/generation_pb";
import type TypedEmitter from "typed-emitter";

type DraftStabilityOptions = Partial<{
  outDir: string;
  debug: boolean;
  requestId: string;
  samples: number;
  engine: string;
  host: string;
  seed: number | Array<number>;
  width: number;
  height: number;
  diffusion: keyof typeof diffusionMap;
  steps: number;
  cfgScale: number;
  noStore: boolean;
  imagePrompt: {
    mime: string;
    content: Buffer;
    mask?: { mime: string; content: Buffer };
  } | null;
  stepSchedule: { start?: number; end?: number };
}>;

type RequiredStabilityOptions = {
  apiKey: string;
  prompt: string;
};

type StabilityOptions = RequiredStabilityOptions &
  Required<DraftStabilityOptions>;

type ImageData = {
  buffer: Buffer;
  filePath: string;
  seed: number;
  mimeType: string;
  classifications: { realizedAction: number };
};

type ResponseData = {
  isOk: boolean;
  status: keyof grpc.Code;
  code: grpc.Code;
  message: string;
  trailers: grpc.Metadata;
};

type StabilityApi = TypedEmitter<{
  image: (data: ImageData) => void;
  end: (data: ResponseData) => void;
}>;

const withDefaults: (
  draftOptions: DraftStabilityOptions & RequiredStabilityOptions
) => StabilityOptions = (draft) => {
  if (!draft.prompt) throw new Error("Prompt is required");

  const requestId = draft.requestId ?? uuid4();

  // TODO: review these defaults and update as desired
  return {
    ...draft,
    host: draft.host ?? "https://grpc.stability.ai:443",
    engine: draft.engine ?? "stable-diffusion-v1",
    requestId,
    seed: draft.seed ?? randBetween(0, 4294967295),
    width: draft.width ?? 512,
    height: draft.height ?? 512,
    diffusion: draft.diffusion ?? "k_lms",
    steps: draft.steps ?? 50,
    cfgScale: draft.cfgScale ?? 7,
    samples: draft.samples ?? 1,
    outDir: draft.outDir ?? path.join(process.cwd(), ".out", requestId),
    debug: Boolean(draft.debug),
    noStore: Boolean(draft.noStore),
    imagePrompt: draft.imagePrompt ?? null,
    stepSchedule: draft.stepSchedule ?? {},
  };
};

export const generate: (
  opts: DraftStabilityOptions & RequiredStabilityOptions
) => StabilityApi = (opts) => {
  const {
    host,
    engine,
    requestId,
    seed,
    width,
    height,
    diffusion,
    steps,
    cfgScale,
    samples,
    stepSchedule,
    outDir,
    prompt: promptText,
    imagePrompt: imagePromptData,
    apiKey,
    noStore,
    debug,
  } = withDefaults(opts);

  if (!promptText) throw new Error("Prompt text is required");

  const api = new EventEmitter() as StabilityApi;

  if (!noStore) mkdirp.sync(outDir);

  /** Build Request **/
  const request = new Request();
  request.setEngineId(engine);
  request.setRequestId(requestId);

  const promptList = createPromptListFromText(promptText);
  promptList.forEach((prompt) => request.addPrompt(prompt));

  console.log("promptList", promptList);

  // TODO: add multiple prompts here

  if (imagePromptData !== null) {
    const artifact = new Artifact();
    artifact.setType(ArtifactType.ARTIFACT_IMAGE);
    artifact.setMime(imagePromptData.mime);
    artifact.setBinary(imagePromptData.content);

    const parameters = new PromptParameters();
    parameters.setInit(true);

    const imagePrompt = new Prompt();
    imagePrompt.setArtifact(artifact);
    imagePrompt.setParameters(parameters);
    request.addPrompt(imagePrompt);

    if (typeof imagePromptData.mask !== "undefined") {
      const maskArtifact = new Artifact();
      maskArtifact.setType(ArtifactType.ARTIFACT_MASK);
      maskArtifact.setMime(imagePromptData.mask.mime);
      maskArtifact.setBinary(imagePromptData.mask.content);

      const maskPrompt = new Prompt();
      maskPrompt.setArtifact(maskArtifact);
      request.addPrompt(maskPrompt);
    }
  }

  const image = new ImageParameters();
  image.setWidth(width);
  image.setHeight(height);
  image.setSeedList(typeof seed === "number" ? [seed] : seed);
  image.setSteps(steps);
  image.setSamples(samples);

  const transform = new TransformType();
  transform.setDiffusion(diffusionMap[diffusion]);
  image.setTransform(transform);

  const schedule = new ScheduleParameters();
  if (typeof stepSchedule.start !== "undefined")
    schedule.setStart(stepSchedule.start);
  if (typeof stepSchedule.end !== "undefined")
    schedule.setEnd(stepSchedule.end);

  const step = new StepParameter();
  step.setScaledStep(0);
  step.setSchedule(schedule);

  const sampler = new SamplerParameters();
  sampler.setCfgScale(cfgScale);
  step.setSampler(sampler);

  image.addParameters(step);

  request.setImage(image);
  /** End Build Request **/

  if (debug) {
    console.log(
      "[stability - request]",
      JSON.stringify(request.toObject(), null, 2)
    );
  }

  grpc.invoke(GenerationService.Generate, {
    request,
    host,
    metadata: new grpc.Metadata({ Authorization: `Bearer ${apiKey}` }),
    transport: NodeHttpTransport(),
    onEnd: (code, message, trailers) => {
      api.emit("end", {
        isOk: code === grpc.Code.OK,
        status: grpc.Code[code] as keyof grpc.Code,
        code,
        message,
        trailers,
      });
    },
    onMessage: (message: Answer) => {
      const answer = message.toObject();

      if (answer.artifactsList) {
        let image: Artifact.AsObject | null = null;
        let classifications: Artifact.AsObject | null = null;
        answer.artifactsList.forEach((artifact) => {
          if (artifact.type === ArtifactType.ARTIFACT_IMAGE) {
            if (image !== null)
              throw new Error(
                "Unexpectedly got multiple images in single answer"
              );
            image = artifact;
          } else if (artifact.type === ArtifactType.ARTIFACT_CLASSIFICATIONS) {
            if (classifications !== null) {
              throw new Error(
                "Unexpectedly got multiple classification artifacts in single answer"
              );
            }

            classifications = artifact;
          }
        });

        if (image !== null) {
          if (classifications === null)
            throw new Error("Missing classifications in answer");

          const { id, mime: mimeType, binary, seed: innerSeed } = image;

          const buffer = Buffer.from(binary, "base64");
          const filePath = path.resolve(
            path.join(
              outDir,
              `${answer.answerId}-${id}-${innerSeed}.${mime.getExtension(
                mimeType
              )}`
            )
          );

          if (!noStore) fs.writeFileSync(filePath, buffer);

          const claz: Artifact.AsObject = classifications;

          api.emit("image", {
            buffer,
            filePath,
            seed: innerSeed,
            mimeType,
            classifications: {
              realizedAction: claz.classifier!.realizedAction,
            },
          });
        }
      }
    },
    debug,
  });

  return api;
};

export const generateAsync: (
  opts: DraftStabilityOptions & RequiredStabilityOptions
) => unknown = (opts) =>
  new Promise((resolve, reject) => {
    const api = generate(opts);
    let images: Array<ImageData> = [];
    api.on("image", (payload) => {
      images = [...images, payload];
    });
    api.on("end", (data) => {
      if (!data.isOk) return reject(new Error(data.message));
      resolve({
        res: data,
        images,
      });
    });
  });

function createPromptListFromText(text: string): Array<Prompt> {
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
