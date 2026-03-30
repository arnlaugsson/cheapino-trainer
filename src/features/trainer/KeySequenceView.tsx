import { useState, useEffect, useRef } from "react";

const KEY_MAP: Record<string, string> = {
  Left: "ArrowLeft",
  Right: "ArrowRight",
  Up: "ArrowUp",
  Down: "ArrowDown",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
};

const NAV_KEYS = new Set([
  ...Object.values(KEY_MAP),
  ...Object.keys(KEY_MAP),
]);

type KeyStatus = "pending" | "correct" | "wrong";

type KeySequenceViewProps = {
  prompt: string;
  onComplete: (result: { accuracy: number }) => void;
};

export function KeySequenceView({ prompt, onComplete }: KeySequenceViewProps) {
  const keys = prompt.split(" ").filter(Boolean);
  const [cursor, setCursor] = useState(0);
  const cursorRef = useRef(0);
  const [statuses, setStatuses] = useState<KeyStatus[]>(
    () => keys.map(() => "pending"),
  );
  const [totalPresses, setTotalPresses] = useState(0);
  const [correctPresses, setCorrectPresses] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cursorRef.current >= keys.length) return;
      if (!NAV_KEYS.has(e.key)) return;

      e.preventDefault();
      setTotalPresses((prev) => prev + 1);

      const cur = cursorRef.current;
      const expectedLabel = keys[cur];
      const expectedKey = KEY_MAP[expectedLabel] ?? expectedLabel;

      if (e.key === expectedKey) {
        setStatuses((prev) => {
          const next = [...prev];
          next[cur] = "correct";
          return next;
        });
        setCorrectPresses((prev) => prev + 1);
        cursorRef.current = cur + 1;
        setCursor(cur + 1);
      } else {
        setStatuses((prev) => {
          const next = [...prev];
          next[cur] = "wrong";
          return next;
        });
        setTimeout(() => {
          setStatuses((prev) => {
            const next = [...prev];
            if (next[cur] === "wrong") next[cur] = "pending";
            return next;
          });
        }, 300);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prompt]);

  const isComplete = cursor >= keys.length;

  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      const accuracy = totalPresses > 0 ? correctPresses / totalPresses : 0;
      onComplete({ accuracy });
    }
  }, [isComplete, totalPresses, correctPresses, onComplete]);

  return (
    <div className="font-mono text-2xl leading-relaxed">
      <div className="flex flex-wrap gap-3">
        {keys.map((key, i) => {
          const isCurrent = i === cursor && !isComplete;
          return (
            <span
              key={i}
              data-current={isCurrent || undefined}
              data-wrong={statuses[i] === "wrong" || undefined}
              className={`
                px-3 py-1 rounded border
                ${statuses[i] === "correct" ? "text-green-400 border-green-600 bg-green-900/20" : ""}
                ${statuses[i] === "wrong" ? "text-red-400 border-red-600 bg-red-900/20" : ""}
                ${statuses[i] === "pending" && isCurrent ? "text-white border-blue-400 bg-blue-900/20" : ""}
                ${statuses[i] === "pending" && !isCurrent ? "text-gray-500 border-gray-700" : ""}
              `}
            >
              {key}
            </span>
          );
        })}
      </div>
      {isComplete && (
        <div className="mt-6 text-base text-gray-400">
          Sequence complete! Press any key for next exercise.
        </div>
      )}
    </div>
  );
}
