"use client";

import { useState } from "react";
import { Upload, Sparkles, Zap, Image as ImageIcon } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import ModelSelector from "@/components/ModelSelector";
import ResultsDisplay from "@/components/ResultsDisplay";
import BackgroundSelector from "@/components/BackgroundSelector";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("rembg");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const handleProcess = async () => {
    if (uploadedImages.length === 0) return;

    setIsProcessing(true);

    try {
      const results: string[] = [];

      for (const file of uploadedImages) {
        console.log(`📤 Uploading: ${file.name} with model: ${selectedModel}`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", selectedModel);

        // Only send bg_color if it's not empty (not transparent mode)
        if (!compareMode && backgroundColor && backgroundColor.trim() !== "") {
          formData.append("bg_color", backgroundColor);
          console.log(`🎨 Adding background color: ${backgroundColor}`);
        } else {
          console.log(`✨ Transparent mode - no background color`);
        }

        const response = await fetch("http://localhost:8001/remove", {
          method: "POST",
          body: formData,
        });

        console.log(`📥 Response status: ${response.status}`);
        console.log(`📥 Response headers:`, response.headers);

        if (response.ok) {
          const blob = await response.blob();
          console.log(`✅ Blob received: ${blob.size} bytes, type: ${blob.type}`);
          const url = URL.createObjectURL(blob);
          console.log(`✅ Created object URL: ${url}`);
          results.push(url);
        } else {
          console.error(`❌ Response not OK: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error(`❌ Error details: ${errorText}`);
        }
      }

      console.log(`📊 Total results: ${results.length}`);
      setProcessedImages(results);
    } catch (error) {
      console.error("Error processing images:", error);
      alert("Error processing images. Make sure the Python backend is running on port 8001.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompare = async () => {
    if (uploadedImages.length === 0) return;

    setIsProcessing(true);
    setCompareMode(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedImages[0]);

      const response = await fetch("http://localhost:8001/compare", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const results = await response.json();
        const urls = Object.values(results).map((r: any) => r.image);
        setProcessedImages(urls);
      }
    } catch (error) {
      console.error("Error comparing models:", error);
      alert("Error comparing models. Make sure the Python backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BgRemove Pro
                </h1>
                <p className="text-xs text-gray-500">Background Removal Tool</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Batch Processing</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        {uploadedImages.length === 0 && processedImages.length === 0 && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Remove Backgrounds Instantly
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Upload your images and remove backgrounds in seconds.
              Process single images or batches at once.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Fast Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Custom Backgrounds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Batch Support</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ModelSelector
              selected={selectedModel}
              onSelect={setSelectedModel}
              disabled={isProcessing}
            />

            <BackgroundSelector
              backgroundColor={backgroundColor}
              onColorChange={setBackgroundColor}
              onImageChange={setBackgroundImage}
              disabled={isProcessing || compareMode}
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleProcess}
                disabled={uploadedImages.length === 0 || isProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? "Processing..." : "Remove Background"}
              </button>

              <button
                onClick={handleCompare}
                disabled={uploadedImages.length === 0 || isProcessing}
                className="w-full px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? "Comparing..." : "Compare Methods"}
              </button>
            </div>

            {/* Stats */}
            {(uploadedImages.length > 0 || processedImages.length > 0) && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{uploadedImages.length}</div>
                    <div className="text-xs text-gray-600">Uploaded</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{processedImages.length}</div>
                    <div className="text-xs text-gray-600">Processed</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Area - Upload & Results */}
          <div className="lg:col-span-2">
            {processedImages.length === 0 ? (
              <ImageUploader
                onImagesSelected={setUploadedImages}
                disabled={isProcessing}
              />
            ) : (
              <ResultsDisplay
                original={uploadedImages}
                processed={processedImages}
                onReset={() => {
                  setProcessedImages([]);
                  setUploadedImages([]);
                  setCompareMode(false);
                }}
                compareMode={compareMode}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600 text-sm">
          <p>Professional background removal tool</p>
          <p className="mt-2">Fast, accurate, and easy to use</p>
        </div>
      </footer>
    </div>
  );
}
