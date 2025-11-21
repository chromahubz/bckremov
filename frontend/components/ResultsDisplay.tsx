"use client";

import { useState } from "react";
import { Download, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import JSZip from "jszip";

interface ResultsDisplayProps {
  original: File[];
  processed: string[];
  onReset: () => void;
  compareMode?: boolean;
}

export default function ResultsDisplay({
  original,
  processed,
  onReset,
  compareMode = false
}: ResultsDisplayProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const downloadSingle = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `removed_${original[index]?.name || `image_${index + 1}`}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    if (processed.length === 1) {
      downloadSingle(processed[0], 0);
      return;
    }

    const zip = new JSZip();

    for (let i = 0; i < processed.length; i++) {
      const response = await fetch(processed[i]);
      const blob = await response.blob();
      const filename = `removed_${original[i]?.name || `image_${i + 1}`}.png`;
      zip.file(filename, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "bg_removed_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Main display */}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {compareMode ? "Model Comparison" : "Results"}
            </h3>
            <p className="text-sm text-gray-500">
              {processed.length} image{processed.length > 1 ? 's' : ''} processed
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => downloadAll()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              {processed.length > 1 ? "Download All" : "Download"}
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Image display */}
        <div className="p-6">
          {!compareMode ? (
            // Before/After Slider
            <div className="relative w-full max-w-4xl mx-auto bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {/* Processed image with transparency background (bottom layer - full width) */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #808080 25%, transparent 25%),
                    linear-gradient(-45deg, #808080 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #808080 75%),
                    linear-gradient(-45deg, transparent 75%, #808080 75%)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: '#ffffff'
                }}
              >
                <img
                  src={processed[selectedIndex]}
                  alt="Processed"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Original image (top layer - clipped by slider) */}
              <div
                className="absolute inset-0 bg-white"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                }}
              >
                <img
                  src={original[selectedIndex] ? URL.createObjectURL(original[selectedIndex]) : ''}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Slider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Slider input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />

              {/* Labels */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                Before
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                After
              </div>
            </div>
          ) : (
            // Model comparison grid
            <div className="grid grid-cols-2 gap-4">
              {processed.map((url, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      background: 'repeating-conic-gradient(#d1d5db 0% 25%, white 0% 50%) 50% / 20px 20px',
                      minHeight: '300px'
                    }}
                  >
                    <img
                      src={url}
                      alt={`Model ${idx + 1}`}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">
                      {idx === 0 ? "Rembg" : "Rembg Fast"}
                    </p>
                    <button
                      onClick={() => downloadSingle(url, idx)}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip for multiple images */}
      {processed.length > 1 && !compareMode && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">All Images</h4>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {processed.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`
                  aspect-square rounded-lg overflow-hidden border-2 transition-all
                  ${selectedIndex === idx
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                style={{
                  background: 'repeating-conic-gradient(#d1d5db 0% 25%, white 0% 50%) 50% / 10px 10px'
                }}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
