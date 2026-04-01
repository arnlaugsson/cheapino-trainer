const LINKS = [
  { label: "CHEAPINO_GITHUB", url: "https://github.com/tompi/cheapino", desc: "Hardware design, PCB files, and build guides" },
  { label: "BUILD_GUIDE_V2", url: "https://github.com/tompi/cheapino/blob/master/doc/buildguide_v2.md", desc: "Step-by-step assembly instructions with photos" },
  { label: "FIRMWARE_GUIDE", url: "https://github.com/tompi/cheapino/blob/master/doc/firmware.md", desc: "QMK firmware build and flash instructions" },
  { label: "VIAL_CONFIGURATOR", url: "https://get.vial.today/", desc: "GUI tool to remap keys and layers in real time" },
  { label: "QMK_FIRMWARE", url: "https://qmk.fm/", desc: "Open-source keyboard firmware powering the Cheapino" },
  { label: "36_KEY_LAYOUT_GUIDE", url: "https://peterxjang.com/blog/designing-a-36-key-custom-keyboard-layout.html", desc: "Peter Xjang's guide to designing a 36-key custom keyboard layout" },
  { label: "TRAINER_SOURCE", url: "https://github.com/arnlaugsson/cheapino-trainer", desc: "Source code for this training app" },
] as const;

export function AboutView() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-8">
      <h2 className="font-headline text-3xl font-black uppercase tracking-widest text-primary-light mb-2">
        About Cheapino
      </h2>
      <div className="w-16 h-1 bg-primary mb-8" />

      <section className="mb-10">
        <p className="text-on-surface-variant leading-relaxed mb-4">
          The <span className="text-on-surface font-bold">Cheapino</span> is an affordable split 36-key keyboard
          designed by <a href="https://github.com/tompi" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light transition-colors">tompi</a>.
          It&apos;s probably one of the cheapest split keyboards you can build — the result of
          enjoying building keyboards while not wanting to spend much money on it.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          The PCB is reversible and uses a Japanese duplex matrix, so only a single
          microcontroller is needed. The two halves connect with a standard RJ45 cable.
          It runs <span className="text-on-surface font-bold">QMK</span> firmware and supports{" "}
          <span className="text-on-surface font-bold">Vial</span> for real-time key remapping
          without reflashing.
        </p>
      </section>

      <section className="mb-10">
        <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-4">
          Key Layout
        </h3>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          36 keys arranged in a column-stagger split layout: 3 rows of 5 keys per half
          plus 3 thumb keys per side. The column stagger follows natural finger lengths —
          the middle column sits highest, with pinky and inner columns lower.
        </p>
        <div className="bg-surface-high border border-outline p-4 text-sm text-on-surface-variant">
          <div className="mb-2 text-[10px] text-primary font-bold uppercase tracking-widest">Layer Architecture</div>
          <div className="flex flex-col gap-1">
            <div><span className="text-on-surface font-bold">Base</span> — QWERTY alpha keys, punctuation</div>
            <div><span className="text-on-surface font-bold">Numbers</span> — Hold Space to activate: digits and arithmetic</div>
            <div><span className="text-on-surface font-bold">Symbols</span> — Hold Tab to activate: brackets, operators, specials</div>
            <div><span className="text-on-surface font-bold">Navigation</span> — Hold Enter to activate: arrows, Home, End, Page Up/Down</div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-4">
          About This Trainer
        </h3>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          Switching to a split keyboard is disorienting — column stagger, thumb keys, and
          layers are all new concepts at once. This app breaks the learning curve into 7
          progressive stages, from finding your home row to full integration across all layers.
        </p>
        <p className="text-on-surface-variant leading-relaxed">
          The trainer validates the characters your keyboard produces, not how you produce them.
          The keyboard visualizer teaches the &ldquo;how&rdquo; — the trainer confirms the &ldquo;what&rdquo;.
          Edit <code className="text-primary text-sm">src/data/layout.ts</code> to match your
          Vial config and everything adapts.
        </p>
      </section>

      <section className="mb-10">
        <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-4">
          Built By
        </h3>
        <p className="text-on-surface-variant leading-relaxed">
          Made by{" "}
          <a href="https://github.com/arnlaugsson" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light transition-colors font-bold">
            Skuli Arnlaugsson
          </a>
          {" "}— learning to type on a Cheapino one stage at a time.
        </p>
      </section>

      <section>
        <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-4">
          Links
        </h3>
        <div className="flex flex-col gap-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-3 border border-outline hover:border-primary hover:bg-surface-high transition-colors group"
            >
              <span className="text-primary text-sm font-bold tracking-widest shrink-0 group-hover:text-primary-light transition-colors">
                {link.label}
              </span>
              <span className="text-on-surface-variant text-sm">
                {link.desc}
              </span>
              <span className="material-symbols-outlined text-outline-dim ml-auto shrink-0 text-sm group-hover:text-primary transition-colors">
                open_in_new
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
