/* ---------- UI helpers add trips ---------- */

export function PriceGroup({ legend, egpReg, euroReg, egpError, euroError }) {
  return (
    <fieldset className="rounded-xl border border-zinc-800 p-3">
      <legend className="px-1 text-xs text-zinc-400">{legend} price</legend>
      <div className="grid grid-cols-2 gap-2">
        {/* <div>
          <input className={inputCls(egpError)} placeholder="EGP" {...egpReg} />
          {egpError && <p className="mt-1 text-rose-300 text-xs">{egpError}</p>}
        </div> */}
        <div>
          <input
            className={inputCls(euroError)}
            placeholder="EUR"
            {...euroReg}
          />
          {euroError && (
            <p className="mt-1 text-rose-300 text-xs">{euroError}</p>
          )}
        </div>
      </div>
    </fieldset>
  );
}

export function inputCls(hasError, extra = "") {
  return [
    "w-full rounded-lg border bg-zinc-950/60 px-3 py-2 text-sm outline-none transition",
    hasError
      ? "border-rose-700 focus:ring-2 focus:ring-rose-700/50"
      : "border-zinc-800 focus:ring-2 focus:ring-zinc-700/50",
    extra,
  ].join(" ");
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <div className="mb-1">
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {label}
        </span>
      </div>
      {children}
      {error && <p className="mt-1 text-rose-300 text-xs">{error}</p>}
    </label>
  );
}

export function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <h2 className="text-sm font-semibold mb-3 tracking-wide text-zinc-200">
        {title}
      </h2>
      {children}
    </section>
  );
}
/* ---------- UI helpers  ---------- */
