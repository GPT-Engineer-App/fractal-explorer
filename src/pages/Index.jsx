import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const canvasRef = useRef(null);
  const [center, setCenter] = useState({ x: -0.5, y: 0 });
  const [zoom, setZoom] = useState(200);
  const [iterations, setIterations] = useState(100);
  const [colorScheme, setColorScheme] = useState("grayscale");
  const [minIter, setMinIter] = useState(0);
  const [maxIter, setMaxIter] = useState(iterations);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderMandelbrotSet(ctx, center, zoom, iterations, colorScheme);
    }
  }, [center, zoom, iterations, colorScheme]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderMandelbrotSet(ctx, center, zoom, iterations, colorScheme);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [center, zoom, iterations, colorScheme]);

  const renderMandelbrotSet = (ctx, center, zoom, iterations, colorScheme) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    // Ensure width and height are valid before creating image data
    if (width <= 0 || height <= 0) {
      console.error("Invalid canvas dimensions:", width, height);
      return;
    }

    const imageData = ctx.createImageData(width, height);
    let localMinIter = iterations;
    let localMaxIter = 0;

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
        if (i < localMinIter) localMinIter = i;
        if (i > localMaxIter) localMaxIter = i;
        const pixelIndex = (x + y * width) * 4;
        const color = getColor(i, localMinIter, localMaxIter, colorScheme);
        imageData.data[pixelIndex] = color.r;
        imageData.data[pixelIndex + 1] = color.g;
        imageData.data[pixelIndex + 2] = color.b;
        imageData.data[pixelIndex + 3] = 255;
      }
    }
    setMinIter(localMinIter);
    setMaxIter(localMaxIter);
    ctx.putImageData(imageData, 0, 0);
  };

  const getColor = (i, minIter, maxIter, scheme) => {
    if (scheme === "grayscale") {
      const color = i === 0 ? 0 : 255 - ((i - minIter) * 255) / (maxIter - minIter);
      return { r: color, g: color, b: color };
    } else if (scheme === "rainbow") {
      const ratio = (i - minIter) / (maxIter - minIter);
      const hue = ratio * 360;
      return hslToRgb(hue, 1, 0.5);
    } else if (scheme === "sunset") {
      const ratio = (i - minIter) / (maxIter - minIter);
      const r = Math.floor(255 * (1 - ratio));
      const g = Math.floor(128 * (1 - ratio));
      const b = Math.floor(255 * ratio);
      return { r, g, b };
    } else if (scheme === "ocean") {
      const ratio = (i - minIter) / (maxIter - minIter);
      const r = Math.floor(0 * ratio);
      const g = Math.floor(105 * ratio);
      const b = Math.floor(255 * (1 - ratio));
      return { r, g, b };
    }
    return { r: 0, g: 0, b: 0 };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
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
    setIterations(100);
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
    renderMandelbrotSet(canvas.getContext("2d"), { x: newX, y: newY }, zoom, iterations, colorScheme);
  };

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" onClick={handleCanvasClick}></canvas>
      <div className="absolute top-4 left-4 space-y-4">
        <div className="flex space-x-4">
          <Button onClick={handleZoomIn}>Zoom In</Button>
          <Button onClick={handleZoomOut}>Zoom Out</Button>
          <Button onClick={handleReset}>Reset</Button>
        </div>
        <div className="flex space-x-4">
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
                <SelectItem value="sunset">Sunset</SelectItem>
                <SelectItem value="ocean">Ocean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p>Center Coordinates: ({center.x.toFixed(3)}, {center.y.toFixed(3)})</p>
        <p>Iteration Range: {minIter} - {maxIter}</p>
      </div>
    </div>
  );
};

export default Index;