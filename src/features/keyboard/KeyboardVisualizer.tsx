import { useState } from "react";
import type { Layout, Layer, KeyDef } from "../../data/layout";
import { Key, type KeyState } from "./Key";
import {
  getKeyPositions,
  getTotalWidth,
  getTotalHeight,
  FINGER_ROWS,
  THUMB_KEYS,
} from "./layout-geometry";

type KeyboardVisualizerProps = {
  layout: Layout;
  activeLayer: string;
  activeKeys: Set<string>;
  lockedLayer?: boolean;
  onLayerChange?: (layerName: string) => void;
};

function getKeyState(
  keyDef: KeyDef,
  activeKeys: Set<string>,
  isActiveLayer: boolean,
): KeyState {
  if (keyDef.blank) return "dimmed";
  if (keyDef.code && activeKeys.has(keyDef.code)) return "active";
  if (!keyDef.code && activeKeys.has(keyDef.label)) return "active";
  if (isActiveLayer) return "highlighted";
  return "dimmed";
}

function renderHalf(
  half: "left" | "right",
  layer: Layer,
  activeKeys: Set<string>,
  isActiveLayer: boolean,
) {
  const keys = half === "left" ? layer.left : layer.right;
  const positions = getKeyPositions(half, FINGER_ROWS, THUMB_KEYS);

  return keys.flatMap((row, rowIdx) =>
    row.map((keyDef, colIdx) => {
      const pos = positions[rowIdx]?.[colIdx];
      if (!pos) return null;
      return (
        <Key
          key={`${half}-${rowIdx}-${colIdx}`}
          label={keyDef.label}
          x={pos.x}
          y={pos.y}
          width={pos.width}
          height={pos.height}
          state={getKeyState(keyDef, activeKeys, isActiveLayer)}
          blank={keyDef.blank}
        />
      );
    }),
  );
}

export function KeyboardVisualizer({
  layout,
  activeLayer,
  activeKeys,
  lockedLayer = false,
  onLayerChange,
}: KeyboardVisualizerProps) {
  const [browsingLayer, setBrowsingLayer] = useState<string | null>(null);

  const displayLayerName = lockedLayer
    ? activeLayer
    : browsingLayer ?? activeLayer;
  const displayLayer = layout.layers.find((l) => l.name === displayLayerName);

  if (!displayLayer) return null;

  const isActiveLayer = displayLayerName === activeLayer;
  const width = getTotalWidth();
  const height = getTotalHeight();
  const padding = 20;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {layout.layers.map((layer) => (
          <button
            key={layer.name}
            onClick={() => {
              if (!lockedLayer) {
                setBrowsingLayer(layer.name);
                onLayerChange?.(layer.name);
              }
            }}
            className={`px-3 py-1 rounded text-sm font-mono ${
              displayLayerName === layer.name
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            } ${lockedLayer && layer.name !== activeLayer ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {layer.name}
          </button>
        ))}
      </div>
      <svg
        viewBox={`${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`}
        className="w-full max-w-2xl"
      >
        {renderHalf("left", displayLayer, activeKeys, isActiveLayer)}
        {renderHalf("right", displayLayer, activeKeys, isActiveLayer)}
      </svg>
    </div>
  );
}
