import { useState, useCallback, useEffect, useRef } from "react";
import { stages } from "../data/stages";
import { defaultLayout } from "../data/layout";
import { KeyboardVisualizer } from "../features/keyboard/KeyboardVisualizer";
import { useKeyPress } from "../features/keyboard/useKeyPress";
import { TrainerView } from "../features/trainer/TrainerView";
import { KeySequenceView } from "../features/trainer/KeySequenceView";
import { generateExercise } from "../features/trainer/exercise-generator";
import { StageList } from "../features/progress/StageList";
import { AboutView } from "../features/about/AboutView";
import {
  saveResult,
  isStageComplete,
} from "../features/progress/progress-store";

type Page = "train" | "about";

function App() {
  const [page, setPage] = useState<Page>("train");
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
    setExerciseKey((prev) => prev + 1);
    setLastResult(null);
  }, []);

  const lastResultRef = useRef(lastResult);
  lastResultRef.current = lastResult;
  const handleNextRef = useRef(handleNextExercise);
  handleNextRef.current = handleNextExercise;
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && lastResultRef.current && pageRef.current === "train") {
        e.preventDefault();
        handleNextRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-surface text-on-surface">
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-8 bg-surface border-b border-outline shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="font-headline font-black text-xl text-primary-light tracking-widest">
            CHEAPINO_TRAINER
          </h1>
          <nav className="flex gap-6 ml-4">
            <button
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPage("train")}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                page === "train"
                  ? "text-primary underline underline-offset-8"
                  : "text-on-surface-variant opacity-50 hover:text-primary-light"
              }`}
            >
              Train
            </button>
            <button
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPage("about")}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                page === "about"
                  ? "text-primary underline underline-offset-8"
                  : "text-on-surface-variant opacity-50 hover:text-primary-light"
              }`}
            >
              About
            </button>
          </nav>
        </div>
        <button
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            document.documentElement.classList.toggle("light");
            const isLight = document.documentElement.classList.contains("light");
            localStorage.setItem("cheapino-theme", isLight ? "light" : "dark");
          }}
          className="flex items-center gap-2 text-[10px] font-bold tracking-widest border border-outline px-3 py-1 hover:bg-surface-high transition-colors uppercase"
        >
          <span className="material-symbols-outlined text-sm">light_mode</span>
          THEME
        </button>
      </header>

      {page === "about" ? (
        <div className="flex-1 overflow-y-auto">
          <AboutView />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* STAGE SIDEBAR */}
          <aside className="w-60 bg-surface-low border-r border-outline overflow-y-auto shrink-0">
            <div className="p-4 border-b border-outline bg-surface-high">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase block mb-1">
                Current Protocol
              </span>
              <h3 className="font-headline text-lg leading-tight uppercase">
                {stage.name}
              </h3>
            </div>
            <StageList
              stages={stages}
              activeStageId={activeStageId}
              onSelectStage={handleSelectStage}
            />
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 flex flex-col items-center justify-center px-12 py-8 overflow-y-auto">
            <p className="text-sm text-on-surface-variant opacity-60 max-w-2xl text-center mb-8">
              {stage.description}
            </p>

            <div className="mb-12 w-full flex justify-center">
              <KeyboardVisualizer
                layout={defaultLayout}
                activeLayer={stage.layers[stage.layers.length - 1]}
                activeKeys={activeKeys}
              />
            </div>

            <div className="w-full flex justify-center">
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
              <div className="mt-8 flex items-center gap-12">
                {stage.threshold.wpm > 0 && (
                  <div className="text-center">
                    <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                      WPM
                    </div>
                    <div className="font-headline text-3xl font-black">
                      {lastResult.wpm}
                      <span className="text-sm text-on-surface-variant opacity-40 ml-1">
                        /{stage.threshold.wpm}
                      </span>
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                    Accuracy
                  </div>
                  <div className="font-headline text-3xl font-black">
                    {Math.round(lastResult.accuracy * 100)}%
                    <span className="text-sm text-on-surface-variant opacity-40 ml-1">
                      /{Math.round(stage.threshold.accuracy * 100)}%
                    </span>
                  </div>
                </div>
                <button
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleNextExercise}
                  className="bg-primary text-on-primary px-6 py-2 font-bold text-sm uppercase tracking-widest hover:bg-primary/80 transition-colors"
                >
                  Next Exercise
                </button>
              </div>
            )}

            {lastResult && isStageComplete(activeStageId) &&
              activeStageId < stages.length - 1 && (
                <div className="mt-4 text-sm text-primary font-bold uppercase tracking-widest">
                  Stage complete — next stage unlocked
                </div>
              )}
          </main>
        </div>
      )}

      {/* FOOTER */}
      <footer className="h-8 flex items-center justify-between px-8 bg-surface-dim border-t border-outline shrink-0 text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span className="text-primary opacity-70">SYSTEM_READY</span>
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#2563eb]" />
          <span className="text-on-surface-variant opacity-40">
            KEYBOARD: CHEAPINO_36
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://get.vial.today/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface-variant opacity-40 hover:text-primary transition-colors"
          >
            VIAL_CONFIG
          </a>
          <a
            href="https://github.com/arnlaugsson/cheapino-trainer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface-variant opacity-40 hover:text-primary transition-colors"
          >
            GITHUB
          </a>
          <span className="text-primary opacity-50">CHPN.OS</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
