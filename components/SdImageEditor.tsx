import { Button, ColorPicker, Slider, Title } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "react-query";

import { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";
import { api_generateImage, ImgObjWithExtras } from "../model/api";
import { getImageUrl } from "./ImageList";
import { Switch } from "./MantineWrappers";
import { SdNewImagePrompt } from "./SdNewImagePrompt";

const TOOLS = [
  "point",
  "clear_rect",
  "fill_rect",
  "select_rect",
  "pencil",
  "color_picker",
] as const;
type TOOLS = typeof TOOLS[number];

export function SdImageEditor(props: SdImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasMaskRef = useRef<HTMLCanvasElement>(null);

  const getCanvasCtx = (ref: typeof canvasRef) => {
    const canvas = ref.current;
    if (canvas === null) {
      return;
    }
    // draw black rectangle on canvas
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }

    return ctx;
  };

  const [pointSize, setPointSize] = useState(10);

  const [activeTool, setActiveTool] = useState<TOOLS>("point");

  const [isMouseDown, setIsMouseDown] = useState(false);

  const [isMaskVisible, setIsMaskVisible] = useState(false);

  const [pencilColor, setPencilColor] = useState("#000000");

  const [variantStrength, setVariantStrength] = useState(30);

  const [hasImagePrompt, setHasImagePrompt] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    // draw black rectangle on canvas
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
  }, []);

  const handleRedrawImage = async (skipMask = false) => {
    const ctx = getCanvasCtx(canvasRef);
    if (ctx === undefined) {
      return;
    }

    let url = props.image.url;

    await drawImageToCanvas(ctx, getImageUrl(url));

    const { dataUrl } = await getDataUrls("SD 1.5");

    setInitImgData(dataUrl);

    if (!skipMask) {
      // reset the mask to all white
      const maskCtx = getCanvasCtx(canvasMaskRef);
      if (maskCtx === undefined || canvasMaskRef.current === null) {
        return;
      }
      maskCtx.fillStyle = "white";
      maskCtx.fillRect(
        0,
        0,
        canvasMaskRef.current.width,
        canvasMaskRef.current.height
      );
    }
  };

  useEffect(() => {
    handleRedrawImage();
  }, [props.image, hasImagePrompt]);

  interface MousePoint {
    x: number;
    y: number;
  }

  const [mouseStart, setMouseStart] = useState<MousePoint>({ x: 0, y: 0 });

  const [initImgData, setInitImgData] = useState<string>("");

  const [initMaskData, setInitMaskData] = useState<string>("");

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getPosRelativeToCanvas(e);
    setMouseStart(pt);
    setIsMouseDown(true);

    if (activeTool === "pencil") {
      drawPencilOnCanvas(pt);
    }

    if (activeTool === "color_picker") {
      const ctx = getCanvasCtx(canvasRef);
      if (ctx === undefined) {
        return;
      }

      const pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      setPencilColor(color);
    }
  };

  const getPosRelativeToCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasRef.current === null) {
      return { x: 0, y: 0 };
    }

    var rect = canvasRef.current.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top; //y position within the element.

    return { x, y };
  };

  function drawPencilOnCanvas(pt: MousePoint) {
    const ctx = getCanvasCtx(canvasRef);
    if (ctx === undefined) {
      return;
    }

    //draw circle at mousePt

    ctx.fillStyle = pencilColor;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pointSize, 0, 2 * Math.PI);
    ctx.fill();
  }

  const [mouseEnd, setMouseEnd] = useState<MousePoint>({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isMouseDown) {
      const relPos = getPosRelativeToCanvas(e);

      if (activeTool === "pencil") {
        drawPencilOnCanvas(relPos);
      }

      setMouseEnd(relPos);
    }
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);

    const ctx = getCanvasCtx(canvasRef);
    if (ctx === undefined) {
      return;
    }

    if (activeTool === "clear_rect") {
      // do the deletion here

      // clear a rect that the mouse was over

      ctx.clearRect(
        mouseStart.x,
        mouseStart.y,
        mouseEnd.x - mouseStart.x,
        mouseEnd.y - mouseStart.y
      );

      // draw a black rect on the mask
      const maskCtx = getCanvasCtx(canvasMaskRef);
      if (maskCtx === undefined) {
        return;
      }

      maskCtx.fillStyle = "black";
      maskCtx.fillRect(
        mouseStart.x,
        mouseStart.y,
        mouseEnd.x - mouseStart.x,
        mouseEnd.y - mouseStart.y
      );
    }
    if (activeTool === "fill_rect") {
      // do the deletion here

      // clear a rect that the mouse was over

      ctx.fillStyle = pencilColor;
      ctx.fillRect(
        mouseStart.x,
        mouseStart.y,
        mouseEnd.x - mouseStart.x,
        mouseEnd.y - mouseStart.y
      );
    }
  };

  const qc = useQueryClient();

  const getDataUrls = async (engine: SdImagePlaceHolder["engine"]) => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      throw new Error("canvas is null");
    }

    // redraw the original image and rely on mask
    const dataUrl = canvas.toDataURL("image/png");

    // if the engine is DALL-E mask needs to be 0 alpha for regions to edit - and 1 alpha white otherwise
    let maskDataUrl = "";

    if (engine === "DALL-E") {
      const maskCanvas = canvasMaskRef.current;
      if (maskCanvas === null) {
        throw new Error("maskCanvas is null");
      }

      const maskCtx = maskCanvas.getContext("2d");
      if (maskCtx === null) {
        throw new Error("maskCtx is null");
      }

      const imageData = maskCtx.getImageData(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
      );

      for (let i = 0; i < imageData.data.length; i += 4) {
        if (
          imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2] <
          10
        ) {
          imageData.data[i + 3] = 0;
        } else {
          imageData.data[i + 3] = 255;
        }
      }

      maskCtx.putImageData(imageData, 0, 0);

      maskDataUrl = maskCanvas.toDataURL("image/png");
    } else {
      // get the mask data url
      const maskCanvas = canvasMaskRef.current;
      if (maskCanvas === null) {
        throw new Error("mask canvas is null");
      }

      // go through mask -- if any pixels are 0 alpha transparent -- force to black
      const maskCtx = maskCanvas.getContext("2d");
      if (maskCtx === null) {
        throw new Error("maskCtx is null");
      }

      const imageData = maskCtx.getImageData(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
      );

      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] === 0) {
          imageData.data[i] = 0;
          imageData.data[i + 1] = 0;
          imageData.data[i + 2] = 0;
        }
      }

      maskCtx.putImageData(imageData, 0, 0);

      maskDataUrl = maskCanvas.toDataURL("image/png");
    }

    return { dataUrl, maskDataUrl };
  };

  const handleSdProcess = async () => {
    const { dataUrl, maskDataUrl } = await getDataUrls("SD 1.5");

    downloadDataUri(dataUrl, "image.png");
    downloadDataUri(maskDataUrl, "mask.png");
  };

  const handleCreateClick = async (
    placeHolder: SdImagePlaceHolder,
    callback: () => void
  ) => {
    const imageReqData: ImgObjWithExtras = {
      ...placeHolder,
    };

    if (hasImagePrompt) {
      // get the image data from the canvas as base64 png

      // force the canvas back to originalimage
      const ctx = getCanvasCtx(canvasRef);
      if (ctx === undefined) {
        return;
      }

      if (isMaskVisible) {
        // this resets the image back to baseline
        await drawImageToCanvas(ctx, initImgData);
      }

      // send the image data to the server
      const { dataUrl, maskDataUrl } = await getDataUrls(placeHolder.engine);

      imageReqData.variantStrength = 1 - variantStrength / 100.0;

      imageReqData.imageData = dataUrl;

      if (isMaskVisible) {
        imageReqData.maskData = maskDataUrl;
      } else if (placeHolder.engine === "DALL-E") {
        // need to get a full alpha mask as the "edit all" option

        const canRef = canvasRef.current;
        if (canRef === null) {
          return;
        }

        const dummyCanvas = document.createElement("canvas");
        dummyCanvas.width = canRef.width;
        dummyCanvas.height = canRef.height;

        const dummyCtx = dummyCanvas.getContext("2d");
        if (dummyCtx === null) {
          return;
        }

        // transparent white
        dummyCtx.fillStyle = "#ffffff00";

        dummyCtx.fillRect(0, 0, dummyCanvas.width, dummyCanvas.height);

        const dummyDataUrl = dummyCanvas.toDataURL("image/png");

        imageReqData.maskData = dummyDataUrl;

        console.log("dummyDataUrl for empty mask", dummyDataUrl);
      }
    }

    console.log("sending image data to server", imageReqData);

    const res = await api_generateImage(imageReqData);
    callback();

    qc.invalidateQueries();

    console.log("res", res);
  };

  const handleOutPaint = async () => {
    const ctx = getCanvasCtx(canvasRef);
    if (ctx === undefined) {
      return;
    }
    const url = getImageUrl(props.image.url);
    const img = await getImageForCtx(url);

    ctx.clearRect(0, 0, img.width, img.height);

    const outPaintSize = 80;
    const maskOutPaintSize = outPaintSize * 1.5;

    ctx.drawImage(
      img,
      outPaintSize,
      outPaintSize,
      512 - outPaintSize * 2,
      512 - outPaintSize * 2
    );

    const { dataUrl } = await getDataUrls("SD 1.5");
    setInitImgData(dataUrl);

    // reset the mask to all white
    const maskCtx = getCanvasCtx(canvasMaskRef);
    if (maskCtx === undefined || canvasMaskRef.current === null) {
      return;
    }
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(
      0,
      0,
      canvasMaskRef.current.width,
      canvasMaskRef.current.height
    );

    // fill white region in middle where image is
    maskCtx.fillStyle = "white";
    maskCtx.fillRect(
      maskOutPaintSize,
      maskOutPaintSize,
      512 - maskOutPaintSize * 2,
      512 - maskOutPaintSize * 2
    );
  };

  const handleZoomIntoSelection = async () => {
    // get the selection and redraw it onto the full canvas size
    const ctx = getCanvasCtx(canvasRef);
    if (ctx === undefined) {
      return;
    }

    // save selection into image
    const savedImg = new Image();

    const { dataUrl } = await getDataUrls("SD 1.5");

    savedImg.src = dataUrl;

    ctx.drawImage(
      savedImg,
      mouseStart.x,
      mouseStart.y,
      mouseEnd.x - mouseStart.x,
      mouseEnd.y - mouseStart.y,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
  };

  const handleUpdateToImageAndMask = async () => {
    let url = props.image.urlImageSource;
    const maskUrl = props.image.urlMaskSource;

    const ctx = getCanvasCtx(canvasRef);
    if (url && ctx !== undefined) {
      await drawImageToCanvas(ctx, getImageUrl(url));
    }

    const maskCtx = getCanvasCtx(canvasMaskRef);
    if (maskUrl && maskCtx !== undefined) {
      await drawImageToCanvas(maskCtx, getImageUrl(maskUrl));
    }
  };

  const imagePromptSettings = hasImagePrompt && (
    <div>
      <Title order={3}>image prompt settings</Title>
      <div style={{ display: "flex", gap: 5 }}>
        <div>
          <Button onClick={() => handleRedrawImage()}>redraw image</Button>
          <Button onClick={handleOutPaint}>out paint</Button>
          <Button onClick={handleZoomIntoSelection}>zoom in</Button>
          <Button onClick={handleSdProcess}>download PNGs</Button>
          {(props.image.urlMaskSource || props.image.urlImageSource) && (
            <Button onClick={handleUpdateToImageAndMask}>
              set canvas equal to OG prompt
            </Button>
          )}
        </div>
        <div>
          <Button
            variant={activeTool === "clear_rect" ? "filled" : "outline"}
            onClick={() => setActiveTool("clear_rect")}
          >
            clear area
          </Button>

          <Button
            variant={activeTool === "fill_rect" ? "filled" : "outline"}
            onClick={() => setActiveTool("fill_rect")}
          >
            fill area
          </Button>

          <Button
            variant={activeTool === "select_rect" ? "filled" : "outline"}
            onClick={() => setActiveTool("select_rect")}
          >
            select area
          </Button>

          <Button
            variant={activeTool === "pencil" ? "filled" : "outline"}
            onClick={() => setActiveTool("pencil")}
          >
            pencil
          </Button>

          <Button
            variant={activeTool === "color_picker" ? "filled" : "outline"}
            onClick={() => setActiveTool("color_picker")}
          >
            color picker
          </Button>
          <Switch
            checked={isMaskVisible}
            onChange={setIsMaskVisible}
            label="show mask"
          />
        </div>
        <div>
          <div>
            <p>point size = {pointSize}</p>
            <Slider
              min={1}
              max={50}
              value={pointSize}
              onChange={(v) => setPointSize(v)}
              style={{ width: 200 }}
            />
          </div>
          <div>
            <p>variant strength = {variantStrength}</p>
            <Slider
              min={0}
              max={100}
              value={variantStrength}
              onChange={(v) => setVariantStrength(v)}
              label="variant strength %"
            />
          </div>
        </div>
        <ColorPicker
          value={pencilColor}
          onChange={(v) => setPencilColor(v)}
          format="rgba"
          size="xl"
          swatches={[
            "#25262b",
            "#868e96",
            "#795548",
            "#ffffff",
            "#fa5252",
            "#e64980",
            "#be4bdb",
            "#7950f2",
            "#4c6ef5",
            "#228be6",
            "#15aabf",
            "#12b886",
            "#40c057",
            "#82c91e",
            "#fab005",
            "#fd7e14",
          ]}
        />
      </div>
      <div style={{ position: "relative", display: "flex" }}>
        <canvas
          ref={canvasRef}
          height={512}
          width={512}
          style={{
            border: "1px solid red",
            background:
              "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)       50% / 20px 20px",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        <canvas
          ref={canvasMaskRef}
          height={512}
          width={512}
          style={{
            border: "1px solid red",
            display: isMaskVisible ? "block" : "none",
            background:
              "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)       50% / 20px 20px",
          }}
        />
        {activeTool === "clear_rect" && isMouseDown && (
          <div
            style={{
              position: "absolute",
              top: Math.min(mouseStart.y, mouseEnd.y),
              left: Math.min(mouseStart.x, mouseEnd.x),
              width: Math.abs(mouseEnd.x - mouseStart.x),
              height: Math.abs(mouseEnd.y - mouseStart.y),
              border: "5px dashed red",
              pointerEvents: "none",
            }}
          />
        )}
        {activeTool === "fill_rect" && isMouseDown && (
          <div
            style={{
              position: "absolute",
              top: Math.min(mouseStart.y, mouseEnd.y),
              left: Math.min(mouseStart.x, mouseEnd.x),
              width: Math.abs(mouseEnd.x - mouseStart.x),
              height: Math.abs(mouseEnd.y - mouseStart.y),
              border: "5px dashed red",
              pointerEvents: "none",
              background: pencilColor,
            }}
          />
        )}
        {activeTool === "select_rect" && (
          <div
            style={{
              position: "absolute",
              top: Math.min(mouseStart.y, mouseEnd.y),
              left: Math.min(mouseStart.x, mouseEnd.x),
              width: Math.abs(mouseEnd.x - mouseStart.x),
              height: Math.abs(mouseEnd.y - mouseStart.y),
              border: "3px dashed orange",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div>
        <div>
          <SdNewImagePrompt
            defaultImage={props.image}
            onCreate={handleCreateClick}
          />
        </div>
        <div>
          <Switch
            checked={hasImagePrompt}
            onChange={setHasImagePrompt}
            label="is image prompt"
          />
        </div>
      </div>
      {imagePromptSettings}
    </div>
  );
}

export interface SdImageEditorProps {
  image: SdImage;
}

export interface SdImageEditorPopoverProps extends SdImageEditorProps {}

function downloadDataUri(dataUri: string, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function drawImageToCanvas(ctx: CanvasRenderingContext2D, url: string) {
  let img = new Image();
  await new Promise((r) => {
    img.onload = r;
    img.src = url;
  });

  ctx.drawImage(img, 0, 0);
}
async function getImageForCtx(url: string) {
  let img = new Image();
  await new Promise((r) => {
    img.onload = r;
    img.src = url;
  });

  return img;
}
