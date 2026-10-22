'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  simulateArrayOperation,
  simulateStringFunction,
  simulateBitwise,
} from '@/lib/algorithms/arraysAndStrings';
import { COMPLEXITY_CLASSES } from '@/lib/algorithms/complexity';
import { C_CODE_SNIPPETS } from '@/lib/algorithms/cCodeSnippets';
import { UNIT_QUIZZES } from '@/data/quizData';
import { SimulationControls } from './SimulationControls';
import { ExplanationPanel } from './ExplanationPanel';
import { CCodeViewer } from './CCodeViewer';
import { ChallengeQuiz } from './ChallengeQuiz';
import { sound } from '@/lib/sound';
import {
  Database,
  Binary,
  Code2,
  HelpCircle,
  Activity,
  Type,
} from 'lucide-react';

export function Unit1IntroVisualizer() {
  const [subtopic, setSubtopic] = useState<'arrays' | 'strings' | 'bitwise' | 'complexity'>('arrays');
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'complexity' | 'quiz'>('visual');

  // Array Explorer State
  const [arrayData, setArrayData] = useState<number[]>([10, 20, 30, 40]);
  const [arrayCapacity] = useState<number>(8);
  const [arrayOp, setArrayOp] = useState<'traverse' | 'access' | 'insert' | 'delete'>('traverse');
  const [targetIndex, setTargetIndex] = useState<number>(1);
  const [insertValue, setInsertValue] = useState<number>(25);

  // String Lab State
  const [stringFn, setStringFn] = useState<'strlen' | 'strcmp' | 'strrev' | 'strupr' | 'strlwr'>('strlen');
  const [strInput1, setStrInput1] = useState<string>('STRUCTURE');
  const [strInput2, setStrInput2] = useState<string>('STUDENT');

  // Bitwise Playground State
  const [bitOp, setBitOp] = useState<'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT' | 'CHECK_BIT' | 'SET_BIT' | 'CLEAR_BIT' | 'TOGGLE_BIT' | 'ODD_EVEN'>('AND');
  const [bitValA, setBitValA] = useState<number>(42);
  const [bitValB, setBitValB] = useState<number>(15);
  const [bitTargetBit, setBitTargetBit] = useState<number>(3);

  // Complexity Visualizer Slider
  const [complexityN, setComplexityN] = useState<number>(16);

  // Stepping & Autoplay State
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Run simulation based on active subtopic
  const simulationData = useMemo(() => {
    if (subtopic === 'arrays') {
      return simulateArrayOperation(arrayData, arrayCapacity, arrayOp, {
        index: targetIndex,
        value: insertValue,
      });
    } else if (subtopic === 'strings') {
      return simulateStringFunction(stringFn, strInput1, strInput2);
    } else if (subtopic === 'bitwise') {
      return simulateBitwise(bitOp, bitValA, bitValB, bitTargetBit);
    }
    return { steps: [] };
  }, [subtopic, arrayData, arrayCapacity, arrayOp, targetIndex, insertValue, stringFn, strInput1, strInput2, bitOp, bitValA, bitValB, bitTargetBit]);

  const steps = simulationData.steps;
  const currentStep = steps[stepIndex] || steps[0];

  // Reset stepIndex on change of parameters
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [subtopic, arrayOp, stringFn, bitOp, bitValA, bitValB, bitTargetBit, targetIndex, insertValue, arrayData]);

  // Autoplay handler
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 1400 / playbackSpeed;
    const timer = setInterval(() => {
      if (!isPlayingRef.current) return;
      setStepIndex((prev) => {
        if (prev < steps.length - 1) {
          sound.step();
          return prev + 1;
        } else {
          sound.success();
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, steps.length]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
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

  return (
    <div className="w-full flex flex-col items-center gap-6 my-auto py-6">
      {/* Subtopic Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <button
          onClick={() => {
            sound.click();
            setSubtopic('arrays');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'arrays'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Array &amp; Memory Layout</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('strings');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'strings'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-[#34c759]" />
          <span>String Laboratory</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('bitwise');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'bitwise'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-[#ff9500]" />
          <span>Bitwise Playground</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('complexity');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'complexity'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#5856d6]" />
          <span>Complexity Explorer</span>
        </button>
      </div>

      {/* Main Visualization Canvas */}
      {subtopic === 'arrays' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          {/* Operations Bar */}
          <div className="flex flex-wrap items-center justify-between w-full gap-3 px-4 py-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#86868b] font-mono">Operation:</span>
              {(['traverse', 'access', 'insert', 'delete'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => {
                    sound.click();
                    setArrayOp(op);
                  }}
                  className={`px-3 py-1 rounded-full font-medium capitalize transition-colors cursor-pointer ${
                    arrayOp === op
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08]'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            {/* Parameters & Presets */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[#86868b] font-mono">Preset:</span>
                {[
                  [10, 20, 30, 40],
                  [5, 12, 19, 23, 42],
                  [8, 16, 32, 64],
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.click();
                      setArrayData(preset);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] cursor-pointer"
                  >
                    P{idx + 1}
                  </button>
                ))}
              </div>

              {(arrayOp === 'access' || arrayOp === 'insert' || arrayOp === 'delete') && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b] font-mono">Index:</span>
                  <select
                    value={targetIndex}
                    onChange={(e) => setTargetIndex(Number(e.target.value))}
                    className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs"
                  >
                    {Array.from({ length: arrayCapacity }, (_, i) => (
                      <option key={i} value={i}>
                        [{i}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {arrayOp === 'insert' && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b] font-mono">Val:</span>
                  <input
                    type="number"
                    value={insertValue}
                    onChange={(e) => setInsertValue(Number(e.target.value))}
                    className="w-16 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs text-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tangible Contiguous Array Memory Cells */}
          <div className="w-full flex flex-col gap-2 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#86868b] pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <span>Contiguous Physical RAM Cells (Base: 0x2000, 4 Bytes/Int)</span>
              <span>
                Active: {arrayData.length} / Capacity: {arrayCapacity}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-3">
              {(currentStep as any).cells?.map((cell: any) => {
                const isHighlight = cell.state === 'highlight';
                const isShift = cell.state === 'shift';
                const isInsert = cell.state === 'insert';
                const isDelete = cell.state === 'delete';

                return (
                  <motion.div
                    key={cell.index}
                    layout
                    className={`h-32 rounded-2xl memory-frame-slot p-2 flex flex-col justify-between items-center transition-all ${
                      isHighlight
                        ? 'border-[#0071e3] bg-[#0071e3]/10 ring-2 ring-[#0071e3]/30 scale-105'
                        : isShift
                        ? 'border-[#ff9500] bg-[#ff9500]/10 scale-95'
                        : isInsert
                        ? 'border-[#34c759] bg-[#34c759]/10'
                        : isDelete
                        ? 'border-[#ff3b30] bg-[#ff3b30]/10'
                        : ''
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#86868b]">
                      [{cell.index}]
                    </span>

                    <AnimatePresence mode="wait">
                      {cell.value !== null ? (
                        <motion.div
                          key={`val-${cell.value}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="w-12 h-12 rounded-xl page-tile flex items-center justify-center font-mono font-bold text-lg text-[var(--tile-text)] shadow-sm"
                        >
                          {cell.value}
                        </motion.div>
                      ) : (
                        <div className="text-[10px] font-mono text-[#86868b] opacity-40">
                          Empty
                        </div>
                      )}
                    </AnimatePresence>

                    <span className="text-[9px] font-mono text-[#86868b] truncate w-full text-center">
                      {cell.address}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subtopic === 'strings' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          {/* Function Selector & Inputs */}
          <div className="flex flex-wrap items-center justify-between w-full gap-3 px-4 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#86868b] font-mono">Function:</span>
              {(['strlen', 'strrev', 'strcmp', 'strupr', 'strlwr'] as const).map((fn) => (
                <button
                  key={fn}
                  onClick={() => {
                    sound.click();
                    setStringFn(fn);
                  }}
                  className={`px-3 py-1 rounded-full font-mono transition-colors cursor-pointer ${
                    stringFn === fn
                      ? 'bg-[#34c759] text-white font-bold'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08]'
                  }`}
                >
                  {fn}()
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={strInput1}
                onChange={(e) => setStrInput1(e.target.value.toUpperCase())}
                placeholder="String 1"
                maxLength={10}
                className="w-28 px-2.5 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs uppercase"
              />
              {stringFn === 'strcmp' && (
                <input
                  type="text"
                  value={strInput2}
                  onChange={(e) => setStrInput2(e.target.value.toUpperCase())}
                  placeholder="String 2"
                  maxLength={10}
                  className="w-28 px-2.5 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs uppercase"
                />
              )}
            </div>
          </div>

          {/* Visual String Character Array with Null Byte */}
          <div className="w-full flex flex-col gap-4 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#86868b]">
              <span>C-String In-Memory Layout (1 Byte/Char with &apos;\0&apos; Sentinel)</span>
              <span>Input 1: &quot;{strInput1}&quot;</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {(currentStep as any).str1Cells?.map((cell: any) => (
                <div
                  key={cell.index}
                  className={`w-14 h-24 rounded-xl border flex flex-col justify-between items-center p-2 font-mono transition-all ${
                    cell.isTerminator
                      ? 'bg-[#ff3b30]/10 border-[#ff3b30]/40 text-[#ff3b30]'
                      : cell.state === 'active'
                      ? 'bg-[#0071e3]/15 border-[#0071e3] scale-105 shadow-md'
                      : cell.state === 'swap'
                      ? 'bg-[#ff9500]/15 border-[#ff9500]'
                      : cell.state === 'done'
                      ? 'bg-[#34c759]/15 border-[#34c759]'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] border-[var(--border)]'
                  }`}
                >
                  <span className="text-[10px] text-[#86868b]">[{cell.index}]</span>
                  <span className="text-xl font-bold">{cell.char}</span>
                  <span className="text-[9px] text-[#86868b]">{cell.ascii}</span>
                </div>
              ))}
            </div>

            {(currentStep as any).str2Cells && (
              <div className="flex flex-col gap-2 pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-xs font-mono text-[#86868b]">Input 2: &quot;{strInput2}&quot;</span>
                <div className="flex flex-wrap items-center gap-2">
                  {(currentStep as any).str2Cells?.map((cell: any) => (
                    <div
                      key={cell.index}
                      className={`w-14 h-24 rounded-xl border flex flex-col justify-between items-center p-2 font-mono transition-all ${
                        cell.isTerminator
                          ? 'bg-[#ff3b30]/10 border-[#ff3b30]/40 text-[#ff3b30]'
                          : cell.state === 'active'
                          ? 'bg-[#0071e3]/15 border-[#0071e3] scale-105'
                          : 'bg-black/[0.02] dark:bg-white/[0.04] border-[var(--border)]'
                      }`}
                    >
                      <span className="text-[10px] text-[#86868b]">[{cell.index}]</span>
                      <span className="text-xl font-bold">{cell.char}</span>
                      <span className="text-[9px] text-[#86868b]">{cell.ascii}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subtopic === 'bitwise' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          {/* Bitwise Controls */}
          <div className="flex flex-wrap items-center justify-between w-full gap-3 px-4 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['AND', 'OR', 'XOR', 'NOT', 'LSHIFT', 'RSHIFT', 'CHECK_BIT', 'SET_BIT', 'CLEAR_BIT', 'TOGGLE_BIT', 'ODD_EVEN'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => {
                    sound.click();
                    setBitOp(op);
                  }}
                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] transition-colors cursor-pointer ${
                    bitOp === op
                      ? 'bg-[#ff9500] text-white font-bold'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08]'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[#86868b] font-mono">A:</span>
                <input
                  type="number"
                  value={bitValA}
                  onChange={(e) => setBitValA(Math.min(255, Math.max(0, Number(e.target.value))))}
                  className="w-14 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs text-center"
                />
              </div>

              {['AND', 'OR', 'XOR'].includes(bitOp) && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b] font-mono">B:</span>
                  <input
                    type="number"
                    value={bitValB}
                    onChange={(e) => setBitValB(Math.min(255, Math.max(0, Number(e.target.value))))}
                    className="w-14 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs text-center"
                  />
                </div>
              )}

              {['CHECK_BIT', 'SET_BIT', 'CLEAR_BIT', 'TOGGLE_BIT'].includes(bitOp) && (
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b] font-mono">Bit:</span>
                  <select
                    value={bitTargetBit}
                    onChange={(e) => setBitTargetBit(Number(e.target.value))}
                    className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                      <option key={b} value={b}>
                        Bit {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 8-bit Physical Register View */}
          <div className="w-full flex flex-col gap-6 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            {/* Register A */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-[#86868b]">
                <span>Register A (8-bit)</span>
                <span className="font-bold text-[var(--foreground)]">Decimal: {bitValA}</span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {(currentStep as any).registerA?.map((bit: any) => (
                  <div
                    key={`a-${bit.index}`}
                    className={`h-16 rounded-xl border flex flex-col justify-between items-center p-2 font-mono ${
                      bit.value === 1
                        ? 'bg-[#0071e3]/15 border-[#0071e3] text-[#0071e3] font-bold'
                        : 'bg-black/[0.02] dark:bg-white/[0.04] border-[var(--border)] text-[#86868b]'
                    }`}
                  >
                    <span className="text-[9px] opacity-60">b{bit.index}</span>
                    <span className="text-xl font-bold">{bit.value}</span>
                    <span className="text-[8px] opacity-60">{bit.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Register B (if applicable) */}
            {(currentStep as any).registerB && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#86868b]">
                  <span>Register B / Mask</span>
                  <span className="font-bold text-[var(--foreground)]">
                    Decimal: {(currentStep as any).decimalB}
                  </span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {(currentStep as any).registerB?.map((bit: any) => (
                    <div
                      key={`b-${bit.index}`}
                      className={`h-16 rounded-xl border flex flex-col justify-between items-center p-2 font-mono ${
                        bit.value === 1
                          ? 'bg-[#ff9500]/15 border-[#ff9500] text-[#ff9500] font-bold'
                          : 'bg-black/[0.02] dark:bg-white/[0.04] border-[var(--border)] text-[#86868b]'
                      }`}
                    >
                      <span className="text-[9px] opacity-60">b{bit.index}</span>
                      <span className="text-xl font-bold">{bit.value}</span>
                      <span className="text-[8px] opacity-60">{bit.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result Register */}
            <div className="flex flex-col gap-1.5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-mono text-[#86868b]">
                <span className="text-[#34c759] font-bold">ALU Result Register</span>
                <span className="font-bold text-[#34c759] text-base">
                  Decimal: {(currentStep as any).decimalResult}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {(currentStep as any).registerResult?.map((bit: any) => (
                  <div
                    key={`res-${bit.index}`}
                    className={`h-16 rounded-xl border flex flex-col justify-between items-center p-2 font-mono ${
                      bit.value === 1
                        ? 'bg-[#34c759]/20 border-[#34c759] text-[#34c759] font-bold scale-105 shadow-sm'
                        : 'bg-black/[0.02] dark:bg-white/[0.04] border-[var(--border)] text-[#86868b]'
                    }`}
                  >
                    <span className="text-[9px] opacity-60">b{bit.index}</span>
                    <span className="text-xl font-bold">{bit.value}</span>
                    <span className="text-[8px] opacity-60">{bit.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {subtopic === 'complexity' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          <div className="w-full p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Operation Count vs Input Size (N)
                </h3>
                <p className="text-xs text-[#86868b]">
                  Comparing theoretical operation counts as N scales from 1 to 128.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#86868b]">N = {complexityN}</span>
                <input
                  type="range"
                  min="2"
                  max="64"
                  step="2"
                  value={complexityN}
                  onChange={(e) => setComplexityN(Number(e.target.value))}
                  className="w-32 accent-[#0071e3] cursor-pointer"
                />
              </div>
            </div>

            {/* Visual Bars for N */}
            <div className="flex flex-col gap-3">
              {COMPLEXITY_CLASSES.map((cls) => {
                const ops = cls.calcOps(complexityN);
                const maxOps = complexityN * complexityN;
                const pct = Math.min(100, Math.max(3, (ops / maxOps) * 100));

                return (
                  <div key={cls.notation} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-16" style={{ color: cls.color }}>
                          {cls.notation}
                        </span>
                        <span className="text-[var(--foreground)]">{cls.name}</span>
                      </div>
                      <span className="font-bold text-[var(--foreground)]">
                        {ops.toLocaleString()} ops
                      </span>
                    </div>

                    <div className="h-3 w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cls.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: 'spring', damping: 20 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stepping Simulation Controls (for arrays, strings, bitwise) */}
      {subtopic !== 'complexity' && (
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
        />
      )}

      {/* Dynamic Explanation Panel */}
      {subtopic !== 'complexity' && currentStep && (
        <ExplanationPanel
          title={currentStep.title}
          description={currentStep.description}
          rationale={currentStep.rationale}
          activePointers={currentStep.activePointers}
          statusBadge={subtopic.toUpperCase()}
          statusColor="blue"
        />
      )}

      {/* Tab Switcher: Concept, C Code, Quiz */}
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
          Visual Stage
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
          <span>C Code Implementation</span>
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
          <span>Whiteboard Challenge</span>
        </button>
      </div>

      {/* Lower Tab Content */}
      {activeTab === 'code' && (
        <CCodeViewer
          snippet={
            subtopic === 'strings'
              ? C_CODE_SNIPPETS['string-functions']
              : subtopic === 'bitwise'
              ? C_CODE_SNIPPETS['bitwise-ops']
              : C_CODE_SNIPPETS['array-ops']
          }
          activeLine={currentStep?.codeLine}
        />
      )}

      {activeTab === 'quiz' && (
        <ChallengeQuiz
          questions={UNIT_QUIZZES['unit-1']}
          unitTitle="Unit I: Memory, Arrays, Strings & Bitwise"
        />
      )}
    </div>
  );
}
