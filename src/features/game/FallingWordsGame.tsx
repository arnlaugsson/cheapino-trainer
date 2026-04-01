import { useEffect, useRef, useState } from "react";
import { getWordsForStage } from "../../data/words";

type GameState = "ready" | "playing" | "gameover";

type FallingWord = {
  readonly id: number;
  readonly word: string;
  readonly x: number;
  readonly y: number;
  readonly speed: number;
};

type FallingWordsGameProps = {
  stageId: number;
  onExit: () => void;
};

const CONTAINER_HEIGHT = 400;
const SPAWN_INTERVAL_MS = 2000;
const BASE_SPEED = 40; // pixels per second
const SPEED_INCREMENT = 5;
const MAX_LIVES = 3;
const WORDS_PER_SPEED_BUMP = 5;

function pickRandomWord(words: readonly string[]): string {
  if (words.length === 0) return "test";
  return words[Math.floor(Math.random() * words.length)];
}

function pickRandomX(): number {
  return 10 + Math.random() * 70; // 10% to 80% of container width
}

function createWord(
  id: number,
  words: readonly string[],
  speed: number,
): FallingWord {
  return {
    id,
    word: pickRandomWord(words),
    x: pickRandomX(),
    y: 0,
    speed,
  };
}

function advanceWord(word: FallingWord, deltaSeconds: number): FallingWord {
  return { ...word, y: word.y + word.speed * deltaSeconds };
}

function getCurrentSpeed(wordsCompleted: number): number {
  const bumps = Math.floor(wordsCompleted / WORDS_PER_SPEED_BUMP);
  return BASE_SPEED + bumps * SPEED_INCREMENT;
}

export function FallingWordsGame({ stageId, onExit }: FallingWordsGameProps) {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [words, setWords] = useState<readonly FallingWord[]>([]);
  const [input, setInput] = useState("");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeWordId, setActiveWordId] = useState<number | null>(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const inputRef = useRef(input);
  inputRef.current = input;
  const livesRef = useRef(lives);
  livesRef.current = lives;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const streakRef = useRef(streak);
  streakRef.current = streak;
  const activeWordIdRef = useRef(activeWordId);
  activeWordIdRef.current = activeWordId;

  const wordListRef = useRef<readonly string[]>([]);
  const nextIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    wordListRef.current = getWordsForStage(stageId);
  }, [stageId]);

  const startGame = () => {
    setGameState("playing");
    setWords([]);
    setInput("");
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setActiveWordId(null);
    nextIdRef.current = 0;
    lastSpawnRef.current = 0;
    lastFrameRef.current = performance.now();
  };

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    lastFrameRef.current = performance.now();
    lastSpawnRef.current = performance.now();

    const loop = (now: number) => {
      if (gameStateRef.current !== "playing") return;

      const delta = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      // Spawn new words
      if (now - lastSpawnRef.current >= SPAWN_INTERVAL_MS) {
        lastSpawnRef.current = now;
        const speed = getCurrentSpeed(scoreRef.current);
        const newWord = createWord(nextIdRef.current++, wordListRef.current, speed);
        setWords((prev) => [...prev, newWord]);
      }

      // Move words down
      setWords((prev) => {
        const moved = prev.map((w) => advanceWord(w, delta));
        const fallen = moved.filter((w) => w.y >= CONTAINER_HEIGHT);
        const remaining = moved.filter((w) => w.y < CONTAINER_HEIGHT);

        if (fallen.length > 0) {
          const newLives = livesRef.current - fallen.length;
          setLives(Math.max(0, newLives));
          setStreak(0);

          // Clear active word if it fell
          if (fallen.some((w) => w.id === activeWordIdRef.current)) {
            setActiveWordId(null);
            setInput("");
          }

          if (newLives <= 0) {
            setGameState("gameover");
            return [];
          }
        }

        return remaining;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === "ready" && e.key === " ") {
        e.preventDefault();
        startGame();
        return;
      }

      if (gameStateRef.current === "gameover" && e.key === " ") {
        e.preventDefault();
        startGame();
        return;
      }

      if (gameStateRef.current !== "playing") return;

      if (e.key === "Backspace") {
        e.preventDefault();
        setInput((prev) => prev.slice(0, -1));
        if (inputRef.current.length <= 1) {
          setActiveWordId(null);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setInput("");
        setActiveWordId(null);
        return;
      }

      if (e.key.length !== 1) return;
      e.preventDefault();

      const newInput = inputRef.current + e.key;
      setInput(newInput);

      // Find matching word
      const currentWords = wordsRef.current;
      const activeId = activeWordIdRef.current;

      // If we have an active word, check if it's completed
      const activeWord = activeId !== null
        ? currentWords.find((w) => w.id === activeId)
        : null;

      if (activeWord && activeWord.word === newInput) {
        // Word completed
        setWords((prev) => prev.filter((w) => w.id !== activeId));
        setInput("");
        setScore((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        setActiveWordId(null);
        return;
      }

      if (activeWord && activeWord.word.startsWith(newInput)) {
        // Still typing active word correctly
        return;
      }

      // Try to find a new matching word
      const match = currentWords.find((w) => w.word.startsWith(newInput));
      if (match) {
        setActiveWordId(match.id);
        if (match.word === newInput) {
          setWords((prev) => prev.filter((w) => w.id !== match.id));
          setInput("");
          setScore((prev) => prev + 1);
          setStreak((prev) => prev + 1);
          setActiveWordId(null);
        }
      } else {
        // No match — reset
        setActiveWordId(null);
        setInput("");
        setStreak(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* HUD */}
      <div className="w-full flex justify-between items-center px-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Score
            </span>
            <span className="ml-2 font-headline text-xl font-black">
              {score}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Streak
            </span>
            <span className="ml-2 font-headline text-xl font-black">
              {streak}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span
                key={i}
                className={`inline-block w-3 h-3 border ${
                  i < lives
                    ? "bg-primary border-primary shadow-[0_0_6px_#2563eb]"
                    : "bg-transparent border-outline"
                }`}
              />
            ))}
          </div>
          <button
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onExit}
            className="text-[10px] font-bold uppercase tracking-widest border border-outline px-3 py-1 hover:bg-surface-high transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Game field */}
      <div
        className="relative w-full border border-outline bg-surface-low overflow-hidden"
        style={{ height: CONTAINER_HEIGHT }}
        data-testid="game-field"
      >
        {gameState === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-headline text-2xl font-black uppercase tracking-widest mb-4">
                Falling Words
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                Press Space to start
              </p>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-headline text-2xl font-black uppercase tracking-widest mb-2 text-red-500">
                Game Over
              </h2>
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Final Score:{" "}
                </span>
                <span className="font-headline text-xl font-black">
                  {score}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                Press Space to play again
              </p>
            </div>
          </div>
        )}

        {gameState === "playing" &&
          words.map((w) => (
            <div
              key={w.id}
              className={`absolute px-2 py-1 text-sm font-mono font-bold border transition-colors ${
                w.id === activeWordId
                  ? "border-primary bg-surface-high text-primary-light"
                  : "border-outline bg-[var(--t-key-fill)] text-[var(--t-key-text)]"
              }`}
              style={{
                left: `${w.x}%`,
                top: w.y,
                transform: "translateX(-50%)",
              }}
              data-testid="falling-word"
            >
              {w.id === activeWordId
                ? renderTypedWord(w.word, input)
                : w.word}
            </div>
          ))}
      </div>

      {/* Input display */}
      <div className="w-full text-center">
        <div className="inline-block border border-outline bg-surface-low px-6 py-2 min-w-[200px]">
          <span className="text-lg font-mono">
            {input || (
              <span className="text-on-surface-variant opacity-30">
                {gameState === "playing" ? "type here..." : ""}
              </span>
            )}
          </span>
          {gameState === "playing" && (
            <span className="border-r-2 border-primary caret-blink ml-0.5">
              &nbsp;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function renderTypedWord(word: string, typed: string) {
  return word.split("").map((char, i) => {
    const isTyped = i < typed.length;
    const isCorrect = isTyped && typed[i] === char;
    const isWrong = isTyped && typed[i] !== char;
    return (
      <span
        key={i}
        className={
          isCorrect
            ? "text-primary"
            : isWrong
              ? "text-red-500"
              : "opacity-50"
        }
      >
        {char}
      </span>
    );
  });
}
