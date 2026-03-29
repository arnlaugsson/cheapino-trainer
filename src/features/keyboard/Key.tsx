export type KeyState = "idle" | "highlighted" | "dimmed" | "active";

type KeyProps = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  state: KeyState;
  blank?: boolean;
  hideLabel?: boolean;
};

const STATE_STYLES: Record<KeyState, { fill: string; stroke: string; textFill: string; shadow: string; className: string }> = {
  idle: { fill: "var(--t-key-fill)", stroke: "var(--t-key-stroke)", textFill: "var(--t-key-text)", shadow: "var(--t-key-shadow)", className: "idle" },
  highlighted: { fill: "var(--t-key-fill)", stroke: "var(--t-key-hl-stroke)", textFill: "var(--t-key-hl-text)", shadow: "var(--t-key-shadow)", className: "highlighted" },
  dimmed: { fill: "var(--t-key-dim-fill)", stroke: "var(--t-key-dim-stroke)", textFill: "var(--t-key-dim-text)", shadow: "var(--t-key-dim-shadow)", className: "dimmed" },
  active: { fill: "#2563eb", stroke: "#b4c5ff", textFill: "#eeefff", shadow: "rgba(37,99,235,0.3)", className: "active" },
};

export function Key({ label, x, y, width, height, state, blank, hideLabel }: KeyProps) {
  if (blank) return null;

  const style = STATE_STYLES[state];
  const fontSize = label.length > 3 ? 10 : label.length > 1 ? 12 : 16;
  const isActive = state === "active";
  const offsetX = isActive ? 1 : 0;
  const offsetY = isActive ? 1 : 0;

  return (
    <g>
      {/* Box shadow */}
      <rect
        x={x + 2}
        y={y + 2}
        width={width}
        height={height}
        fill={style.shadow}
      />
      {/* Key body */}
      <rect
        x={x + offsetX}
        y={y + offsetY}
        width={width}
        height={height}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={1}
        className={style.className}
      />
      {!hideLabel && (
        <text
          x={x + width / 2 + offsetX}
          y={y + height / 2 + offsetY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={style.textFill}
          fontSize={fontSize}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={state === "active" ? "bold" : "normal"}
        >
          {label}
        </text>
      )}
    </g>
  );
}
