import type { Stage } from "../../data/stages";
import { isStageUnlocked, isStageComplete, getProgress } from "./progress-store";

type StageListProps = {
  stages: Stage[];
  activeStageId: number;
  onSelectStage: (stageId: number) => void;
};

export function StageList({ stages, activeStageId, onSelectStage }: StageListProps) {
  return (
    <nav className="flex flex-col gap-1">
      {stages.map((stage) => {
        const unlocked = isStageUnlocked(stage.id);
        const complete = isStageComplete(stage.id);
        const isActive = stage.id === activeStageId;
        const progress = getProgress(stage.id);

        return (
          <button
            key={stage.id}
            data-stage-id={stage.id}
            data-locked={!unlocked || undefined}
            onClick={() => {
              if (unlocked) onSelectStage(stage.id);
            }}
            className={`
              text-left px-3 py-2 rounded text-sm font-mono transition-colors
              ${isActive ? "bg-blue-600/20 text-blue-400 border border-blue-600/40" : ""}
              ${!isActive && unlocked ? "text-gray-300 hover:bg-gray-800" : ""}
              ${!unlocked ? "text-gray-600 cursor-not-allowed" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 text-center">
                {complete ? "\u2713" : unlocked ? stage.id : "\u2022"}
              </span>
              <span>{stage.name}</span>
            </div>
            {unlocked && progress.attempts > 0 && (
              <div className="ml-7 text-xs text-gray-500">
                {stage.threshold.wpm > 0 && `${progress.bestWpm} WPM / `}
                {Math.round(progress.bestAccuracy * 100)}% acc
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
