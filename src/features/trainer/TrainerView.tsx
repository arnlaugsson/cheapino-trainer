import { useEffect, useRef } from "react";
import { useExercise } from "./useExercise";
import { calculateWpm, calculateAccuracy } from "./metrics";

type TrainerViewProps = {
  prompt: string;
  onComplete: (result: { wpm: number; accuracy: number }) => void;
};

export function TrainerView({ prompt, onComplete }: TrainerViewProps) {
  const exercise = useExercise(prompt);
  const completedRef = useRef(false);
  const exerciseRef = useRef(exercise);
  exerciseRef.current = exercise;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ex = exerciseRef.current;
      if (ex.isComplete) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        ex.handleBackspace();
        return;
      }

      // Ignore modifier keys, function keys, etc.
      if (e.key.length !== 1) return;

      e.preventDefault();
      ex.handleKey(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="w-full">
      <div className="text-3xl lg:text-4xl tracking-normal leading-relaxed text-center">
        {exercise.chars.map((char, i) => {
          const isCursor = i === exercise.cursor && !exercise.isComplete;
          return (
            <span
              key={i}
              data-cursor={isCursor || undefined}
              className={`
                ${char.status === "correct" ? "text-primary" : ""}
                ${char.status === "wrong" ? "text-red-500 bg-red-900/20" : ""}
                ${char.status === "pending" ? "opacity-30" : ""}
                ${isCursor ? "border-b-2 border-primary caret-blink" : ""}
              `}
            >
              {char.char === " " ? "\u00A0" : char.char}
            </span>
          );
        })}
      </div>
      {exercise.isComplete && (
        <div className="mt-8 text-sm text-on-surface-variant text-center uppercase tracking-widest">
          Exercise complete — press Enter for next
        </div>
      )}
    </div>
  );
}
