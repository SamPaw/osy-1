'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '@/lib/sound';

interface QuizItem {
  id: number;
  title: string;
  scenario: string;
  frames: number[];
  nextRequest: number;
  historyNote: string;
  algorithm: 'FIFO' | 'LRU';
  options: {
    label: string;
    page: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: 1,
    title: 'FIFO Replacement',
    scenario: 'Three physical frames contain pages [1, 2, 3] in arrival order (Page 1 arrived first, then 2, then 3).',
    frames: [1, 2, 3],
    nextRequest: 4,
    historyNote: 'Incoming CPU reference is Page 4. Which page does FIFO evict?',
    algorithm: 'FIFO',
    options: [
      {
        label: 'Evict Page 1',
        page: 1,
        isCorrect: true,
        explanation: 'Correct! Page 1 entered physical memory earliest, so FIFO selects it as the victim.',
      },
      {
        label: 'Evict Page 2',
        page: 2,
        isCorrect: false,
        explanation: 'Incorrect. Page 2 arrived after Page 1.',
      },
      {
        label: 'Evict Page 3',
        page: 3,
        isCorrect: false,
        explanation: 'Incorrect. Page 3 is the newest page in memory.',
      },
    ],
  },
  {
    id: 2,
    title: 'LRU Recency Decision',
    scenario: 'Three physical frames hold pages [1, 2, 3]. Access history reveals: Page 1 used 1 step ago, Page 3 used 2 steps ago, Page 2 used 5 steps ago.',
    frames: [1, 2, 3],
    nextRequest: 4,
    historyNote: 'Incoming reference is Page 4. Which page does LRU evict?',
    algorithm: 'LRU',
    options: [
      {
        label: 'Evict Page 1',
        page: 1,
        isCorrect: false,
        explanation: 'Incorrect. Page 1 was accessed just 1 step ago (Most Recently Used).',
      },
      {
        label: 'Evict Page 2',
        page: 2,
        isCorrect: true,
        explanation: 'Correct! Page 2 has been idle for 5 steps — the longest unreferenced duration.',
      },
      {
        label: 'Evict Page 3',
        page: 3,
        isCorrect: false,
        explanation: 'Incorrect. Page 3 was used 2 steps ago, which is more recent than Page 2.',
      },
    ],
  },
  {
    id: 3,
    title: 'Page Hit Recognition',
    scenario: 'Physical frames currently hold pages [2, 0, 3]. The CPU requests Page 0.',
    frames: [2, 0, 3],
    nextRequest: 0,
    historyNote: 'What action does the operating system take?',
    algorithm: 'LRU',
    options: [
      {
        label: 'Page Fault: Evict Page 2',
        page: 2,
        isCorrect: false,
        explanation: 'Incorrect. Page 0 is ALREADY loaded in memory frame 2.',
      },
      {
        label: 'Page Hit: No Eviction',
        page: 0,
        isCorrect: true,
        explanation: 'Correct! Page 0 is already in RAM. Access occurs at hardware speed, and its recency timestamp is refreshed.',
      },
      {
        label: 'Page Fault: Evict Page 3',
        page: 3,
        isCorrect: false,
        explanation: 'Incorrect. Page 0 is already resident in Frame 2.',
      },
    ],
  },
];

export function StoryQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const q = QUIZ_ITEMS[currentIdx];

  const handleSelect = (optIndex: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(optIndex);
    if (q.options[optIndex].isCorrect) {
      sound.hit();
    } else {
      sound.fault();
    }
  };

  const handleNext = () => {
    sound.click();
    if (currentIdx < QUIZ_ITEMS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setCurrentIdx(0);
      setSelectedOpt(null);
    }
  };

  return (
    <section className="min-h-[100dvh] w-full flex flex-col justify-between items-center p-6 sm:p-12 md:p-16 max-w-4xl mx-auto select-none">
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#0071e3]">
          Interactive Whiteboard Check
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--foreground)]">
          Put your intuition to the test.
        </h2>
        <p className="text-base sm:text-xl text-[#86868b] font-normal max-w-xl">
          Tap an option on the smartboard to watch the physical memory frames respond.
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full flex flex-col items-center gap-8 my-auto py-4">
        {/* Scenario description */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.1] shadow-sm flex flex-col items-center text-center gap-4 w-full transition-colors duration-300">
          <span className="text-xs font-mono uppercase tracking-wider text-[#0071e3] font-semibold">
            Challenge {currentIdx + 1} of {QUIZ_ITEMS.length}: {q.title}
          </span>
          <p className="text-base sm:text-lg text-[var(--foreground)] font-normal max-w-xl leading-relaxed">
            {q.scenario}
          </p>

          {/* Memory Frames Visualization */}
          <div className="flex items-center justify-center gap-3 my-2">
            {q.frames.map((pageVal, fIdx) => (
              <div
                key={`q-frame-${fIdx}`}
                className="w-20 h-24 rounded-2xl memory-frame-slot p-2 flex flex-col justify-between items-center"
              >
                <span className="text-[10px] font-mono text-[#86868b]">F{fIdx + 1}</span>
                <span className="text-2xl font-semibold font-mono text-[var(--foreground)] my-auto">
                  {pageVal}
                </span>
                <span className="text-[9px] font-mono text-[#86868b]">In RAM</span>
              </div>
            ))}

            <div className="flex items-center gap-2 pl-4 border-l border-black/[0.08] dark:border-white/[0.1]">
              <div className="w-20 h-24 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/30 p-2 flex flex-col justify-between items-center">
                <span className="text-[10px] font-mono text-[#0071e3]">Target</span>
                <span className="text-2xl font-semibold font-mono text-[#0071e3] my-auto">
                  {q.nextRequest}
                </span>
                <span className="text-[9px] font-mono text-[#0071e3]">Incoming</span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-mono text-[#86868b]">
            {q.historyNote}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {q.options.map((opt, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            const hasAnswered = selectedOpt !== null;

            return (
              <button
                key={`quiz-opt-${optIdx}`}
                onClick={() => handleSelect(optIdx)}
                disabled={hasAnswered}
                className={`p-4 rounded-2xl border text-center flex flex-col justify-center min-h-[75px] transition-all cursor-pointer ${
                  hasAnswered
                    ? opt.isCorrect
                      ? 'bg-[#34c759]/10 border-[#34c759] text-[var(--foreground)] shadow-sm'
                      : isSelected
                      ? 'bg-[#ff3b30]/10 border-[#ff3b30] text-[#ff3b30]'
                      : 'opacity-40 border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1c1c1e] text-[#86868b]'
                    : 'bg-white dark:bg-[#1c1c1e] border-black/[0.08] dark:border-white/[0.1] text-[var(--foreground)] hover:border-black/[0.2] dark:hover:border-white/[0.2] hover:shadow-sm active:scale-95'
                }`}
              >
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Explanation & Next */}
        <AnimatePresence>
          {selectedOpt !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.1] shadow-sm w-full transition-colors duration-300"
            >
              <p className="text-xs sm:text-sm text-[var(--foreground)] font-normal leading-relaxed text-center sm:text-left">
                <strong className={q.options[selectedOpt].isCorrect ? 'text-[#34c759]' : 'text-[#ff3b30]'}>
                  {q.options[selectedOpt].isCorrect ? 'Correct. ' : 'Incorrect. '}
                </strong>
                {q.options[selectedOpt].explanation}
              </p>

              <button
                onClick={handleNext}
                className="flex-shrink-0 px-6 py-2.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-black dark:hover:bg-[#f5f5f7] transition-all cursor-pointer shadow"
              >
                {currentIdx === QUIZ_ITEMS.length - 1 ? 'Restart Quiz' : 'Next Question →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-4" />
    </section>
  );
}
