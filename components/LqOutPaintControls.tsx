import { Button, NumberInput, Title } from "@mantine/core";
import { useState } from "react";

import { Switch } from "./MantineWrappers";

export type OutPaintHandler = (
  anchor: LqOutPaintAnchor,
  topSize: number,
  leftSize: number,
  overlap: number
) => void;

interface LqOutPaintControlsProps {
  onOutPaint: OutPaintHandler;
}

type LqOutPaintAnchor =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export function LqOutPaintControls(props: LqOutPaintControlsProps) {
  const { onOutPaint } = props;

  const [anchor, setAnchor] = useState<LqOutPaintAnchor>("top-left");

  const [isSameTopLeft, setIsSameTopLeft] = useState(true);

  const [topSize, setTopSize] = useState<number | undefined>(100);
  const [leftSize, setLeftSize] = useState<number | undefined>(100);
  const [overlap, setOverlap] = useState<number | undefined>(10);

  const computedLeftSize = isSameTopLeft ? topSize : leftSize;

  return (
    <div>
      <Title order={4}>out paint controls</Title>
      <Button
        onClick={() => {
          onOutPaint(anchor, topSize ?? 0, computedLeftSize ?? 0, overlap ?? 0);
        }}
      >
        out paint
      </Button>
      <div>
        <Switch
          label="Same top left"
          checked={isSameTopLeft}
          onChange={setIsSameTopLeft}
        />
        <NumberInput
          label="top"
          value={topSize}
          onChange={setTopSize}
          width={100}
        />
        {!isSameTopLeft && (
          <NumberInput label="left" value={leftSize} onChange={setLeftSize} />
        )}

        <NumberInput
          label="overlap %"
          value={overlap}
          onChange={setOverlap}
          min={0}
          max={100}
          step={1}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
          gap: "1%",
          height: 100,
          width: 100,
        }}
      >
        <div
          className={`anchor-grid-item ${
            anchor === "top-left" ? "active" : ""
          }`}
          onClick={() => setAnchor("top-left")}
        />
        <div
          className={`anchor-grid-item ${anchor === "top" ? "active" : ""}`}
          onClick={() => setAnchor("top")}
        />
        <div
          className={`anchor-grid-item ${
            anchor === "top-right" ? "active" : ""
          }`}
          onClick={() => setAnchor("top-right")}
        />
        <div
          className={`anchor-grid-item ${anchor === "left" ? "active" : ""}`}
          onClick={() => setAnchor("left")}
        />
        <div
          className={`anchor-grid-item ${anchor === "center" ? "active" : ""}`}
          onClick={() => setAnchor("center")}
        />
        <div
          className={`anchor-grid-item ${anchor === "right" ? "active" : ""}`}
          onClick={() => setAnchor("right")}
        />
        <div
          className={`anchor-grid-item ${
            anchor === "bottom-left" ? "active" : ""
          }`}
          onClick={() => setAnchor("bottom-left")}
        />
        <div
          className={`anchor-grid-item ${anchor === "bottom" ? "active" : ""}`}
          onClick={() => setAnchor("bottom")}
        />
        <div
          className={`anchor-grid-item ${
            anchor === "bottom-right" ? "active" : ""
          }`}
          onClick={() => setAnchor("bottom-right")}
        />
      </div>
    </div>
  );
}
