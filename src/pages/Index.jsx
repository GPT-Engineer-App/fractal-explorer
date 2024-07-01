import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const canvasRef = useRef(null);
  const [center, setCenter] = useState({ x: -0.5, y: 0 });
  const [zoom, setZoom] = useState(200);
  const [iterations, setIterations] = useState(1000);
  const [colorScheme, setColorScheme] = useState("grayscale");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMandelbrotSet(ctx, center, zoom, iterations, colorScheme);
  }, [center, zoom, iterations, colorScheme]);

  const renderMandelbrotSet = (ctx, center, zoom, iterations, colorScheme) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const imageData = ctx.createImageData(width, height);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let zx = (x - width / 2) / zoom + center.x;
        let zy = (y - height / 2) / zoom + center.y;
        let cx = zx;
        let cy = zy;
        let i = iterations;
        while (zx * zx + zy * zy < 4 && i > 0) {
          let tmp = zx * zx - zy * zy + cx;
          zy = 2.0 * zx * zy + cy;
          zx = tmp;
          i--;
        }
        const pixelIndex = (x + y * width) * 4;
        const color = getColor(i, iterations, colorScheme);
        imageData.data[pixelIndex] = color.r;
        imageData.data[pixelIndex + 1] = color.g;
        imageData.data[pixelIndex + 2] = color.b;
        imageData.data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const getColor = (i, maxIter, scheme) => {
    if (scheme === "grayscale") {
      const color = i === 0 ? 0 : 255 - (i * 255) / maxIter;
      return { r: color, g: color, b: color };
    } else if (scheme === "rainbow") {
      const ratio = i / maxIter;
      const r = Math.floor(255 * ratio);
      const g = Math.floor(255 * (1 - ratio));
      const b = Math.floor(255 * (ratio * (1 - ratio)));
      return { r, g, b };
    }
    return { r: 0, g: 0, b: 0 };
  };

  const handleZoomIn = () => {
    setZoom(zoom * 1.5);
  };

  const handleZoomOut = () => {
    setZoom(zoom / 1.5);
  };
  const handleReset = () => {
    setCenter({ x: -0.5, y: 0 });
    setZoom(200);
    setIterations(1000);
    setColorScheme("grayscale");
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newX = (x - canvas.width / 2) / zoom + center.x;
    const newY = (y - canvas.height / 2) / zoom + center.y;
    setCenter({ x: newX, y: newY });
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl mb-4">Mandelbrot Explorer</h1>
      <p className="mb-4">
        Explore the fascinating Mandelbrot set. Use the controls to zoom in and out, and reset the view.
      </p>
      <canvas ref={canvasRef} width={800} height={600} className="border mb-4" onClick={handleCanvasClick}></canvas>
      <div className="flex justify-center space-x-4 mb-4">
        <Button onClick={handleZoomIn}>Zoom In</Button>
        <Button onClick={handleZoomOut}>Zoom Out</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <div className="flex justify-center space-x-4 mb-4">
        <div className="flex flex-col items-center">
          <label htmlFor="iterations-slider" className="mb-2">Iterations: {iterations}</label>
          <Slider
            id="iterations-slider"
            defaultValue={[iterations]}
            max={2000}
            step={100}
            onValueChange={(value) => setIterations(value[0])}
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="color-scheme-select" className="mb-2">Color Scheme</label>
          <Select onValueChange={(value) => setColorScheme(value)}>
            <SelectTrigger id="color-scheme-select" className="w-[180px]">
              <SelectValue placeholder="Select color scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grayscale">Grayscale</SelectItem>
              <SelectItem value="rainbow">Rainbow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p>Center Coordinates: ({center.x.toFixed(3)}, {center.y.toFixed(3)})</p>
    </div>
  );
};

export default Index;