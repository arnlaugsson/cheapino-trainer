export type KeyState = "idle" | "highlighted" | "dimmed" | "active";

type KeyProps = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  state: KeyState;
  blank?: boolean;
};

const STATE_STYLES: Record<KeyState, { fill: string; stroke: string; textFill: string; shadow: string; className: string }> = {
  idle: { fill: "#2a2a2a", stroke: "#434655", textFill: "#c3c6d7", shadow: "rgba(0,0,0,0.5)", className: "idle" },
  highlighted: { fill: "#2a2a2a", stroke: "#2563eb", textFill: "#b4c5ff", shadow: "rgba(0,0,0,0.5)", className: "highlighted" },
  dimmed: { fill: "#1c1b1b", stroke: "#353534", textFill: "#4b5563", shadow: "rgba(0,0,0,0.3)", className: "dimmed" },
  active: { fill: "#2563eb", stroke: "#b4c5ff", textFill: "#eeefff", shadow: "rgba(37,99,235,0.3)", className: "active" },
};

export function Key({ label, x, y, width, height, state, blank }: KeyProps) {
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
    </g>
  );
}
