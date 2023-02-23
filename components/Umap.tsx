import { useState } from "react";
import { UMAP } from "umap-js";

import { Button } from "./Button";
import { ScatterplotWithBrushAndZoom } from "./Scatter/ScatterPlotWithBrushAndZoom";
import { SdImageComp } from "./SdImageComp";

import type { SdImage } from "../libs/shared-types/src";

export type UmapProps = {
  images: SdImage[];
};

export function Umap(props: UmapProps) {
  const { images } = props;

  const initialData = images.map((image, i) => ({ x: i, y: i, id: i, image }));

  const [data, setData] = useState(initialData);

  const [brushedPoints, setBrushedPoints] = useState(data);

  const handleUmapClip = () => {
    const umap = new UMAP();

    const rawImageEmbedding = images.map((c) => c.embedding ?? []);

    // array of [x , y] pairs
    const embedding = umap.fit(rawImageEmbedding);

    const newData = embedding.map((c, i) => ({
      x: c[0],
      y: c[1],
      id: i,
      image: images[i],
    }));

    setData(newData);
  };

  return (
    <div>
      <h1>Umap</h1>
      <Button onClick={handleUmapClip}>compute umap</Button>
      <div>
        <ScatterplotWithBrushAndZoom
          data={data}
          width={600}
          height={600}
          mode={"brush"}
          color="#cc0"
          onBrushedPoints={setBrushedPoints}
        />
      </div>
      <div className="grid grid-cols-4">
        {brushedPoints.map((c) => (
          <div key={c.image.id}>
            <SdImageComp image={c.image} size={512} />
          </div>
        ))}
      </div>
    </div>
  );
}
