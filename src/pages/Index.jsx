import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const canvasRef = useRef(null);
  const [center, setCenter] = useState({ x: -0.5, y: 0 });
  const [zoom, setZoom] = useState(200);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderMandelbrotSet(ctx, center, zoom);
  }, [center, zoom]);

  const renderMandelbrotSet = (ctx, center, zoom) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const imageData = ctx.createImageData(width, height);
    const maxIter = 1000;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let zx = (x - width / 2) / zoom + center.x;
        let zy = (y - height / 2) / zoom + center.y;
        let cx = zx;
        let cy = zy;
        let i = maxIter;
        while (zx * zx + zy * zy < 4 && i > 0) {
          let tmp = zx * zx - zy * zy + cx;
          zy = 2.0 * zx * zy + cy;
          zx = tmp;
          i--;
        }
        const pixelIndex = (x + y * width) * 4;
        const color = i === 0 ? 0 : 255 - (i * 255) / maxIter;
        imageData.data[pixelIndex] = color;
        imageData.data[pixelIndex + 1] = color;
        imageData.data[pixelIndex + 2] = color;
        imageData.data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const handleZoomIn = () => {
    setCenter({ x: center.x - (canvasRef.current.width / zoom) * 0.5, y: center.y });
    setZoom(zoom * 1.5);
  };
  const handleZoomOut = () => {
    setCenter({ x: center.x + (canvasRef.current.width / zoom) * 0.5, y: center.y });
    setZoom(zoom / 1.5);
  };
  const handleReset = () => {
    setCenter({ x: -0.5, y: 0 });
    setZoom(200);
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl mb-4">Mandelbrot Explorer</h1>
      <p className="mb-4">
        Explore the fascinating Mandelbrot set. Use the controls to zoom in and out, and reset the view.
      </p>
      <canvas ref={canvasRef} width={800} height={600} className="border mb-4"></canvas>
      <div className="flex justify-center space-x-4 mb-4">
        <Button onClick={handleZoomIn}>Zoom In</Button>
        <Button onClick={handleZoomOut}>Zoom Out</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <p>Center Coordinates: ({center.x.toFixed(3)}, {center.y.toFixed(3)})</p>
    </div>
  );
};

export default Index;