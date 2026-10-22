'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { simulateFIFO, simulateLRU, PRESETS, SimulationResult } from '@/lib/pageReplacement';
import { sound } from '@/lib/sound';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export function StoryComparison() {
  // Use divergence preset: [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2]
  const divergencePreset = PRESETS.find((p) => p.id === 'divergence') || PRESETS[2];

  const referenceString = divergencePreset.referenceString;
  const frameCount = 3;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  // Both simulations synchronously
  const fifoResult: SimulationResult = useMemo(
    () => simulateFIFO(referenceString, frameCount),
    [referenceString, frameCount]
  );

  const lruResult: SimulationResult = useMemo(
    () => simulateLRU(referenceString, frameCount),
    [referenceString, frameCount]
  );

  const currentFifoStep =
    currentStepIndex >= 0 && currentStepIndex < fifoResult.steps.length
      ? fifoResult.steps[currentStepIndex]
      : null;

  const currentLruStep =
    currentStepIndex >= 0 && currentStepIndex < lruResult.steps.length
      ? lruResult.steps[currentStepIndex]
      : null;

  // Divergence check
  const isDivergent = useMemo(() => {
    if (!currentFifoStep || !currentLruStep) return false;
    if (currentFifoStep.isHit !== currentLruStep.isHit) return true;
    if (currentFifoStep.evictedPage !== currentLruStep.evictedPage) return true;
    return false;
  }, [currentFifoStep, currentLruStep]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < referenceString.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      sound.click();
    }
  }, [currentStepIndex, referenceString.length]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      sound.click();
    } else if (currentStepIndex === 0) {
      setCurrentStepIndex(-1);
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    setCurrentStepIndex(-1);
    sound.click();
  }, []);

  const displayFifoFrames = currentFifoStep
    ? currentFifoStep.frames
    : Array(frameCount).fill(null);

  const displayLruFrames = currentLruStep
    ? currentLruStep.frames
    : Array(frameCount).fill(null);

  return (
    <section className="min-h-[100dvh] w-full flex flex-col justify-between items-center p-6 sm:p-12 md:p-16 max-w-6xl mx-auto select-none">
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#0071e3]">
          Synchronous Face-Off
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--foreground)]">
          Same sequence. Different decisions.
        </h2>
        <p className="text-base sm:text-xl text-[#86868b] font-normal max-w-xl">
          Watch both algorithms process the identical reference string side by side.
        </p>
      </div>

      {/* Main Dual Stage */}
      <div className="w-full flex flex-col items-center gap-6 my-auto py-2">
        {/* Overhead Timeline */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1 max-w-2xl w-full no-scrollbar">
            {referenceString.map((page, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;

              return (
                <button
                  key={`comp-timeline-${idx}`}
                  onClick={() => {
                    sound.click();
                    setCurrentStepIndex(idx);
                  }}
                  className={`flex-shrink-0 w-11 h-14 sm:w-12 sm:h-15 rounded-2xl flex flex-col items-center justify-center font-mono transition-all duration-200 active:scale-95 cursor-pointer ${
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
        </div>

        {/* Divergence Notification Banner */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isDivergent && currentFifoStep && currentLruStep ? (
              <motion.div
                key="divergence-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-xs font-mono font-semibold"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Divergence at Step #{currentStepIndex + 1}! FIFO evicts Page {currentFifoStep.evictedPage}{' '}
                  (arrived first), while LRU evicts Page {currentLruStep.evictedPage} (idle longest).
                </span>
              </motion.div>
            ) : (
              <span className="text-xs font-mono text-[#86868b]">
                {currentStepIndex >= 0
                  ? 'Both algorithms agree on this step.'
                  : 'Step forward to compare real-time decisions.'}
              </span>
            )}
          </AnimatePresence>
        </div>

        {/* Dual Memory Systems */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* FIFO Tower (Left) */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.1] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
                <h3 className="font-semibold text-lg text-[var(--foreground)]">FIFO</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#ff3b30]">
                  Faults: <strong>{currentFifoStep?.pageFaultCount ?? 0}</strong>
                </span>
                <span className="text-[#34c759]">
                  Hits: <strong>{currentFifoStep?.pageHitCount ?? 0}</strong>
                </span>
              </div>
            </div>

            {/* FIFO Memory Slots */}
            <div className="grid grid-cols-3 gap-3">
              {displayFifoFrames.map((pageNumber, frameIdx) => {
                const isHit = currentFifoStep?.isHit && currentFifoStep?.hitIndex === frameIdx;
                const isEvicted = currentFifoStep?.evictedFrameIndex === frameIdx && !currentFifoStep?.isHit;

                return (
                  <div
                    key={`fifo-tower-${frameIdx}`}
                    className={`h-32 rounded-2xl memory-frame-slot p-2 flex flex-col justify-between items-center transition-all ${
                      isHit
                        ? 'border-[#34c759] bg-[#34c759]/5'
                        : isEvicted
                        ? 'border-[#ff3b30] bg-[#ff3b30]/5'
                        : ''
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#86868b]">F{frameIdx + 1}</span>
                    <span className="text-2xl font-semibold font-mono text-[var(--foreground)] my-auto">
                      {pageNumber ?? '—'}
                    </span>
                    <span className="text-[9px] font-mono text-[#86868b]">
                      {pageNumber !== null ? 'Resident' : 'Empty'}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[#86868b] min-h-[36px] font-normal leading-relaxed">
              {currentFifoStep ? currentFifoStep.explanation.description : 'Awaiting start.'}
            </p>
          </div>

          {/* LRU Tower (Right) */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.1] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34c759]" />
                <h3 className="font-semibold text-lg text-[var(--foreground)]">LRU</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#ff3b30]">
                  Faults: <strong>{currentLruStep?.pageFaultCount ?? 0}</strong>
                </span>
                <span className="text-[#34c759]">
                  Hits: <strong>{currentLruStep?.pageHitCount ?? 0}</strong>
                </span>
              </div>
            </div>

            {/* LRU Memory Slots */}
            <div className="grid grid-cols-3 gap-3">
              {displayLruFrames.map((pageNumber, frameIdx) => {
                const isHit = currentLruStep?.isHit && currentLruStep?.hitIndex === frameIdx;
                const isEvicted = currentLruStep?.evictedFrameIndex === frameIdx && !currentLruStep?.isHit;

                return (
                  <div
                    key={`lru-tower-${frameIdx}`}
                    className={`h-32 rounded-2xl memory-frame-slot p-2 flex flex-col justify-between items-center transition-all ${
                      isHit
                        ? 'border-[#34c759] bg-[#34c759]/5'
                        : isEvicted
                        ? 'border-[#ff3b30] bg-[#ff3b30]/5'
                        : ''
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#86868b]">F{frameIdx + 1}</span>
                    <span className="text-2xl font-semibold font-mono text-[var(--foreground)] my-auto">
                      {pageNumber ?? '—'}
                    </span>
                    <span className="text-[9px] font-mono text-[#86868b]">
                      {pageNumber !== null ? 'Resident' : 'Empty'}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[#86868b] min-h-[36px] font-normal leading-relaxed">
              {currentLruStep ? currentLruStep.explanation.description : 'Awaiting start.'}
            </p>
          </div>
        </div>

        {/* Minimal Stepping Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStepIndex < 0}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-xs font-medium text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-30 transition-all cursor-pointer"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex >= referenceString.length - 1}
            className="px-6 py-2.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-black dark:hover:bg-[#f5f5f7] disabled:opacity-30 transition-all cursor-pointer shadow"
          >
            Step Both Algorithms →
          </button>
        </div>
      </div>

      <div className="h-4" />
    </section>
  );
}
