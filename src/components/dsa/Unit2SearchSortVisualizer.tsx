'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  simulateLinearSearch,
  simulateBinarySearch,
  simulateBubbleSort,
  simulateSelectionSort,
  simulateInsertionSort,
  simulateQuickSort,
  simulateRadixSort,
  ALGO_COMPLEXITIES,
} from '@/lib/algorithms/searchingSorting';
import { C_CODE_SNIPPETS } from '@/lib/algorithms/cCodeSnippets';
import { UNIT_QUIZZES } from '@/data/quizData';
import { SimulationControls } from './SimulationControls';
import { ExplanationPanel } from './ExplanationPanel';
import { ComplexityCard } from './ComplexityCard';
import { CCodeViewer } from './CCodeViewer';
import { ChallengeQuiz } from './ChallengeQuiz';
import { sound } from '@/lib/sound';
import {
  Search,
  ArrowUpDown,
  Code2,
  HelpCircle,
  Activity,
  Shuffle,
  AlertTriangle,
} from 'lucide-react';

export function Unit2SearchSortVisualizer() {
  const [algoMode, setAlgoMode] = useState<
    'linear-search' | 'binary-search' | 'bubble-sort' | 'selection-sort' | 'insertion-sort' | 'quick-sort' | 'radix-sort' | 'compare'
  >('bubble-sort');

  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'complexity' | 'quiz'>('visual');

  // Array data
  const [arrayInput, setArrayInput] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [searchTarget, setSearchTarget] = useState<number>(22);
  const [customInputText, setCustomInputText] = useState<string>('64, 34, 25, 12, 22, 11, 90');
  const [showInputModal, setShowInputModal] = useState<boolean>(false);

  // Stepping State
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Run simulation
  const simulation = useMemo(() => {
    switch (algoMode) {
      case 'linear-search':
        return simulateLinearSearch(arrayInput, searchTarget);
      case 'binary-search':
        return simulateBinarySearch(arrayInput, searchTarget);
      case 'bubble-sort':
        return simulateBubbleSort(arrayInput);
      case 'selection-sort':
        return simulateSelectionSort(arrayInput);
      case 'insertion-sort':
        return simulateInsertionSort(arrayInput);
      case 'quick-sort':
        return simulateQuickSort(arrayInput);
      case 'radix-sort':
        return simulateRadixSort(arrayInput);
      default:
        return simulateBubbleSort(arrayInput);
    }
  }, [algoMode, arrayInput, searchTarget]);

  // Synchronous multi-algorithm comparison data
  const multiCompareData = useMemo(() => {
    if (algoMode !== 'compare') return null;
    const b = simulateBubbleSort(arrayInput);
    const s = simulateSelectionSort(arrayInput);
    const ins = simulateInsertionSort(arrayInput);
    const q = simulateQuickSort(arrayInput);
    return {
      bubble: { steps: b.steps, totalComps: b.steps[b.steps.length - 1].comparisonsCount, totalSwaps: b.steps[b.steps.length - 1].swapsCount },
      selection: { steps: s.steps, totalComps: s.steps[s.steps.length - 1].comparisonsCount, totalSwaps: s.steps[s.steps.length - 1].swapsCount },
      insertion: { steps: ins.steps, totalComps: ins.steps[ins.steps.length - 1].comparisonsCount, totalSwaps: ins.steps[ins.steps.length - 1].swapsCount },
      quick: { steps: q.steps, totalComps: q.steps[q.steps.length - 1].comparisonsCount, totalSwaps: q.steps[q.steps.length - 1].swapsCount },
    };
  }, [algoMode, arrayInput]);

  const steps = simulation.steps;
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [algoMode, arrayInput, searchTarget]);

  // Autoplay handler
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 1300 / playbackSpeed;
    const timer = setInterval(() => {
      if (!isPlayingRef.current) return;
      setStepIndex((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          const s = steps[next] as any;
          if (s.swappingIndices || s.swapsCount > (steps[prev] as any)?.swapsCount) {
            sound.swap();
          } else if (s.isTargetFound || s.isTerminal) {
            sound.success();
          } else {
            sound.compare();
          }
          return next;
        } else {
          sound.success();
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, steps]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      const s = steps[next] as any;
      if (s.swappingIndices) sound.swap();
      else if (s.isTargetFound) sound.success();
      else sound.compare();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const applyPreset = (preset: 'random' | 'nearly' | 'reverse' | 'sorted') => {
    sound.click();
    let newArr: number[] = [];
    if (preset === 'random') {
      newArr = Array.from({ length: 7 }, () => Math.floor(Math.random() * 89) + 10);
    } else if (preset === 'sorted') {
      newArr = [12, 23, 34, 45, 56, 67, 78];
    } else if (preset === 'nearly') {
      newArr = [10, 20, 25, 40, 35, 50, 60];
    } else if (preset === 'reverse') {
      newArr = [90, 80, 70, 60, 50, 40, 30];
    }
    setArrayInput(newArr);
    setCustomInputText(newArr.join(', '));
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    sound.click();
    const parsed = customInputText
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n) && n >= 0 && n <= 999);
    if (parsed.length >= 2) {
      setArrayInput(parsed.slice(0, 12));
    }
    setShowInputModal(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 my-auto py-6">
      {/* Algorithm Mode Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-1 px-2 border-r border-black/[0.08] dark:border-white/[0.08]">
          <Search className="w-3.5 h-3.5 text-[#0071e3]" />
          <span className="text-[10px] font-mono uppercase text-[#86868b] font-bold">Search:</span>
        </div>

        {(['linear-search', 'binary-search'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              sound.click();
              setAlgoMode(m);
              if (m === 'binary-search') {
                // Ensure sorted for clean binary search
                const sorted = [...arrayInput].sort((a, b) => a - b);
                setArrayInput(sorted);
                setCustomInputText(sorted.join(', '));
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
              algoMode === m
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-[#86868b] hover:text-[var(--foreground)]'
            }`}
          >
            {m.replace('-', ' ')}
          </button>
        ))}

        <div className="flex items-center gap-1 px-2 border-r border-l border-black/[0.08] dark:border-white/[0.08]">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#34c759]" />
          <span className="text-[10px] font-mono uppercase text-[#86868b] font-bold">Sort:</span>
        </div>

        {(['bubble-sort', 'selection-sort', 'insertion-sort', 'quick-sort', 'radix-sort', 'compare'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              sound.click();
              setAlgoMode(m);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
              algoMode === m
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs font-bold'
                : 'text-[#86868b] hover:text-[var(--foreground)]'
            }`}
          >
            {m.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Main Visual Stage (Single Algorithm) */}
      {algoMode !== 'compare' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          {/* Target input for searching */}
          {(algoMode === 'linear-search' || algoMode === 'binary-search') && (
            <div className="flex items-center justify-between w-full max-w-xl px-4 py-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
              <span className="font-mono text-[#86868b]">Search Target:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(Number(e.target.value))}
                  className="w-20 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-center font-bold"
                />
                <button
                  onClick={() => sound.click()}
                  className="px-3 py-1 rounded-full bg-[#0071e3] text-white text-xs font-medium cursor-pointer"
                >
                  Set Target
                </button>
              </div>
            </div>
          )}

          {/* Warning for Binary search if unsorted */}
          {algoMode === 'binary-search' && !(simulation as any).isSorted && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff9500]/10 border border-[#ff9500]/30 text-xs text-[#ff9500] max-w-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Precondition warning: Binary search requires a sorted array. Results may be inaccurate.
              </span>
            </div>
          )}

          {/* Array Element Blocks */}
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full text-xs font-mono text-[#86868b]">
              <span>Array Elements ({arrayInput.length} items)</span>
              <div className="flex items-center gap-3">
                <span>
                  Comparisons: <strong className="text-[var(--foreground)]">{(currentStep as any).comparisonsCount ?? 0}</strong>
                </span>
                {(currentStep as any).swapsCount !== undefined && (
                  <span>
                    Swaps / Shifts: <strong className="text-[#0071e3]">{(currentStep as any).swapsCount}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Blocks Row */}
            <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4 min-h-[160px] py-4 w-full">
              {((currentStep as any).array || arrayInput).map((val: number, idx: number) => {
                const isComparing = (currentStep as any).comparingIndices?.includes(idx);
                const isSwapping = (currentStep as any).swappingIndices?.includes(idx);
                const isSorted = (currentStep as any).sortedIndices?.includes(idx);
                const isPivot = (currentStep as any).pivotIndex === idx;
                const isEliminated = (currentStep as any).eliminatedIndices?.includes(idx);
                const isTargetMatch = (currentStep as any).foundIndex === idx;
                const isMid = (currentStep as any).mid === idx;
                const isLow = (currentStep as any).low === idx;
                const isHigh = (currentStep as any).high === idx;

                const maxVal = Math.max(...arrayInput, 100);
                const heightPct = Math.max(30, Math.min(100, (val / maxVal) * 100));

                return (
                  <motion.div
                    key={`item-${idx}`}
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    {/* Top pointers */}
                    <div className="h-5 flex items-center justify-center text-[10px] font-mono font-bold">
                      {isTargetMatch ? (
                        <span className="text-[#34c759]">TARGET</span>
                      ) : isPivot ? (
                        <span className="text-[#ff9500]">PIVOT</span>
                      ) : isMid ? (
                        <span className="text-[#0071e3]">MID</span>
                      ) : isLow ? (
                        <span className="text-[#86868b]">LOW</span>
                      ) : isHigh ? (
                        <span className="text-[#86868b]">HIGH</span>
                      ) : null}
                    </div>

                    {/* Tangible Block */}
                    <div
                      style={{ height: `${Math.round(heightPct * 1.2)}px` }}
                      className={`w-12 sm:w-14 rounded-2xl flex flex-col justify-between items-center p-2 font-mono border transition-all duration-200 ${
                        isTargetMatch
                          ? 'bg-[#34c759] text-white border-[#34c759] scale-110 shadow-lg'
                          : isSwapping
                          ? 'bg-[#ff9500] text-white border-[#ff9500] scale-105 shadow-md'
                          : isComparing
                          ? 'bg-[#0071e3] text-white border-[#0071e3] scale-105 shadow-md'
                          : isSorted
                          ? 'bg-[#34c759]/15 text-[#34c759] border-[#34c759]/40'
                          : isEliminated
                          ? 'opacity-25 bg-black/[0.04] dark:bg-white/[0.04] border-transparent'
                          : 'page-tile text-[var(--tile-text)]'
                      }`}
                    >
                      <span className="text-[10px] opacity-70">[{idx}]</span>
                      <span className="text-lg font-bold">{val}</span>
                      <span className="text-[9px] opacity-50">val</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Radix Buckets Visualizer */}
            {(currentStep as any).bucketState && (
              <div className="w-full flex flex-col gap-2 pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-xs font-mono text-[#86868b]">
                  LSD Digit Buckets (Pass: {(currentStep as any).bucketState.digit}s place)
                </span>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {(currentStep as any).bucketState.buckets.map((b: number[], d: number) => (
                    <div
                      key={`bucket-${d}`}
                      className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-1"
                    >
                      <span className="text-[10px] font-mono font-bold text-[#0071e3]">B{d}</span>
                      <div className="flex flex-col gap-1 w-full text-center">
                        {b.length > 0 ? (
                          b.map((v, i) => (
                            <span key={i} className="text-xs font-mono font-semibold bg-[#0071e3]/10 text-[#0071e3] rounded px-1">
                              {v}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-[#86868b] opacity-40">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Synchronized Multi-Algorithm Comparison Stage */}
      {algoMode === 'compare' && multiCompareData && (
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  Side-by-Side Synchronized Algorithm Comparison
                </h3>
                <p className="text-xs text-[#86868b]">
                  Running 4 algorithms concurrently on identical array: [{arrayInput.join(', ')}]
                </p>
              </div>
              <button
                onClick={() => applyPreset('random')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] transition-colors cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Randomize Input</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { name: 'Bubble Sort', metric: multiCompareData.bubble, color: '#0071e3', oTime: 'O(n²)' },
                { name: 'Selection Sort', metric: multiCompareData.selection, color: '#34c759', oTime: 'O(n²)' },
                { name: 'Insertion Sort', metric: multiCompareData.insertion, color: '#ff9500', oTime: 'O(n²) / O(n)' },
                { name: 'Quick Sort', metric: multiCompareData.quick, color: '#5856d6', oTime: 'O(n log n)' },
              ].map((alg) => (
                <div
                  key={alg.name}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--foreground)]">{alg.name}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: alg.color }}>
                      {alg.oTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                      <span className="text-[#86868b] block text-[10px]">Comparisons</span>
                      <span className="text-base font-bold text-[var(--foreground)]">
                        {alg.metric.totalComps}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                      <span className="text-[#86868b] block text-[10px]">Swaps / Writes</span>
                      <span className="text-base font-bold" style={{ color: alg.color }}>
                        {alg.metric.totalSwaps}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls & Presets */}
      {algoMode !== 'compare' && (
        <SimulationControls
          currentStep={stepIndex}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={handleNext}
          onPrev={handlePrev}
          onReset={handleReset}
          onSpeedChange={(s) => setPlaybackSpeed(s)}
          presets={[
            { label: 'Random', value: 'random' },
            { label: 'Nearly Sorted', value: 'nearly' },
            { label: 'Reverse', value: 'reverse' },
            { label: 'Sorted', value: 'sorted' },
          ]}
          onSelectPreset={(val) => applyPreset(val as any)}
          onOpenCustomInput={() => setShowInputModal(true)}
        />
      )}

      {/* Explanation Panel */}
      {algoMode !== 'compare' && currentStep && (
        <ExplanationPanel
          title={currentStep.title}
          description={currentStep.description}
          rationale={currentStep.rationale}
          activePointers={currentStep.activePointers}
          statusBadge={algoMode.replace('-', ' ').toUpperCase()}
          statusColor="blue"
        />
      )}

      {/* Tabs: Visual, C Code, Complexity, Quiz */}
      <div className="flex items-center gap-2 p-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs font-medium">
        <button
          onClick={() => {
            sound.click();
            setActiveTab('visual');
          }}
          className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
            activeTab === 'visual'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          Visualizer
        </button>

        <button
          onClick={() => {
            sound.click();
            setActiveTab('complexity');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
            activeTab === 'complexity'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Complexity</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setActiveTab('code');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
            activeTab === 'code'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>C Code</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setActiveTab('quiz');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Challenge</span>
        </button>
      </div>

      {activeTab === 'complexity' && ALGO_COMPLEXITIES[algoMode] && (
        <ComplexityCard
          algorithmName={algoMode.replace('-', ' ').toUpperCase()}
          complexity={ALGO_COMPLEXITIES[algoMode]}
        />
      )}

      {activeTab === 'code' && (
        <CCodeViewer
          snippet={C_CODE_SNIPPETS[algoMode] || C_CODE_SNIPPETS['bubble-sort']}
          activeLine={currentStep?.codeLine}
        />
      )}

      {activeTab === 'quiz' && (
        <ChallengeQuiz
          questions={UNIT_QUIZZES['unit-2']}
          unitTitle="Unit II: Searching & Sorting"
        />
      )}

      {/* Custom Input Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--border)] flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Custom Array Input
            </h3>
            <p className="text-xs text-[#86868b]">
              Enter up to 12 integers separated by commas or spaces:
            </p>
            <form onSubmit={handleApplyCustom} className="flex flex-col gap-3">
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] font-mono text-sm bg-transparent"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="px-4 py-1.5 text-xs text-[#86868b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
