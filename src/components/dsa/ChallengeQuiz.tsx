'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/types/dsa';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '@/lib/sound';
import { HelpCircle, Check, X, ArrowRight, RotateCcw } from 'lucide-react';

interface ChallengeQuizProps {
  questions: QuizQuestion[];
  unitTitle: string;
}

export function ChallengeQuiz({ questions, unitTitle }: ChallengeQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  if (!questions || questions.length === 0) return null;

  const q = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (q.options[idx].isCorrect) {
      sound.success();
    } else {
      sound.fault();
    }
  };

  const handleNext = () => {
    sound.click();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setCurrentIdx(0);
      setSelectedOpt(null);
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 flex flex-col gap-6 shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0071e3]" />
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#0071e3] font-bold">
              Whiteboard Prediction Challenge • {unitTitle}
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] tracking-tight">
              Question {currentIdx + 1} of {questions.length}: {q.title}
            </h3>
          </div>
        </div>

        <button
          onClick={() => {
            sound.click();
            setCurrentIdx(0);
            setSelectedOpt(null);
          }}
          className="p-2 text-[#86868b] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          title="Restart Challenges"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scenario / Question */}
      <div className="flex flex-col gap-2">
        {q.scenario && (
          <p className="text-xs sm:text-sm text-[#86868b] font-mono bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
            {q.scenario}
          </p>
        )}
        <p className="text-sm sm:text-base font-medium text-[var(--foreground)] leading-relaxed">
          {q.question}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {q.options.map((opt, idx) => {
          const isSelected = selectedOpt === idx;
          const hasAnswered = selectedOpt !== null;

          return (
            <button
              key={`quiz-opt-${idx}`}
              onClick={() => handleSelect(idx)}
              disabled={hasAnswered}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between min-h-[90px] transition-all cursor-pointer ${
                hasAnswered
                  ? opt.isCorrect
                    ? 'bg-[#34c759]/10 border-[#34c759] text-[var(--foreground)] shadow-xs font-medium'
                    : isSelected
                    ? 'bg-[#ff3b30]/10 border-[#ff3b30] text-[#ff3b30] font-medium'
                    : 'opacity-40 border-black/[0.06] dark:border-white/[0.06] text-[#86868b]'
                  : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:border-[#0071e3]/40 hover:shadow-xs active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-mono text-[#86868b]">Option {String.fromCharCode(65 + idx)}</span>
                {hasAnswered && opt.isCorrect && <Check className="w-4 h-4 text-[#34c759]" />}
                {hasAnswered && isSelected && !opt.isCorrect && <X className="w-4 h-4 text-[#ff3b30]" />}
              </div>
              <span className="text-xs sm:text-sm font-normal leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation & Next */}
      <AnimatePresence>
        {selectedOpt !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"
          >
            <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed text-center sm:text-left">
              <strong className={q.options[selectedOpt].isCorrect ? 'text-[#34c759]' : 'text-[#ff3b30]'}>
                {q.options[selectedOpt].isCorrect ? 'Correct! ' : 'Incorrect. '}
              </strong>
              {q.options[selectedOpt].explanation}
            </p>

            <button
              onClick={handleNext}
              className="flex-shrink-0 px-5 py-2 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-black dark:hover:bg-[#f5f5f7] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>{currentIdx === questions.length - 1 ? 'Restart Challenge' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
