'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { simulateFIFO } from '@/lib/pageReplacement';
import { sound } from '@/lib/sound';
import { AlertCircle, RotateCcw } from 'lucide-react';

const BELADY_STRING = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];

export function StoryBelady() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  // 3 frames FIFO
  const fifo3Result = useMemo(() => simulateFIFO(BELADY_STRING, 3), []);
  // 4 frames FIFO
  const fifo4Result = useMemo(() => simulateFIFO(BELADY_STRING, 4), []);

  const step3 = currentStepIndex >= 0 ? fifo3Result.steps[currentStepIndex] : null;
  const step4 = currentStepIndex >= 0 ? fifo4Result.steps[currentStepIndex] : null;

  const handleNext = () => {
    if (currentStepIndex < BELADY_STRING.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      sound.click();
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(-1);
    sound.click();
  };

  const isAnomalyStep = step3?.isHit && !step4?.isHit;

  return (
    <section className="min-h-[100dvh] w-full flex flex-col justify-between items-center p-6 sm:p-12 md:p-16 max-w-5xl mx-auto select-none">
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#ff3b30]">
          Algorithmic Paradox
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--foreground)]">
          More memory. <br className="hidden sm:inline" />
          More page faults?
        </h2>
        <p className="text-base sm:text-xl text-[#86868b] font-normal max-w-xl">
          Intuition suggests adding RAM always reduces page faults. Under FIFO, this assumption fails.
        </p>
      </div>

      {/* Main Belady Stage */}
      <div className="w-full flex flex-col items-center gap-6 my-auto py-2">
        {/* Sequence Ribbon */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 px-1 max-w-2xl w-full no-scrollbar">
          {BELADY_STRING.map((page, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;

            return (
              <button
                key={`belady-${idx}`}
                onClick={() => {
                  sound.click();
                  setCurrentStepIndex(idx);
                }}
                className={`flex-shrink-0 w-10 h-13 sm:w-11 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-mono transition-all duration-200 active:scale-95 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-lg scale-105'
                    : isPast
                    ? 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[var(--foreground)]'
                    : 'bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-[#86868b]'
                }`}
              >
                <span className="text-[9px] opacity-60">#{idx + 1}</span>
                <span className="text-base font-semibold">{page}</span>
              </button>
            );
          })}
        </div>

        {/* Anomaly Moment Banner */}
        <div className="h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isAnomalyStep ? (
              <motion.div
                key="anomaly-banner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-xs font-mono font-semibold"
              >
                <AlertCircle className="w-4 h-4" />
                <span>
                  Anomaly at Step #{currentStepIndex + 1}: 3 Frames HITS while 4 Frames FAULTS!
                </span>
              </motion.div>
            ) : (
              <span className="text-xs font-mono text-[#86868b]">
                Canonical Belady Sequence (1 2 3 4 1 2 5 1 2 3 4 5)
              </span>
            )}
          </AnimatePresence>
        </div>

        {/* Side-by-Side: 3 Frames vs 4 Frames */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* 3 Frames */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.1] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <h3 className="font-semibold text-base text-[var(--foreground)]">FIFO (3 Frames)</h3>
              <span className="text-xs font-mono text-[#ff3b30] font-semibold">
                Faults: {step3?.pageFaultCount ?? 0} / 9
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((fIdx) => (
                <div
                  key={`f3-${fIdx}`}
                  className="h-24 rounded-2xl memory-frame-slot p-2 flex flex-col items-center justify-center"
                >
                  <span className="text-xl font-semibold font-mono text-[var(--foreground)]">
                    {step3?.frames[fIdx] ?? '—'}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-[#86868b] text-center pt-1">
              Final result: <strong className="text-[var(--foreground)]">9 total page faults</strong>
            </div>
          </div>

          {/* 4 Frames */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.1] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <h3 className="font-semibold text-base text-[var(--foreground)]">
                FIFO (4 Frames — +1 Frame!)
              </h3>
              <span className="text-xs font-mono text-[#ff3b30] font-semibold">
                Faults: {step4?.pageFaultCount ?? 0} / 10
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((fIdx) => (
                <div
                  key={`f4-${fIdx}`}
                  className="h-24 rounded-2xl memory-frame-slot p-2 flex flex-col items-center justify-center"
                >
                  <span className="text-xl font-semibold font-mono text-[var(--foreground)]">
                    {step4?.frames[fIdx] ?? '—'}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-[#86868b] text-center pt-1">
              Final result: <strong className="text-[#ff3b30]">10 total page faults (+1 fault!)</strong>
            </div>
          </div>
        </div>

        {/* The Mathematical Reason (Stack Algorithm Property) */}
        <div className="w-full max-w-xl text-center flex flex-col gap-1.5 pt-2">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">
            Why does this occur?
          </h4>
          <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed font-normal">
            FIFO is not a <em>Stack Algorithm</em>. The set of pages resident in 3 frames is not guaranteed to be a subset of pages in 4 frames.
            In contrast, <strong>LRU is mathematically immune</strong> to Belady&apos;s anomaly because the most recently used pages always remain inside the larger memory set.
          </p>
        </div>

        {/* Stepping Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex >= BELADY_STRING.length - 1}
            className="px-6 py-2.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-black dark:hover:bg-[#f5f5f7] disabled:opacity-30 transition-all cursor-pointer shadow"
          >
            Step Through Sequence →
          </button>
        </div>
      </div>

      <div className="h-4" />
    </section>
  );
}
