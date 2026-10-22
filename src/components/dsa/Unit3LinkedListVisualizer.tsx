'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { simulateLinkedListOperation } from '@/lib/algorithms/linkedLists';
import { C_CODE_SNIPPETS } from '@/lib/algorithms/cCodeSnippets';
import { UNIT_QUIZZES } from '@/data/quizData';
import { SimulationControls } from './SimulationControls';
import { ExplanationPanel } from './ExplanationPanel';
import { CCodeViewer } from './CCodeViewer';
import { ChallengeQuiz } from './ChallengeQuiz';
import { sound } from '@/lib/sound';
import {
  Link,
  Repeat,
  ArrowRight,
  ArrowLeftRight,
  Code2,
  HelpCircle,
} from 'lucide-react';

export function Unit3LinkedListVisualizer() {
  const [listType, setListType] = useState<'singly' | 'circular' | 'doubly'>('singly');
  const [operation, setOperation] = useState<
    'insert_head' | 'insert_tail' | 'delete_head' | 'reverse' | 'search'
  >('insert_head');

  const [initialValues, setInitialValues] = useState<number[]>([10, 20, 30]);
  const [newValue, setNewValue] = useState<number>(42);
  const [targetSearch, setTargetSearch] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'quiz'>('visual');

  // Stepping State
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const simulation = useMemo(() => {
    return simulateLinkedListOperation(initialValues, listType, operation, {
      value: newValue,
      targetValue: targetSearch,
    });
  }, [initialValues, listType, operation, newValue, targetSearch]);

  const steps = simulation.steps;
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [listType, operation, initialValues, newValue, targetSearch]);

  // Autoplay handler
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 1500 / playbackSpeed;
    const timer = setInterval(() => {
      if (!isPlayingRef.current) return;
      setStepIndex((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          const s = steps[next];
          if (s.title.includes('Allocate')) sound.allocate();
          else if (s.title.includes('Reversal') || s.title.includes('Update')) sound.swap();
          else sound.step();
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
      const s = steps[next];
      if (s.title.includes('Allocate')) sound.allocate();
      else if (s.title.includes('Point') || s.title.includes('Reversal')) sound.swap();
      else sound.step();
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
      {/* List Type Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <button
          onClick={() => {
            sound.click();
            setListType('singly');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            listType === 'singly'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Link className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Singly Linked List</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setListType('circular');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            listType === 'circular'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Repeat className="w-3.5 h-3.5 text-[#34c759]" />
          <span>Circular Linked List</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setListType('doubly');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            listType === 'doubly'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#ff9500]" />
          <span>Doubly Linked List</span>
        </button>
      </div>

      {/* Main Visual Stage */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Operations Bar */}
        <div className="flex flex-wrap items-center justify-between w-full gap-3 px-4 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#86868b] font-mono">Action:</span>
            {[
              { id: 'insert_head', label: 'Insert Head' },
              { id: 'insert_tail', label: 'Insert Tail' },
              { id: 'delete_head', label: 'Delete Head' },
              { id: 'reverse', label: 'Reverse List' },
              { id: 'search', label: 'Search Key' },
            ].map((op) => (
              <button
                key={op.id}
                onClick={() => {
                  sound.click();
                  setOperation(op.id as any);
                }}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  operation === op.id
                    ? 'bg-[#0071e3] text-white font-bold'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08]'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* Parameters */}
          {(operation === 'insert_head' || operation === 'insert_tail') && (
            <div className="flex items-center gap-2">
              <span className="text-[#86868b] font-mono">Value:</span>
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
                className="w-16 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-center text-xs"
              />
            </div>
          )}

          {operation === 'search' && (
            <div className="flex items-center gap-2">
              <span className="text-[#86868b] font-mono">Target:</span>
              <input
                type="number"
                value={targetSearch}
                onChange={(e) => setTargetSearch(Number(e.target.value))}
                className="w-16 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-center text-xs"
              />
            </div>
          )}

          {/* Presets */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[#86868b] font-mono">Preset:</span>
            {[
              [10, 20, 30],
              [5, 15, 25, 35],
              [100, 200],
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.click();
                  setInitialValues(preset);
                }}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] cursor-pointer"
              >
                P{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Nodes Canvas */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between text-xs font-mono text-[#86868b]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#0071e3]/10 text-[#0071e3] font-bold">
                HEAD → {currentStep.headAddress ?? 'NULL'}
              </span>
              <span>•</span>
              <span>Heap Dynamic Allocation (sizeof(struct Node) = 16 bytes)</span>
            </div>
            <span>Nodes: {currentStep.nodes.length}</span>
          </div>

          {/* Animated Linked Nodes Stream */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 min-h-[160px] py-4 w-full">
            {currentStep.nodes.length === 0 ? (
              <div className="text-sm font-mono text-[#86868b] p-6 text-center">
                List is Empty (HEAD == NULL)
              </div>
            ) : (
              currentStep.nodes.map((node, idx) => {
                const isHead = currentStep.headAddress === node.address;
                const isAllocating = node.state === 'allocating';
                const isRelinking = node.state === 'relinking';
                const isDeleted = node.state === 'deleted';
                const isFound = node.state === 'found';
                const isActive = currentStep.activeNodeId === node.id;

                return (
                  <React.Fragment key={node.id}>
                    <motion.div
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className={`relative w-28 sm:w-32 rounded-2xl border p-2.5 flex flex-col gap-1.5 font-mono shadow-sm transition-all ${
                        isFound
                          ? 'bg-[#34c759]/15 border-[#34c759] ring-2 ring-[#34c759]/40 scale-105'
                          : isAllocating
                          ? 'bg-[#0071e3]/15 border-[#0071e3] ring-2 ring-[#0071e3]/40 animate-pulse'
                          : isRelinking
                          ? 'bg-[#ff9500]/15 border-[#ff9500] ring-2 ring-[#ff9500]/40'
                          : isDeleted
                          ? 'bg-[#ff3b30]/15 border-[#ff3b30] opacity-50'
                          : isActive
                          ? 'bg-[#0071e3]/10 border-[#0071e3]'
                          : 'bg-black/[0.02] dark:bg-white/[0.04] border-[var(--border)]'
                      }`}
                    >
                      {/* Node Address Badge */}
                      <div className="flex items-center justify-between text-[9px] text-[#86868b]">
                        <span className="truncate">{node.address}</span>
                        {isHead && (
                          <span className="text-[#0071e3] font-bold uppercase text-[8px] px-1 rounded bg-[#0071e3]/15">
                            HEAD
                          </span>
                        )}
                      </div>

                      {/* Data & Next Compartments */}
                      <div className="grid grid-cols-2 gap-1 my-1">
                        <div className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col items-center justify-center">
                          <span className="text-[8px] text-[#86868b]">DATA</span>
                          <span className="text-lg font-bold text-[var(--foreground)]">
                            {node.data}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col items-center justify-center">
                          <span className="text-[8px] text-[#86868b]">NEXT</span>
                          <span className="text-[9px] font-semibold text-[#0071e3] truncate max-w-full">
                            {node.nextAddress ? node.nextAddress.slice(2) : 'NULL'}
                          </span>
                        </div>
                      </div>

                      {listType === 'doubly' && (
                        <div className="text-[9px] text-[#86868b] text-center pt-0.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                          PREV: {node.prevAddress ? node.prevAddress.slice(2) : 'NULL'}
                        </div>
                      )}
                    </motion.div>

                    {/* Pointer Arrow connecting to next node */}
                    {idx < currentStep.nodes.length - 1 ? (
                      <div className="flex flex-col items-center text-[#0071e3]">
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                        {listType === 'doubly' && (
                          <div className="w-full h-0.5 bg-[#ff9500]/50 mt-0.5" />
                        )}
                      </div>
                    ) : listType === 'circular' ? (
                      <div className="flex items-center gap-1 text-xs text-[#34c759] font-mono px-2 py-1 rounded bg-[#34c759]/10">
                        <Repeat className="w-3.5 h-3.5" />
                        <span>→ HEAD</span>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-[#ff3b30] font-bold px-2 py-1 rounded bg-[#ff3b30]/10">
                        NULL
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Stepping Controls */}
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

      {/* Explanation Panel */}
      {currentStep && (
        <ExplanationPanel
          title={currentStep.title}
          description={currentStep.description}
          rationale={currentStep.rationale}
          activePointers={currentStep.activePointers}
          statusBadge={listType.toUpperCase()}
          statusColor="blue"
        />
      )}

      {/* Tabs */}
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
          Pointer Visualizer
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
          <span>Challenge</span>
        </button>
      </div>

      {activeTab === 'code' && (
        <CCodeViewer
          snippet={C_CODE_SNIPPETS['singly-linked-list']}
          activeLine={currentStep?.codeLine}
        />
      )}

      {activeTab === 'quiz' && (
        <ChallengeQuiz
          questions={UNIT_QUIZZES['unit-3']}
          unitTitle="Unit III: Linked Lists"
        />
      )}
    </div>
  );
}
