"use client";

import { useState } from "react";
import { RotateCcw, ZoomIn, Crop, X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
  onCrop?: () => void;
}

export function ImagePreview({ src, onRemove, onCrop }: ImagePreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative group">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-accent/20">
        <img
          src={src}
          alt="Preview"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
        />

        {/* Controls overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => setRotation((r) => r - 90)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            type="button"
            aria-label="Rotate preview image"
          >
            <RotateCcw className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            type="button"
            aria-label="Zoom preview image"
          >
            <ZoomIn className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
          {onCrop && (
            <button
              onClick={onCrop}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              type="button"
              aria-label="Crop preview image"
            >
              <Crop className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-2 rounded-lg bg-destructive/80 hover:bg-destructive transition-colors"
            type="button"
            aria-label="Remove preview image"
          >
            <X className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}