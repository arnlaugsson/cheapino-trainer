import type { Stage } from "../../data/stages";
import { isStageUnlocked, isStageComplete, getProgress } from "./progress-store";

type StageListProps = {
  stages: Stage[];
  activeStageId: number;
  onSelectStage: (stageId: number) => void;
};

function formatStageId(id: number): string {
  return `#${String(id).padStart(2, "0")}`;
}

function formatStageName(name: string): string {
  return name.toUpperCase().replace(/\s+/g, "_");
}

export function StageList({ stages, activeStageId, onSelectStage }: StageListProps) {
  return (
    <nav className="flex flex-col">
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
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (unlocked) onSelectStage(stage.id);
            }}
            className={`
              text-left p-4 border-b border-outline transition-colors
              ${isActive ? "bg-surface-highest border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}
              ${!isActive && unlocked ? "hover:bg-surface-high cursor-pointer" : ""}
              ${!unlocked ? "cursor-not-allowed" : ""}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] opacity-50">{formatStageId(stage.id)}</span>
              {complete && (
                <span className="text-[10px] text-primary font-bold">
                  {progress.bestWpm > 0 ? `${progress.bestWpm} WPM` : "DONE"}
                </span>
              )}
              {!complete && !unlocked && (
                <span className="text-[10px] text-neutral-500">LOCKED</span>
              )}
              {!complete && unlocked && progress.attempts > 0 && (
                <span className="text-[10px] text-on-surface-variant">
                  {progress.bestWpm > 0 ? `${progress.bestWpm} WPM` : `${Math.round(progress.bestAccuracy * 100)}%`}
                </span>
              )}
            </div>
            <div className={`text-sm font-bold tracking-tight ${
              unlocked ? "text-on-surface" : "text-neutral-500"
            }`}>
              {formatStageName(stage.name)}
            </div>
            {unlocked && (
              <div className="w-full bg-surface-dim h-1 mt-3">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: complete ? "100%" : `${Math.min(progress.attempts * 10, 90)}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
