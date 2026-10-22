'use client';

import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sliders, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound';

interface SimulationControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onOpenCustomInput?: () => void;
  onSelectPreset?: (presetName: string) => void;
  presets?: { label: string; value: string }[];
  canStepNext?: boolean;
  canStepPrev?: boolean;
}

export function SimulationControls({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onNext,
  onPrev,
  onReset,
  onSpeedChange,
  onOpenCustomInput,
  presets,
  onSelectPreset,
  canStepNext = true,
  canStepPrev = true,
}: SimulationControlsProps) {
  const speeds = [0.5, 1, 2];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl px-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
      {/* Left: Step indicator & Presets */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#86868b]">
          <span className="font-semibold text-[var(--foreground)]">
            Step {Math.max(0, currentStep + 1)}
          </span>
          <span>/</span>
          <span>{Math.max(1, totalSteps)}</span>
        </div>

        {presets && presets.length > 0 && onSelectPreset && (
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-black/[0.08] dark:border-white/[0.08]">
            <span className="text-[11px] text-[#86868b] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0071e3]" />
              Presets:
            </span>
            <div className="flex items-center gap-1">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    sound.click();
                    onSelectPreset(p.value);
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#0071e3]/10 hover:text-[#0071e3] transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center: Playback Steppers */}
      <div className="flex items-center gap-2 mx-auto sm:mx-0">
        <button
          onClick={() => {
            sound.click();
            onReset();
          }}
          className="p-2.5 rounded-full text-[#86868b] hover:text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
          title="Reset Simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sound.click();
            onPrev();
          }}
          disabled={!canStepPrev || currentStep <= 0}
          className="px-3.5 py-2 rounded-full text-xs font-medium text-[var(--foreground)] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            onPlayPause();
          }}
          className="px-5 py-2 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-black dark:hover:bg-[#f5f5f7] active:scale-95 transition-all shadow cursor-pointer flex items-center gap-1.5"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            sound.step();
            onNext();
          }}
          disabled={!canStepNext || currentStep >= totalSteps - 1}
          className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Speed & Custom Input */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] rounded-full p-0.5">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.click();
                onSpeedChange(s);
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors cursor-pointer ${
                playbackSpeed === s
                  ? 'bg-white dark:bg-[#2c2c2e] text-[var(--foreground)] font-bold shadow-xs'
                  : 'text-[#86868b] hover:text-[var(--foreground)]'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {onOpenCustomInput && (
          <button
            onClick={() => {
              sound.click();
              onOpenCustomInput();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3]/15 transition-colors cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span>Custom</span>
          </button>
        )}
      </div>
    </div>
  );
}
