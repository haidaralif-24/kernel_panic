import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#05060a] px-6 text-center font-mono text-white">
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#ffb37a]/60">
        connection established
      </p>
      <h1 className="text-xl tracking-[0.2em] text-white/90">LAYER 1 // PENDING</h1>
      <p className="max-w-sm text-xs leading-6 text-white/40">
        The session endpoint and the first puzzle are not wired yet. This route is a
        placeholder so the gate has somewhere to go.
      </p>
      <Link
        href="/"
        className="border border-white/20 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:border-[#ffb37a]/60 hover:text-white"
      >
        back
      </Link>
    </main>
  );
}
