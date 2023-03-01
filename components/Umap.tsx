import { useEffect, useMemo, useState } from "react";
import { useElementSize } from "@mantine/hooks";

import { ScatterplotWithBrushAndZoom } from "./Scatter/ScatterPlotWithBrushAndZoom";
import { SdImageComp } from "./SdImageComp";

import type { ScatterPoint } from "./Scatter/ScatterPlotWithBrushAndZoom";
import type { SdImage } from "../libs/shared-types/src";

export type UmapProps = {
  images: SdImage[];

  onFilterChange?: (activeImages: SdImage[]) => void;

  shouldHideImages?: boolean;
};

interface UmapPoint extends ScatterPoint {
  image: SdImage;
}

export function Umap(props: UmapProps) {
  const { images, onFilterChange, shouldHideImages } = props;

  const initialData: UmapPoint[] = useMemo(
    () =>
      images.map((image, i) => ({
        x: image.embedding?.[0] ?? 0,
        y: image.embedding?.[1] ?? 0,
        id: i,
        image,
      })),
    [images]
  );

  const [brushedPoints, setBrushedPoints] = useState<UmapPoint[]>(initialData);

  const [hoverPoint, setHoverPoint] = useState<UmapPoint | null>(null);

  useEffect(() => {
    // get unique image IDs in the brushed points
    const imageIds = new Set(brushedPoints.map((c) => c.image.id));
    const filteredImages = images.filter((image) => imageIds.has(image.id));

    onFilterChange?.(filteredImages);
  }, [brushedPoints, images, onFilterChange]);

  const { ref, width, height } = useElementSize();

  return (
    <>
      <div className="relative flex flex-1 items-stretch gap-4 p-2">
        <div ref={ref} className="flex-1">
          <ScatterplotWithBrushAndZoom<UmapPoint>
            data={initialData}
            width={width}
            height={height || 400}
            mode={"brush"}
            color="#cc0"
            onBrushedPoints={setBrushedPoints}
            onHoverPoint={setHoverPoint}
          />
        </div>

        {hoverPoint && (
          <div className="absolute top-0 right-0 h-24 w-24">
            <SdImageComp image={hoverPoint.image} size={384} />
          </div>
        )}
      </div>
      {!shouldHideImages && (
        <div className="grid grid-cols-4">
          {brushedPoints.map((c) => (
            <div key={c.image.id}>
              <SdImageComp image={c.image} size={512} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
