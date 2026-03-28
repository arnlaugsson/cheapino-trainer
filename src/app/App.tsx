import { useState, useCallback } from "react";
import { stages } from "../data/stages";
import { defaultLayout } from "../data/layout";
import { KeyboardVisualizer } from "../features/keyboard/KeyboardVisualizer";
import { useKeyPress } from "../features/keyboard/useKeyPress";
import { TrainerView } from "../features/trainer/TrainerView";
import { KeySequenceView } from "../features/trainer/KeySequenceView";
import { generateExercise } from "../features/trainer/exercise-generator";
import { StageList } from "../features/progress/StageList";
import {
  saveResult,
  isStageComplete,
} from "../features/progress/progress-store";

function App() {
  const [activeStageId, setActiveStageId] = useState(0);
  const [exerciseKey, setExerciseKey] = useState(0);
  const [lastResult, setLastResult] = useState<{
    wpm: number;
    accuracy: number;
  } | null>(null);
  const [exercise, setExercise] = useState(() => generateExercise(stages[0]));

  const stage = stages[activeStageId];
  const { activeKeys } = useKeyPress();

  const handleComplete = useCallback(
    (result: { wpm: number; accuracy: number }) => {
      saveResult(activeStageId, result);
      setLastResult(result);
    },
    [activeStageId],
  );

  const handleNextExercise = useCallback(() => {
    setExercise(generateExercise(stages[activeStageId]));
    setExerciseKey((prev) => prev + 1);
    setLastResult(null);
  }, [activeStageId]);

  const handleSelectStage = useCallback((stageId: number) => {
    setActiveStageId(stageId);
    setExercise(generateExercise(stages[stageId]));
    setExerciseKey(0);
    setLastResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold font-mono">Cheapino Trainer</h1>
      </header>

      <div className="flex flex-1">
        <aside className="w-56 border-r border-gray-800 p-4">
          <StageList
            stages={stages}
            activeStageId={activeStageId}
            onSelectStage={handleSelectStage}
          />
        </aside>

        <main className="flex-1 p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold font-mono mb-1">
              Stage {stage.id}: {stage.name}
            </h2>
            <p className="text-gray-400 text-sm">{stage.description}</p>
          </div>

          <div className="mb-8">
            <KeyboardVisualizer
              layout={defaultLayout}
              activeLayer={stage.layers[stage.layers.length - 1]}
              activeKeys={activeKeys}
            />
          </div>

          <div className="mb-6">
            {exercise.type === "key-sequence" ? (
              <KeySequenceView
                key={exerciseKey}
                prompt={exercise.prompt}
                onComplete={(result) =>
                  handleComplete({ wpm: 0, accuracy: result.accuracy })
                }
              />
            ) : (
              <TrainerView
                key={exerciseKey}
                prompt={exercise.prompt}
                onComplete={handleComplete}
              />
            )}
          </div>

          {lastResult && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex gap-8 text-sm font-mono">
                {stage.threshold.wpm > 0 && (
                  <div>
                    <span className="text-gray-500">WPM: </span>
                    <span className="text-white">{lastResult.wpm}</span>
                    <span className="text-gray-600">
                      {" "}
                      / {stage.threshold.wpm}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Accuracy: </span>
                  <span className="text-white">
                    {Math.round(lastResult.accuracy * 100)}%
                  </span>
                  <span className="text-gray-600">
                    {" "}
                    / {Math.round(stage.threshold.accuracy * 100)}%
                  </span>
                </div>
              </div>
              {isStageComplete(activeStageId) &&
                activeStageId < stages.length - 1 && (
                  <div className="mt-3 text-green-400 text-sm">
                    Stage complete! Next stage unlocked.
                  </div>
                )}
              <button
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleNextExercise}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-mono"
              >
                Next Exercise
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
