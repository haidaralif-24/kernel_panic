"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  "KERNEL PANIC v0.1 -- cold boot",
  "[    0.000000] Linux version 6.12.10-kp (root@kernelpanic) #1 SMP PREEMPT_DYNAMIC",
  "[    0.000311] Command line: BOOT_IMAGE=/vmlinuz root=/dev/lab ro quiet splash",
  "[    0.001024] x86/fpu: Supporting XSAVE feature set: x87, SSE, AVX, AVX2",
  "[    0.003887] Memory: 16384MB available",
  "[  OK  ] Mounted /dev/lab (ext4, ro, data=ordered)",
  "[  OK  ] Started Journal Service.",
  "[  OK  ] Reached target Multi-User System.",
  "[    0.098210] kp-trace: daemon starting (mode=watch, window=2700s)",
  "[  OK  ] kp-trace: countdown armed at 45:00",
  "[    0.104002] net: eth0 link up (1000Mb/s, full duplex)",
  "[  WARN  ] audit: 1 unauthorised session on tty1",
  "[    0.111880] audit: session 0x1f from 10.13.37.9 (unverified)",
  "[  FAIL  ] kp-guard: gatekeeper refused to answer root",
  "[    0.129441] kp-guard: reinitialising core",
  "[  OK  ] kp-guard: gatekeeper online (layer 5 sealed)",
  "[  OK  ] kp-layers: 5 seals intact",
  "[    0.141002] kp-shell: root shell locked",
  "[    0.152774] kp-shell: waiting for intruder input",
  "",
  "  KERNEL PANIC -- root shell locked",
  "  trace 45:00  |  layers 5  |  session 0x1f",
];

const STATUS = /^(\[\s+(OK|WARN|FAIL)\s+\])(.*)$/;

function Line({ text }: { text: string }) {
  const match = STATUS.exec(text);
  if (match) {
    const tone =
      match[2] === "OK"
        ? "text-emerald-400/85"
        : match[2] === "WARN"
          ? "text-amber-400/90"
          : "text-red-400/90";
    return (
      <>
        <span className={tone}>{match[1]}</span>
        <span className="text-zinc-400">{match[3]}</span>
      </>
    );
  }
  if (text.startsWith("KERNEL PANIC")) return <span className="text-white/85">{text}</span>;
  if (text.startsWith("  ")) return <span className="text-white/55">{text}</span>;
  return <span>{text}</span>;
}

type BootSequenceProps = {
  reduced: boolean;
  onDone: () => void;
};

export default function BootSequence({ reduced, onDone }: BootSequenceProps) {
  const [count, setCount] = useState(() => (reduced ? LINES.length : 0));
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (count >= LINES.length) {
      const timer = window.setTimeout(onDone, reduced ? 900 : 750);
      return () => window.clearTimeout(timer);
    }
    const delay = count < 5 ? 70 : 42;
    const timer = window.setTimeout(() => setCount((c) => c + 1), delay);
    return () => window.clearTimeout(timer);
  }, [count, reduced, onDone]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center bg-[#030305] px-4 pt-5">
      <div
        ref={scrollRef}
        className="kp-scroll w-full max-w-3xl flex-1 overflow-y-auto pt-3 pb-12 font-mono text-[11.5px] leading-[1.6] text-zinc-400 sm:text-[13px]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
      >
        {LINES.slice(0, count).map((line, index) => (
          <div key={index} className="kp-boot-line whitespace-pre-wrap">
            <Line text={line} />
          </div>
        ))}
        {count < LINES.length && (
          <span className="kp-caret inline-block text-[#ff5a2e]" aria-hidden>
            &#9612;
          </span>
        )}
      </div>
      <p className="pb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">
        press any key to skip
      </p>
    </div>
  );
}
