"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LayoutBlock } from "./types";
import { layoutTypeOptions } from "./types";

interface SortableLayoutBlockProps {
  block: LayoutBlock;
  onUpdate: (updates: Partial<LayoutBlock>) => void;
  onRemove: () => void;
}

export function SortableLayoutBlock({
  block,
  onUpdate,
  onRemove,
}: SortableLayoutBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.key,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 20 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass-card space-y-3 p-4 border border-border transition-all",
        isDragging
          ? "ring-2 ring-primary/60 shadow-2xl bg-background"
          : "shadow-lg bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-lg border border-border bg-accent/40 hover:bg-accent/60 transition-colors"
            aria-label={`Drag layout block ${block.label}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" aria-hidden="true" />
          </button>
          <label htmlFor={`block-label-${block.key}`} className="sr-only">
            Layout block label
          </label>
          <input
            id={`block-label-${block.key}`}
            type="text"
            value={block.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="form-input text-sm"
            placeholder="Block label"
            aria-label="Layout block label"
          />
        </div>
        <button
          onClick={onRemove}
          className="text-xs uppercase tracking-widest text-destructive hover:text-destructive/80"
          type="button"
        >
          Remove
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor={`block-type-${block.key}`} className="text-xs text-muted-foreground uppercase tracking-wide">
          Type
        </label>
        <select
          id={`block-type-${block.key}`}
          value={block.type}
          onChange={(e) => onUpdate({ type: e.target.value as LayoutBlock["type"] })}
          className="form-input"
        >
          {layoutTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <label htmlFor={`block-width-${block.key}`} className="text-xs text-muted-foreground uppercase tracking-wide">
            Width
          </label>
          <input
            id={`block-width-${block.key}`}
            type="number"
            min={1}
            max={12}
            value={block.width}
            onChange={(e) => onUpdate({ width: Number(e.target.value) || 1 })}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor={`block-height-${block.key}`} className="text-xs text-muted-foreground uppercase tracking-wide">
            Height
          </label>
          <input
            id={`block-height-${block.key}`}
            type="number"
            min={1}
            max={6}
            value={block.height}
            onChange={(e) => onUpdate({ height: Number(e.target.value) || 1 })}
            className="form-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <label htmlFor={`block-gridx-${block.key}`} className="text-xs text-muted-foreground uppercase tracking-wide">
            Grid X
          </label>
          <input
            id={`block-gridx-${block.key}`}
            type="number"
            min={0}
            value={block.gridX}
            onChange={(e) => onUpdate({ gridX: Number(e.target.value) || 0 })}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor={`block-gridy-${block.key}`} className="text-xs text-muted-foreground uppercase tracking-wide">
            Grid Y
          </label>
          <input
            id={`block-gridy-${block.key}`}
            type="number"
            min={0}
            value={block.gridY}
            onChange={(e) => onUpdate({ gridY: Number(e.target.value) || 0 })}
            className="form-input"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Blocks with `gridY` will stack vertically; width/height determine proportion.
      </p>
    </div>
  );
}