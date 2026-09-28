"use client";

import { useEffect, useState } from "react";
import { onboardingChat } from "@/lib/content";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { LogoMark } from "@/components/ui/Logo";
import { LineIcon } from "@/components/ui/LineIcon";

const STEP_MS = 1700;
const HOLD_MS = 3200;

export function OnboardingChat() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(1);
  const [userPlaying, setPlaying] = useState(true);
  const playing = userPlaying && !reduced;
  const shown = reduced ? onboardingChat.length : step;

  useEffect(() => {
    if (!playing) return;
    const done = step >= onboardingChat.length;
    const timer = window.setTimeout(() => setStep(done ? 1 : step + 1), done ? HOLD_MS : STEP_MS);
    return () => window.clearTimeout(timer);
  }, [step, playing]);

  const done = shown >= onboardingChat.length;
  const typing = playing && shown < onboardingChat.length;
  const nextIsAgent = onboardingChat[shown]?.from === "agent";

  return (
    <div className="card flex h-full min-h-[330px] flex-col">
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="bg-surface-3 grid h-8 w-8 place-items-center rounded-[8px]">
            <LogoMark className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-heading text-[13px] font-medium">PrepSuccess agent</p>
            <p className="text-text-dim font-mono text-[10px] tracking-wide uppercase">
              Onboarding · step {shown}/{onboardingChat.length}
            </p>
          </div>
        </div>
        <span className="border-border text-heading inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase">
          {done ? (
            <>
              <LineIcon name="check" className="h-3 w-3" /> Profile saved
            </>
          ) : (
            <>
              <span
                className={`h-1.5 w-1.5 rounded-full ${playing ? "animate-pulse-dot bg-accent" : "bg-border-strong"}`}
              />
              {playing ? "Live" : "Paused"}
            </>
          )}
        </span>
      </div>
      <div className="flex gap-1 px-4 pt-3" aria-hidden>
        {onboardingChat.map((_, i) => (
          <span
            key={i}
            className={`h-[3px] flex-1 transition-colors duration-500 ${i < shown ? "bg-heading" : "bg-surface-3"}`}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-clip p-4" aria-live="polite">
        {onboardingChat.slice(0, shown).map((message, i) => (
          <p
            key={`${i}-${message.text}`}
            className={`max-w-[85%] animate-[chat-in_.45s_var(--ease-out-cubic)] px-3.5 py-2.5 text-[13px] leading-snug ${
              message.from === "agent"
                ? "bg-surface-3 text-heading self-start rounded-[12px_12px_12px_3px]"
                : "bg-heading self-end rounded-[12px_12px_3px_12px] text-white"
            }`}
          >
            {message.text}
          </p>
        ))}
        {typing ? (
          <span
            className={`flex gap-1 px-3.5 py-3 ${
              nextIsAgent
                ? "bg-surface-3 self-start rounded-[12px_12px_12px_3px]"
                : "bg-heading/80 self-end rounded-[12px_12px_3px_12px]"
            }`}
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={`h-1.5 w-1.5 animate-bounce rounded-full ${nextIsAgent ? "bg-heading/50" : "bg-white/70"}`}
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </span>
        ) : null}
      </div>

      <div className="border-border bg-bg mx-3 mb-3 flex items-center gap-2 rounded-[10px] border py-1.5 pr-1.5 pl-3">
        <span className="text-text-dim flex-1 truncate text-[12px]">
          {typing && !nextIsAgent ? "Typing…" : "Type your answer…"}
        </span>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause conversation" : "Play conversation"}
          className="text-text-dim hover:bg-surface-3 hover:text-heading grid h-7 w-7 place-items-center rounded-[7px] transition-colors"
        >
          {playing ? (
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
              <rect x="3.5" y="3" width="3" height="10" />
              <rect x="9.5" y="3" width="3" height="10" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M4.5 3v10l8.5-5z" />
            </svg>
          )}
        </button>
        <span
          aria-hidden
          className="bg-heading grid h-7 w-7 place-items-center rounded-[7px] text-white"
        >
          <LineIcon name="send" className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
