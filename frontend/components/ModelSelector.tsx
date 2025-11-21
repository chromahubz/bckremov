"use client";

import { Check, Zap, Sparkles, Cpu, Stars, Video } from "lucide-react";

interface ModelSelectorProps {
  selected: string;
  onSelect: (model: string) => void;
  disabled?: boolean;
}

const models = [
  {
    id: "rembg",
    name: "Rembg",
    description: "U-2-Net model - Best balance",
    icon: Sparkles,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    features: ["High accuracy", "Fast processing", "General purpose"]
  },
  {
    id: "birefnet",
    name: "BiRefNet",
    description: "State-of-the-art 2024 model",
    icon: Stars,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    features: ["Best quality", "Latest AI", "2024 model"]
  },
  {
    id: "backgroundremover",
    name: "BackgroundRemover",
    description: "Video support & high quality",
    icon: Video,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    features: ["Video support", "High quality", "Versatile"]
  },
  {
    id: "rembg-fast",
    name: "Rembg Fast",
    description: "U-2-Net-P - Faster & smaller",
    icon: Zap,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    features: ["Fastest", "Smaller model", "Good quality"]
  },
  {
    id: "rembg-anime",
    name: "Rembg Anime",
    description: "Specialized for anime art",
    icon: Cpu,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    features: ["Anime optimized", "Art friendly", "Illustrations"]
  }
];

export default function ModelSelector({ selected, onSelect, disabled }: ModelSelectorProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Select AI Model</h3>

      <div className="space-y-3">
        {models.map((model) => {
          const Icon = model.icon;
          const isSelected = selected === model.id;

          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              disabled={disabled}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{model.name}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{model.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {model.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-full ${model.bgColor} ${model.textColor}`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Use "Compare Models" to see results side-by-side
        </p>
      </div>
    </div>
  );
}
