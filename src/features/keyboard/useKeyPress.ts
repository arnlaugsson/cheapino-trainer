import { useState, useEffect, useRef } from "react";

type KeyInfo = {
  code: string;
  key: string;
};

type UseKeyPressOptions = {
  onKeyDown?: (event: KeyboardEvent) => void;
};

type UseKeyPressResult = {
  activeKeys: Set<string>;
  lastKey: KeyInfo | null;
};

export function useKeyPress(options?: UseKeyPressOptions): UseKeyPressResult {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastKey, setLastKey] = useState<KeyInfo | null>(null);
  const onKeyDownRef = useRef(options?.onKeyDown);
  onKeyDownRef.current = options?.onKeyDown;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
      setLastKey({ code: e.code, key: e.key });
      onKeyDownRef.current?.(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { activeKeys, lastKey };
}
