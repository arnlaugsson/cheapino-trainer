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

const STATE_STYLES: Record<KeyState, { fill: string; textFill: string; className: string }> = {
  idle: { fill: "#374151", textFill: "#d1d5db", className: "idle" },
  highlighted: { fill: "#2563eb", textFill: "#ffffff", className: "highlighted" },
  dimmed: { fill: "#1f2937", textFill: "#6b7280", className: "dimmed" },
  active: { fill: "#16a34a", textFill: "#ffffff", className: "active" },
};

export function Key({ label, x, y, width, height, state, blank }: KeyProps) {
  if (blank) return null;

  const style = STATE_STYLES[state];
  const radius = 6;
  const fontSize = label.length > 3 ? 10 : label.length > 1 ? 12 : 16;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={style.fill}
        stroke="#4b5563"
        strokeWidth={1}
        className={style.className}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={style.textFill}
        fontSize={fontSize}
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}
