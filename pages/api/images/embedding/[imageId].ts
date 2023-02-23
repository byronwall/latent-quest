import {
  db_getSingleImages,
  db_updateImageEmbedding,
} from "../../../../libs/db/images";

export interface ReplicateResp {
  completed_at: any;
  created_at: string;
  error: any;
  id: string;
  input: Input;
  logs: string;
  metrics: any;
  output: Output[];
  started_at: any;
  status: string;
  urls: Urls;
  version: string;
  webhook_completed: any;
}

export interface Output {
  input: string;
  embedding: number[];
}

export interface Input {
  inputs: string;
}

export interface Urls {
  get: string;
  cancel: string;
}

// based on docs at: https://docs.banana.dev/banana-docs/core-concepts/sdks/node
// serverless GPU implementation: https://github.com/byronwall/banana-clip/blob/main/src/app.py

export default async function handler(req, res) {
  const { imageId } = req.query;

  const image = await db_getSingleImages(imageId);

  // get the full image url -- use real domain even for local dev
  const imageUrl = `https://latent.quest/api/images/s3/${image?.url}`;

  // const apiKey = process.env.BANANA_API_KEY ?? "";
  // const modelKey = process.env.BANANA_MODEL_KEY ?? "";
  // const modelParameters: EmbeddingReq = {
  //   image_url: imageUrl,
  //   texts: ["train", "car", "plane"],
  // };

  const replicateApiKey = process.env.REPLICATE_API_KEY ?? "";

  const postData = {
    version: "71addf5a5e7c400e091f33ef8ae1c40d72a25966897d05ebe36a7edb06a86a2c",
    input: {
      inputs: imageUrl,
    },
  };

  const repResults = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  const repJson = await repResults.json();

  const getUrl = repJson.urls.get;

  // poll the get url every 5 seconds until the status is "succeeded"
  // then return the results

  let pollCount = 0;
  while (pollCount++ < 10) {
    const repResults = await fetch(getUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const repJson = await repResults.json();
    console.log("replicate poll", pollCount, repJson);

    if (repJson.status === "succeeded") {
      res.send(repJson);
      db_updateImageEmbedding(imageId, repJson.output[0].embedding);
      return;
    }

    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log("replicate results", repResults, repJson);
  res.send(repResults);
}
