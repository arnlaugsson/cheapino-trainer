import { useEffect, useCallback, useRef } from "react";
import { useExercise } from "./useExercise";
import { calculateWpm, calculateAccuracy } from "./metrics";

type TrainerViewProps = {
  prompt: string;
  onComplete: (result: { wpm: number; accuracy: number }) => void;
};

export function TrainerView({ prompt, onComplete }: TrainerViewProps) {
  const exercise = useExercise(prompt);
  const completedRef = useRef(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (exercise.isComplete) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        exercise.handleBackspace();
        return;
      }

      // Ignore modifier keys, function keys, etc.
      if (e.key.length !== 1) return;

      e.preventDefault();
      exercise.handleKey(e.key);
    },
    [exercise],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (exercise.isComplete && !completedRef.current) {
      completedRef.current = true;
      const elapsed = exercise.startTime
        ? Date.now() - exercise.startTime
        : 0;
      const wpm = calculateWpm(exercise.correctKeystrokes, elapsed);
      const accuracy = calculateAccuracy(
        exercise.correctKeystrokes,
        exercise.totalKeystrokes,
      );
      onComplete({ wpm, accuracy });
    }
  }, [exercise.isComplete, exercise.startTime, exercise.correctKeystrokes, exercise.totalKeystrokes, onComplete]);

  return (
    <div className="font-mono text-2xl leading-relaxed">
      <div className="flex flex-wrap gap-0">
        {exercise.chars.map((char, i) => {
          const isCursor = i === exercise.cursor && !exercise.isComplete;
          return (
            <span
              key={i}
              data-cursor={isCursor || undefined}
              className={`
                ${char.status === "correct" ? "text-green-400" : ""}
                ${char.status === "wrong" ? "text-red-400 bg-red-900/30" : ""}
                ${char.status === "pending" ? "text-gray-500" : ""}
                ${isCursor ? "border-b-2 border-blue-400" : ""}
              `}
            >
              {char.char === " " ? "\u00A0" : char.char}
            </span>
          );
        })}
      </div>
      {exercise.isComplete && (
        <div className="mt-6 text-base text-gray-400">
          Exercise complete! Press any key for next exercise.
        </div>
      )}
    </div>
  );
}
