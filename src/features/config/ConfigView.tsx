import { useCallback, useRef, useState } from "react";
import { parseVilFile, type VilImportResult } from "./vial-import";
import type { Layout } from "../../data/layout";

type ConfigViewProps = {
  onImport: (layout: Layout) => void;
  onReset: () => void;
  hasCustomLayout: boolean;
};

export function ConfigView({ onImport, onReset, hasCustomLayout }: ConfigViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<VilImportResult | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const text = await file.text();
      const parsed = parseVilFile(text);
      setResult(parsed);
      if (parsed.ok) {
        onImport(parsed.layout);
      }
    },
    [onImport],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="max-w-3xl mx-auto py-12 px-8">
      <h2 className="font-headline text-3xl font-black uppercase tracking-widest text-primary-light mb-2">
        Import Layout
      </h2>
      <div className="w-16 h-1 bg-primary mb-8" />

      <section className="mb-10">
        <p className="text-on-surface-variant leading-relaxed mb-4">
          Import your keyboard layout from a Vial <code className="text-primary text-sm">.vil</code> file.
          The trainer and keyboard visualizer will update to match your actual key mapping.
        </p>
        <ol className="text-on-surface-variant leading-relaxed list-decimal list-inside space-y-2 mb-6">
          <li>Open <a href="https://get.vial.today/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light transition-colors">Vial</a> with your Cheapino connected</li>
          <li>Go to <span className="text-on-surface font-bold">File &rarr; Save current layout</span></li>
          <li>Drop the <code className="text-primary text-sm">.vil</code> file below</li>
        </ol>
      </section>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-outline hover:border-primary p-12 text-center cursor-pointer transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-4xl text-outline-dim mb-4 block">upload_file</span>
        <div className="text-on-surface-variant text-sm mb-2">
          Drop your <code className="text-primary">.vil</code> file here or click to browse
        </div>
        <div className="text-on-surface-variant text-[10px] opacity-50 uppercase tracking-widest">
          Exported from Vial &rarr; File &rarr; Save current layout
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".vil,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Result feedback */}
      {result && result.ok && (
        <div className="border border-primary bg-primary/10 p-4 mb-6">
          <div className="text-primary font-bold text-sm uppercase tracking-widest mb-1">
            Layout imported
          </div>
          <div className="text-on-surface-variant text-sm">
            {result.layout.layers.length} layers loaded. The keyboard visualizer and trainer now reflect your Vial config.
          </div>
        </div>
      )}

      {result && !result.ok && (
        <div className="border border-red-500 bg-red-500/10 p-4 mb-6">
          <div className="text-red-500 font-bold text-sm uppercase tracking-widest mb-1">
            Import failed
          </div>
          <div className="text-on-surface-variant text-sm">{result.error}</div>
        </div>
      )}

      {/* Reset button */}
      {hasCustomLayout && (
        <section className="mt-10 pt-8 border-t border-outline">
          <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-4">
            Reset to Default
          </h3>
          <p className="text-on-surface-variant text-sm mb-4">
            Discard your imported layout and revert to the built-in default keymap.
          </p>
          <button
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onReset();
              setResult(null);
            }}
            className="border border-outline text-on-surface-variant px-6 py-2 font-bold text-sm uppercase tracking-widest hover:bg-surface-high hover:text-on-surface transition-colors"
          >
            Reset Layout
          </button>
        </section>
      )}
    </div>
  );
}
