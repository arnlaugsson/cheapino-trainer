import { useState, useCallback, useRef } from "react";

type CharStatus = "pending" | "correct" | "wrong";

export type CharState = {
  char: string;
  status: CharStatus;
};

export type UseExerciseResult = {
  prompt: string;
  chars: CharState[];
  cursor: number;
  isComplete: boolean;
  totalKeystrokes: number;
  correctKeystrokes: number;
  startTime: number | null;
  handleKey: (key: string) => void;
  handleBackspace: () => void;
  reset: () => void;
};

function buildChars(prompt: string): CharState[] {
  return [...prompt].map((char) => ({ char, status: "pending" as const }));
}

export function useExercise(prompt: string): UseExerciseResult {
  const [chars, setChars] = useState<CharState[]>(() => buildChars(prompt));
  const [cursor, setCursor] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  const startTimeRef = useRef(startTime);
  startTimeRef.current = startTime;

  const isComplete = cursor >= prompt.length && chars.every((c) => c.status === "correct");

  const handleKey = useCallback(
    (key: string) => {
      const cur = cursorRef.current;
      if (cur >= prompt.length) return;

      if (startTimeRef.current === null) {
        setStartTime(Date.now());
      }

      setTotalKeystrokes((prev) => prev + 1);

      if (key === prompt[cur]) {
        setChars((prev) => {
          const next = [...prev];
          next[cur] = { ...next[cur], status: "correct" };
          return next;
        });
        setCursor((prev) => prev + 1);
        cursorRef.current = cur + 1;
        setCorrectKeystrokes((prev) => prev + 1);
      } else {
        setChars((prev) => {
          const next = [...prev];
          next[cur] = { ...next[cur], status: "wrong" };
          return next;
        });
      }
    },
    [prompt],
  );

  const handleBackspace = useCallback(() => {
    const cur = cursorRef.current;
    if (cur >= prompt.length) return;

    setChars((prev) => {
      if (prev[cur]?.status !== "wrong") return prev;
      const next = [...prev];
      next[cur] = { ...next[cur], status: "pending" };
      return next;
    });
    setTotalKeystrokes((prev) => prev + 1);
  }, [prompt.length]);

  const reset = useCallback(() => {
    setChars(buildChars(prompt));
    setCursor(0);
    cursorRef.current = 0;
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setStartTime(null);
  }, [prompt]);

  return {
    prompt,
    chars,
    cursor,
    isComplete,
    totalKeystrokes,
    correctKeystrokes,
    startTime,
    handleKey,
    handleBackspace,
    reset,
  };
}
