"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import Strands from "./strands";

const BOOT = [
  "> kernel panic -- core dumped",
  "> trace daemon .......... online",
  "> intruder detected ...... 0x1f",
  "> gatekeeper ............. awake",
];

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Sampled from the Gatekeeper palette: red, orange, amber, cream, peach, red, magenta. */
const GATEKEEPER_COLORS = ["#fe2b1e", "#ff5a2e", "#ff791b", "#ffe2a8", "#ffb37a", "#ff3d2e", "#c42a6a"];

const subscribeReduced = (callback: () => void) => {
  const media = window.matchMedia(REDUCED_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;

function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, getReduced, () => false);
}

export default function Landing() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"boot" | "ready">("boot");
  const [done, setDone] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const skipRef = useRef<() => void>(() => {});
  const ready = reduced || phase === "ready";

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    let index = 0;
    const typeLine = () => {
      const text = BOOT[index];
      let chars = 0;
      const tick = () => {
        if (cancelled) return;
        chars += 1;
        setTyping(text.slice(0, chars));
        if (chars < text.length) {
          later(12, tick);
          return;
        }
        setDone((prev) => [...prev, text]);
        setTyping("");
        index += 1;
        if (index < BOOT.length) {
          later(110, typeLine);
        } else {
          later(500, () => setPhase("ready"));
        }
      };
      later(20, tick);
    };
    later(300, typeLine);

    skipRef.current = () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      setDone(BOOT);
      setTyping("");
      setPhase("ready");
    };

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduced]);

  useEffect(() => {
    if (ready) return;
    const skip = (event: Event) => {
      if (event instanceof KeyboardEvent && (event.key === "Tab" || event.key === "Shift")) return;
      skipRef.current();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      const target = event.target;
      if (target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement) return;
      router.push("/play");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, router]);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#05060a] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, #170a0f 0%, #0a0608 45%, #040305 100%)",
        }}
      />

      <header className="relative z-10 flex items-start justify-between px-5 pt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/35 sm:px-8 sm:pt-7">
        <span>iwise // ai &amp; web programming</span>
        <span className="text-right leading-5">
          escape room
          <br />
          <span className="text-white/20">build 0.1</span>
        </span>
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-2">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.45em] text-[#ffb37a]/45">
          intrusion in progress
        </p>

        <h1 className="kp-flicker text-center text-[clamp(1.9rem,6.2vw,3.6rem)] font-semibold leading-none tracking-[-0.03em] text-white">
          KERNEL PANIC
        </h1>

        <div className="relative mt-2 h-[clamp(220px,42vh,480px)] w-full max-w-2xl">
          <Strands
            className="absolute inset-0"
            colors={GATEKEEPER_COLORS}
            glass
            glassSize={1}
            energy={0.68}
            intensity={1.1}
          />
        </div>

        <div className="mt-1 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-white/60">
            <span className="kp-caret inline-block h-1.5 w-1.5 rounded-full bg-[#ff5a2e] shadow-[0_0_10px_rgba(255,90,46,0.85)]" />
            gatekeeper
          </div>
          <p className="max-w-[22rem] font-mono text-[11px] leading-5 text-white/35">
            the machine&apos;s own ai. it holds the last passphrase.
          </p>
        </div>
      </section>

      <footer className="relative z-10 flex min-h-[9.5rem] flex-col items-center justify-end gap-4 px-5 pb-7 sm:pb-9">
        {ready ? (
          <>
            <Link
              href="/play"
              className="kp-rise group inline-flex items-center gap-3 border border-white/20 bg-white/[0.02] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.35em] text-white/80 transition-colors duration-300 hover:border-[#ffb37a]/60 hover:bg-[#ffb37a]/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffb37a]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] focus-visible:outline-none sm:px-12"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff5a2e] shadow-[0_0_10px_rgba(255,90,46,0.9)]" />
              click to play
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
              45:00 trace &middot; 5 layers &middot; press enter
            </p>
          </>
        ) : (
          <div aria-hidden className="w-full max-w-md font-mono text-[11px] leading-6 text-white/40">
            {done.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div className="text-[#ffb37a]/70">
              {typing}
              <span className="kp-caret ml-0.5 inline-block">&#9612;</span>
            </div>
          </div>
        )}
      </footer>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(5,6,10,0.9))" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 opacity-60"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div
        aria-hidden
        className="kp-scan pointer-events-none absolute inset-x-0 top-0 z-30 h-24"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,90,46,0.07), transparent)" }}
      />
    </main>
  );
}
