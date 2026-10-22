'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { simulateFIFO, SimulationResult, parseReferenceString } from '@/lib/pageReplacement';
import { sound } from '@/lib/sound';
import {
  RotateCcw,
  Play,
  Pause,
  Minus,
  Plus,
  AlertCircle,
} from 'lucide-react';

const CIRCLE_BADGES = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

export function StoryFIFO() {
  const [frameCount, setFrameCount] = useState<number>(3);
  const [referenceString, setReferenceString] = useState<number[]>([7, 0, 1, 2, 0, 3, 0, 4, 2, 3]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [inputString, setInputString] = useState<string>('7 0 1 2 0 3 0 4 2 3');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Run simulation engine
  const result: SimulationResult = useMemo(
    () => simulateFIFO(referenceString, frameCount),
    [referenceString, frameCount]
  );

  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < result.steps.length
      ? result.steps[currentStepIndex]
      : null;

  const handleNext = useCallback(() => {
    if (currentStepIndex < referenceString.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const stepData = result.steps[nextIdx];
      if (stepData.isHit) {
        sound.hit();
      } else if (stepData.evictedPage !== null) {
        sound.evict();
      } else {
        sound.fault();
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, referenceString.length, result.steps]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      sound.click();
    } else if (currentStepIndex === 0) {
      setCurrentStepIndex(-1);
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    sound.click();
  }, []);

  // Autoplay
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 1600 / playbackSpeed;
    const timer = setInterval(() => {
      if (!isPlayingRef.current) return;
      setCurrentStepIndex((prev) => {
        if (prev < referenceString.length - 1) {
          const next = prev + 1;
          const nextStep = result.steps[next];
          if (nextStep.isHit) sound.hit();
          else if (nextStep.evictedPage !== null) sound.evict();
          else sound.fault();
          return next;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, referenceString.length, result.steps]);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const { pages, error } = parseReferenceString(inputString);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg(null);
    setReferenceString(pages);
    setShowEditModal(false);
    handleReset();
  };

  const displayFrames = currentStep ? currentStep.frames : Array(frameCount).fill(null);
  const queue = currentStep ? currentStep.fifoOrder : [];

  return (
    <section className="min-h-[100dvh] w-full flex flex-col justify-between items-center p-6 sm:p-12 md:p-16 max-w-6xl mx-auto select-none">
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#0071e3]">
          Algorithm 01
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--foreground)]">
          FIFO: First-In, First-Out
        </h2>
        <p className="text-base sm:text-xl text-[#86868b] font-normal max-w-xl">
          Remove the page that entered physical memory first.
        </p>
      </div>

      {/* Main Immersive Visualization */}
      <div className="w-full flex flex-col items-center gap-8 my-auto py-4">
        {/* Horizontal Reference String Timeline */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full max-w-2xl px-2 text-xs font-mono text-[#86868b]">
            <span>Reference Stream ({referenceString.length} Pages)</span>
            <button
              onClick={() => {
                sound.click();
                setInputString(referenceString.join(' '));
                setShowEditModal(true);
              }}
              className="text-[#0071e3] hover:underline cursor-pointer"
            >
              Custom String
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1 max-w-2xl w-full no-scrollbar">
            {referenceString.map((page, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              const stepData = isPast ? result.steps[idx] : null;

              return (
                <button
                  key={`timeline-${idx}`}
                  onClick={() => {
                    sound.click();
                    setCurrentStepIndex(idx);
                  }}
                  className={`flex-shrink-0 w-11 h-14 sm:w-13 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono transition-all duration-200 active:scale-95 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0071e3] text-white shadow-lg scale-105'
                      : isPast
                      ? stepData?.isHit
                        ? 'bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/30'
                        : 'bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30'
                      : 'bg-[var(--card)] border border-[var(--border)] text-[#86868b] hover:text-[var(--foreground)]'
                  }`}
                >
                  <span className="text-[10px] opacity-60">#{idx + 1}</span>
                  <span className="text-base sm:text-lg font-semibold">{page}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Physical Memory Frames & FIFO Victim Indicator */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full px-2 text-xs font-mono text-[#86868b]">
            <span>Physical Memory Frames</span>
            {currentStep && (
              <span
                className={`font-semibold px-2.5 py-0.5 rounded-full ${
                  currentStep.isHit
                    ? 'bg-[#34c759]/15 text-[#34c759]'
                    : 'bg-[#ff3b30]/15 text-[#ff3b30]'
                }`}
              >
                {currentStep.isHit ? 'PAGE HIT' : 'PAGE FAULT'}
              </span>
            )}
          </div>

          {/* Machined slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {displayFrames.map((pageNumber, frameIdx) => {
              const isEmpty = pageNumber === null;
              const isHitFrame = currentStep?.isHit && currentStep?.hitIndex === frameIdx;
              const isEvictedSlot = currentStep?.evictedFrameIndex === frameIdx;
              const isOldestInQueue = currentStep && queue[0] === pageNumber;

              return (
                <div
                  key={`fifo-frame-${frameIdx}`}
                  className={`h-36 sm:h-40 rounded-3xl memory-frame-slot p-3 flex flex-col justify-between items-center transition-all duration-300 ${
                    isHitFrame
                      ? 'border-[#34c759] bg-[#34c759]/10'
                      : isEvictedSlot && !currentStep?.isHit
                      ? 'border-[#ff3b30] bg-[#ff3b30]/10'
                      : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#86868b]">
                    <span>F{frameIdx + 1}</span>
                    {isOldestInQueue && (
                      <span className="text-[9px] font-bold text-[#ff3b30] uppercase">
                        Oldest
                      </span>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {!isEmpty ? (
                      <motion.div
                        key={`page-${pageNumber}`}
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 25, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl page-tile flex flex-col items-center justify-center my-auto"
                      >
                        <span className="text-[10px] text-[#86868b] font-mono">Page</span>
                        <span className="text-2xl sm:text-3xl font-semibold font-mono text-[var(--tile-text)]">
                          {pageNumber}
                        </span>
                      </motion.div>
                    ) : (
                      <div className="my-auto text-xs text-[#86868b] font-mono opacity-50">
                        [ Empty ]
                      </div>
                    )}
                  </AnimatePresence>

                  <div className="text-[10px] font-mono text-[#86868b]">
                    {isEmpty ? 'Available' : 'Resident'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrival Order Ribbon: ① ② ③ */}
        {queue.length > 0 && (
          <div className="w-full max-w-xl flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs font-mono text-[#86868b]">
            <div className="flex items-center gap-2">
              <span className="text-[#ff3b30] font-semibold">Oldest (Next Victim):</span>
              <span className="font-bold text-[var(--foreground)]">Page {queue[0]}</span>
            </div>

            <div className="flex items-center gap-2">
              {queue.map((p, qIdx) => (
                <span
                  key={`q-order-${p}`}
                  className={`px-2 py-0.5 rounded-lg ${
                    qIdx === 0
                      ? 'bg-[#ff3b30]/15 text-[#ff3b30] font-bold'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)]'
                  }`}
                >
                  {p} {CIRCLE_BADGES[qIdx] || `#${qIdx + 1}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Concise One-Sentence Teacher Rationale */}
        <div className="w-full max-w-xl text-center">
          <p className="text-sm sm:text-base font-normal text-[var(--foreground)] leading-snug">
            {currentStep ? (
              <span>
                <strong className={currentStep.isHit ? 'text-[#34c759]' : 'text-[#ff3b30]'}>
                  {currentStep.isHit ? 'Page Hit: ' : 'Page Fault: '}
                </strong>
                {currentStep.explanation.description}
              </span>
            ) : (
              <span className="text-[#86868b]">
                Step forward to watch FIFO make arrival-based eviction choices.
              </span>
            )}
          </p>
        </div>

        {/* Elegant Minimal Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Frames Counter */}
          <div className="flex items-center rounded-full bg-[var(--card)] border border-[var(--border)] p-1 gap-1">
            <button
              onClick={() => {
                if (frameCount > 1) {
                  sound.click();
                  setFrameCount(frameCount - 1);
                  handleReset();
                }
              }}
              disabled={frameCount <= 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-14 text-center text-xs font-mono font-semibold text-[var(--foreground)]">
              {frameCount} Frames
            </span>
            <button
              onClick={() => {
                if (frameCount < 8) {
                  sound.click();
                  setFrameCount(frameCount + 1);
                  handleReset();
                }
              }}
              disabled={frameCount >= 8}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stepping controls */}
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStepIndex < 0}
            className="px-4 py-2.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-30 transition-all cursor-pointer"
          >
            Previous
          </button>

          <button
            onClick={() => {
              sound.click();
              setIsPlaying((p) => !p);
            }}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-black dark:hover:bg-[#f5f5f7] active:scale-95 transition-all shadow cursor-pointer"
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
            onClick={handleNext}
            disabled={currentStepIndex >= referenceString.length - 1}
            className="px-5 py-2.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-30 transition-all cursor-pointer shadow-sm"
          >
            Next Reference →
          </button>

          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full p-1 border border-[var(--border)]">
            {[1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono cursor-pointer ${playbackSpeed === s ? 'bg-white dark:bg-neutral-800 shadow-xs font-bold' : 'opacity-60'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Statistics */}
        <div className="flex items-center gap-6 text-xs font-mono text-[#86868b]">
          <span>
            Faults: <strong className="text-[#ff3b30]">{currentStep?.pageFaultCount ?? 0}</strong>
          </span>
          <span>•</span>
          <span>
            Hits: <strong className="text-[#34c759]">{currentStep?.pageHitCount ?? 0}</strong>
          </span>
          <span>•</span>
          <span>
            Fault Rate: <strong className="text-[var(--foreground)]">{currentStep?.faultRate ?? 0}%</strong>
          </span>
        </div>
      </div>

      {/* Custom String Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-[var(--border)] flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Custom Reference String
            </h3>
            <p className="text-xs text-[#86868b]">
              Enter page numbers separated by spaces or commas (e.g. 7 0 1 2 0 3):
            </p>

            <form onSubmit={handleApplyCustom} className="flex flex-col gap-3">
              <input
                type="text"
                value={inputString}
                onChange={(e) => {
                  setInputString(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-transparent text-[var(--foreground)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />

              {errorMsg && (
                <div className="text-xs text-[#ff3b30] font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs text-[#86868b] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-black dark:hover:bg-[#f5f5f7]"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="h-4" />
    </section>
  );
}
