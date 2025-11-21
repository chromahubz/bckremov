"use client";

import { useState } from "react";
import { Palette, Image as ImageIcon } from "lucide-react";

interface BackgroundSelectorProps {
  backgroundColor: string;
  onColorChange: (color: string) => void;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
}

const presetColors = [
  "#FFFFFF", // White
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#808080", // Gray
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
];

export default function BackgroundSelector({
  backgroundColor,
  onColorChange,
  onImageChange,
  disabled
}: BackgroundSelectorProps) {
  const [bgType, setBgType] = useState<"transparent" | "color" | "image">("transparent");

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Custom Background</h3>

      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setBgType("transparent");
            onColorChange("");
          }}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm
            ${bgType === "transparent"
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Transparent
        </button>
        <button
          onClick={() => {
            setBgType("color");
            if (!backgroundColor) onColorChange("#FFFFFF");
          }}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm
            ${bgType === "color"
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Palette className="w-4 h-4 inline mr-1" />
          Color
        </button>
        <button
          onClick={() => setBgType("image")}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm
            ${bgType === "image"
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Image
        </button>
      </div>

      {bgType === "transparent" ? (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-medium mb-2">Transparent Background</p>
          <p className="text-xs text-blue-700">
            The background will be removed and shown as a checkered pattern.
            Download as PNG to preserve transparency.
          </p>
        </div>
      ) : bgType === "color" ? (
        <div className="space-y-4">
          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={backgroundColor || "#FFFFFF"}
                onChange={(e) => onColorChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={backgroundColor || "#FFFFFF"}
                onChange={(e) => onColorChange(e.target.value)}
                disabled={disabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm disabled:opacity-50"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Preset colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preset Colors
            </label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  disabled={disabled}
                  className={`
                    w-full aspect-square rounded-lg border-2 transition-all
                    ${backgroundColor === color
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {color === "#FFFFFF" && (
                    <div className="w-full h-full border border-gray-200 rounded-md"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Background Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onImageChange(file || null);
            }}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-2">
            The uploaded image will be resized to match your image dimensions
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
        <p className="text-xs text-amber-800">
          ⚠️ Custom backgrounds are not available in "Compare Methods" mode
        </p>
      </div>
    </div>
  );
}
