import { useState, useCallback } from "react";

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

  const isComplete = cursor >= prompt.length && chars.every((c) => c.status === "correct");

  const handleKey = useCallback(
    (key: string) => {
      if (cursor >= prompt.length) return;

      if (startTime === null) {
        setStartTime(Date.now());
      }

      setTotalKeystrokes((prev) => prev + 1);

      if (key === prompt[cursor]) {
        setChars((prev) => {
          const next = [...prev];
          next[cursor] = { ...next[cursor], status: "correct" };
          return next;
        });
        setCursor((prev) => prev + 1);
        setCorrectKeystrokes((prev) => prev + 1);
      } else {
        setChars((prev) => {
          const next = [...prev];
          next[cursor] = { ...next[cursor], status: "wrong" };
          return next;
        });
      }
    },
    [cursor, prompt, startTime],
  );

  const handleBackspace = useCallback(() => {
    // Only allow backspace when current position has a wrong character
    if (cursor >= prompt.length || chars[cursor]?.status !== "wrong") {
      return;
    }
    setChars((prev) => {
      const next = [...prev];
      next[cursor] = { ...next[cursor], status: "pending" };
      return next;
    });
    setTotalKeystrokes((prev) => prev + 1);
  }, [cursor, chars, prompt.length]);

  const reset = useCallback(() => {
    setChars(buildChars(prompt));
    setCursor(0);
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
