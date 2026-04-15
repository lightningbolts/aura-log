"use client";

import { useCallback, useMemo, useState } from "react";
import { BackgroundCanvas } from "@/components/aura/BackgroundCanvas";
import { useFirebase } from "@/components/firebase/FirebaseProvider";
import { captureWithWatermark } from "@/lib/export/capture-with-watermark";
import {
  signInWithApple,
  signInWithGoogle,
  signOutEverywhere,
} from "@/lib/firebase/auth-actions";
import { saveDailyAura, utcDateKey } from "@/lib/firebase/daily-auras";
import { useAuraGradient } from "@/hooks/useAuraGradient";

const DEFAULT_SOCIAL = 82;
const DEFAULT_CHAOS = 24;
const DEFAULT_FOCUS = 95;
const DEFAULT_SLEEP = 15;

export function AuraHomeExperience() {
  const { user, authReady } = useFirebase();
  const [social, setSocial] = useState(DEFAULT_SOCIAL);
  const [chaos, setChaos] = useState(DEFAULT_CHAOS);
  const [focus, setFocus] = useState(DEFAULT_FOCUS);
  const [sleep, setSleep] = useState(DEFAULT_SLEEP);
  const [busy, setBusy] = useState<"save" | "export" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aura = useAuraGradient(social, chaos, focus, sleep);

  const sliderStyle = useCallback(
    (track: "social" | "chaos" | "focus" | "sleep") => {
      const styles: Record<typeof track, string> = {
        social: "linear-gradient(to right, #48e4ff, #29d6f1)",
        chaos: "linear-gradient(to right, #efddc6, #f74b6d)",
        focus: "linear-gradient(to right, #ae8dff, #6a37d4)",
        sleep: "linear-gradient(to right, #29d6f1, #006573)",
      };
      return { background: styles[track], borderRadius: "999px" } as const;
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setError(null);
    if (!user) {
      setError("sign in to save your aura");
      return;
    }
    setBusy("save");
    try {
      await saveDailyAura({
        userId: user.uid,
        dateKey: utcDateKey(),
        metrics: aura.metrics,
        palette: aura.palette,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setBusy(null);
    }
  }, [aura.metrics, aura.palette, user]);

  const handleExport = useCallback(async () => {
    setError(null);
    setBusy("export");
    try {
      await captureWithWatermark({
        target: "#aura-capture-root",
        fileName: `auralog-${utcDateKey()}.png`,
        watermarkText: "AuraLog",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "export failed");
    } finally {
      setBusy(null);
    }
  }, []);

  const authButtons = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            void signInWithGoogle().catch((e: unknown) =>
              setError(e instanceof Error ? e.message : "google sign-in failed"),
            );
          }}
          className="rounded-full border border-white/50 bg-white/30 px-4 py-2 text-xs font-semibold lowercase tracking-wide text-on-surface shadow-sm backdrop-blur-md transition hover:bg-white/50"
        >
          google
        </button>
        <button
          type="button"
          onClick={() => {
            void signInWithApple().catch((e: unknown) =>
              setError(e instanceof Error ? e.message : "apple sign-in failed"),
            );
          }}
          className="rounded-full border border-white/50 bg-white/30 px-4 py-2 text-xs font-semibold lowercase tracking-wide text-on-surface shadow-sm backdrop-blur-md transition hover:bg-white/50"
        >
          apple
        </button>
      </div>
    ),
    [],
  );

  return (
    <div
      id="aura-capture-root"
      className="relative flex min-h-screen flex-col overflow-x-hidden bg-surface-container-lowest font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container"
    >
      <BackgroundCanvas uniforms={aura.uniforms} />

      <header className="z-50 flex w-full items-center justify-between bg-transparent px-6 py-6 md:px-12 md:py-8">
        <div className="font-poppins text-2xl font-bold tracking-tight text-on-surface">
          AuraLog
        </div>
        <nav className="hidden items-center space-x-12 md:flex">
          {["Log", "Trends", "Energy", "Insights"].map((label, i) => (
            <span
              key={label}
              className={`cursor-default text-sm font-semibold lowercase tracking-wider ${
                i === 0 ? "font-bold text-primary" : "text-on-surface-variant"
              }`}
            >
              {label}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {!user && authReady ? authButtons : null}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="animate-pulse rounded-full bg-gradient-to-tr from-primary to-secondary p-1">
                <div className="rounded-full bg-white p-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Profile"
                    src={
                      user.photoURL ??
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`
                    }
                    className="h-10 w-10 rounded-full object-cover"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOutEverywhere()}
                className="material-symbols-outlined cursor-pointer text-on-surface-variant transition-colors hover:text-primary"
              >
                logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex flex-grow flex-col items-center justify-center px-6 pb-48 pt-12">
        <div className="mb-16 w-full max-w-5xl space-y-4 text-center">
          <h1 className="font-headline text-5xl font-extrabold leading-none tracking-tighter text-on-surface opacity-90 md:text-[5rem]">
            how are we <span className="text-primary italic">vibing&nbsp;&nbsp;</span>
            today?
          </h1>
          <p className="mx-auto max-w-lg text-lg font-medium lowercase tracking-wide text-on-surface-variant">
            capture your neural telemetry through the luminous ether.
          </p>
        </div>

        <div className="relative flex h-64 w-full max-w-4xl items-center justify-center">
          <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary-container/20 blur-3xl" />
          <div className="z-10 grid w-full grid-cols-2 gap-6 px-4 md:grid-cols-4 md:gap-8 md:px-12">
            {[
              { icon: "bolt", label: "Vibe Sync", color: "text-primary", offset: "" },
              {
                icon: "auto_graph",
                label: "Flow State",
                color: "text-secondary",
                offset: "md:translate-y-8",
              },
              {
                icon: "psychology",
                label: "Neural Load",
                color: "text-error-dim",
                offset: "",
              },
              {
                icon: "edit_note",
                label: "Log Note",
                color: "text-primary-fixed-dim",
                offset: "md:translate-y-8",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`glass-gradient-border flex h-32 flex-col items-center justify-center space-y-2 rounded-xl bg-white/20 backdrop-blur-md transition-transform hover:-translate-y-2 ${c.offset}`}
              >
                <span className={`material-symbols-outlined scale-125 ${c.color}`}>
                  {c.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-12 left-1/2 z-40 w-[92%] max-w-6xl -translate-x-1/2">
        <div className="glass-gradient-border flex flex-col gap-8 rounded-[2.5rem] bg-white/40 p-8 shadow-aura-card backdrop-blur-[40px] md:flex-row md:items-center md:gap-12 md:p-10">
          <div className="grid flex-grow grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            <SliderBlock
              label="Social Battery"
              hint="how drained are you?"
              value={social}
              onChange={setSocial}
              trackStyle={sliderStyle("social")}
              accentClass="text-secondary"
            />
            <SliderBlock
              label="Chaos"
              hint="how much noise is in your brain?"
              value={chaos}
              onChange={setChaos}
              trackStyle={sliderStyle("chaos")}
              accentClass="text-primary"
            />
            <SliderBlock
              label="Focus"
              hint="are you in the zone?"
              value={focus}
              onChange={setFocus}
              trackStyle={sliderStyle("focus")}
              accentClass="text-primary-dim"
            />
            <SliderBlock
              label="Sleep Debt"
              hint="did you rest enough?"
              value={sleep}
              onChange={setSleep}
              trackStyle={sliderStyle("sleep")}
              accentClass="text-secondary"
            />
          </div>
          <div className="flex flex-shrink-0 flex-col items-stretch gap-3 md:items-end">
            {error ? (
              <p className="max-w-xs text-center text-xs lowercase text-error md:text-right">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void handleSave()}
                className="flex items-center justify-center gap-3 rounded-full bg-gradient-to-br from-primary to-secondary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-aura-cta transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {busy === "save" ? "saving…" : "Save"}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void handleExport()}
                className="flex items-center justify-center gap-3 rounded-full border border-white/60 bg-white/30 px-8 py-4 text-sm font-bold uppercase tracking-widest text-on-surface shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {busy === "export" ? "exporting…" : "Share image"}
                <span className="material-symbols-outlined text-lg">download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-8 left-1/2 z-50 flex w-[92%] max-w-lg -translate-x-1/2 items-center justify-around rounded-full border border-white/50 bg-white/40 px-2 py-3 shadow-aura-nav backdrop-blur-[40px] md:hidden">
        {[
          { icon: "edit_note", label: "log", active: true },
          { icon: "auto_graph", label: "trends", active: false },
          { icon: "bolt", label: "energy", active: false },
          { icon: "psychology", label: "insights", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex cursor-default flex-col items-center justify-center ${
              item.active ? "relative text-primary after:absolute after:-bottom-1 after:h-1 after:w-1 after:rounded-full after:bg-current after:content-['']" : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[11px] font-semibold lowercase tracking-wide">
              {item.label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}

function SliderBlock(props: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
  trackStyle: { background: string; borderRadius: string };
  accentClass: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-on-surface">{props.label}</p>
          <p className="text-[11px] lowercase tracking-wide text-on-surface-variant">
            {props.hint}
          </p>
        </div>
        <span className={`text-[10px] font-bold ${props.accentClass}`}>
          {props.value}%
        </span>
      </div>
      <div className="relative h-2 w-full">
        <input
          type="range"
          min={0}
          max={100}
          value={props.value}
          onChange={(e) => props.onChange(Number(e.target.value))}
          className="aura-range-thumb h-full w-full cursor-pointer"
          style={props.trackStyle}
          aria-label={props.label}
        />
      </div>
    </div>
  );
}
