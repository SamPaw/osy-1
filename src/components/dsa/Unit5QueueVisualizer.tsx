'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { simulateLinearQueue, simulateCircularQueue } from '@/lib/algorithms/queues';
import { C_CODE_SNIPPETS } from '@/lib/algorithms/cCodeSnippets';
import { UNIT_QUIZZES } from '@/data/quizData';
import { SimulationControls } from './SimulationControls';
import { ExplanationPanel } from './ExplanationPanel';
import { CCodeViewer } from './CCodeViewer';
import { ChallengeQuiz } from './ChallengeQuiz';
import { sound } from '@/lib/sound';
import {
  Layers,
  Repeat,
  Code2,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export function Unit5QueueVisualizer() {
  const [queueType, setQueueType] = useState<'linear' | 'circular' | 'priority' | 'deque'>('circular');
  const [operation, setOperation] = useState<'enqueue' | 'dequeue'>('enqueue');
  const [capacity] = useState<number>(5);

  // Queue contents
  const [slots, setSlots] = useState<(number | null)[]>([null, 20, 30, null, null]);
  const [front, setFront] = useState<number>(1);
  const [rear, setRear] = useState<number>(2);
  const [enqueueVal, setEnqueueVal] = useState<number>(40);

  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'quiz'>('visual');

  // Stepping State
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const simulation = useMemo(() => {
    if (queueType === 'linear') {
      return simulateLinearQueue(slots, capacity, front, rear, operation, enqueueVal);
    } else {
      return simulateCircularQueue(slots, capacity, front, rear, operation, enqueueVal);
    }
  }, [queueType, slots, capacity, front, rear, operation, enqueueVal]);

  const steps = simulation.steps;
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [queueType, operation, enqueueVal, slots, front, rear]);

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
          const next = prev + 1;
          const s = steps[next];
          if (s.title.includes('ENQUEUE') || s.title.includes('Enqueue')) sound.push();
          else if (s.title.includes('DEQUEUE') || s.title.includes('Dequeue')) sound.pop();
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
      if (s.title.includes('ENQUEUE') || s.title.includes('Enqueue')) sound.push();
      else if (s.title.includes('DEQUEUE') || s.title.includes('Dequeue')) sound.pop();
      else sound.step();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex((prev) => prev - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const commitEnqueue = () => {
    sound.push();
    if (simulation.finalSlots) {
      setSlots(simulation.finalSlots);
      setFront(simulation.finalFront);
      setRear(simulation.finalRear);
      setEnqueueVal(enqueueVal + 10);
    }
  };

  const commitDequeue = () => {
    sound.pop();
    if (simulation.finalSlots) {
      setSlots(simulation.finalSlots);
      setFront(simulation.finalFront);
      setRear(simulation.finalRear);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 my-auto py-6">
      {/* Queue Type Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <button
          onClick={() => {
            sound.click();
            setQueueType('linear');
            setSlots([null, null, 10, 20, 30]);
            setFront(2);
            setRear(4);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            queueType === 'linear'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Linear Queue (False Overflow)</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setQueueType('circular');
            setSlots([null, 20, 30, null, null]);
            setFront(1);
            setRear(2);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            queueType === 'circular'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Repeat className="w-3.5 h-3.5 text-[#34c759]" />
          <span>Circular Queue (Ring Buffer)</span>
        </button>
      </div>

      {/* Main Visual Stage */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Operations Bar */}
        <div className="flex flex-wrap items-center justify-between w-full gap-3 px-4 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#86868b] font-mono">Action:</span>
            <button
              onClick={() => {
                sound.click();
                setOperation('enqueue');
              }}
              className={`px-3 py-1 rounded-full font-mono uppercase font-bold transition-colors cursor-pointer ${
                operation === 'enqueue'
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08]'
              }`}
            >
              Enqueue
            </button>
            <button
              onClick={() => {
                sound.click();
                setOperation('dequeue');
              }}
              className={`px-3 py-1 rounded-full font-mono uppercase font-bold transition-colors cursor-pointer ${
                operation === 'dequeue'
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08]'
              }`}
            >
              Dequeue
            </button>
          </div>

          {operation === 'enqueue' && (
            <div className="flex items-center gap-2">
              <span className="text-[#86868b] font-mono">Val:</span>
              <input
                type="number"
                value={enqueueVal}
                onChange={(e) => setEnqueueVal(Number(e.target.value))}
                className="w-16 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-center text-xs"
              />
              <button
                onClick={commitEnqueue}
                className="px-3 py-1 rounded-full bg-[#34c759] text-white text-xs font-semibold cursor-pointer"
              >
                Apply Enqueue
              </button>
            </div>
          )}

          {operation === 'dequeue' && (
            <button
              onClick={commitDequeue}
              className="px-3 py-1 rounded-full bg-[#ff3b30] text-white text-xs font-semibold cursor-pointer"
            >
              Apply Dequeue
            </button>
          )}
        </div>

        {/* False Overflow Warning Banner */}
        {currentStep?.isFalseOverflow && (
          <div className="w-full flex items-center gap-2 p-3.5 rounded-2xl bg-[#ff9500]/10 border border-[#ff9500]/30 text-xs text-[#ff9500]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Linear Queue False Overflow:</strong> rear reached capacity (index 4), but slots at front are empty! Switch to <strong>Circular Queue</strong> to see how modular arithmetic reuses empty slots.
            </span>
          </div>
        )}

        {/* Circular Queue or Linear Queue Array Rendering */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between text-xs font-mono text-[#86868b]">
            <div className="flex items-center gap-3">
              <span>
                FRONT: <strong className="text-[#34c759]">{currentStep?.front ?? front}</strong>
              </span>
              <span>•</span>
              <span>
                REAR: <strong className="text-[#0071e3]">{currentStep?.rear ?? rear}</strong>
              </span>
            </div>
            <span>
              Capacity: {capacity} ({(currentStep?.slots ?? []).filter((s) => s.value !== null).length} Resident)
            </span>
          </div>

          {/* Slots Row */}
          <div className="grid grid-cols-5 gap-3 pt-2">
            {(currentStep?.slots || []).map((slot) => {
              const isFront = currentStep?.front === slot.index && slot.value !== null;
              const isRear = currentStep?.rear === slot.index && slot.value !== null;
              const isWasted = slot.state === 'wasted';
              const isEnqueued = slot.state === 'enqueued';

              return (
                <div
                  key={`q-slot-${slot.index}`}
                  className={`h-36 rounded-2xl memory-frame-slot p-2.5 flex flex-col justify-between items-center transition-all ${
                    isEnqueued
                      ? 'border-[#0071e3] bg-[#0071e3]/10 scale-105 shadow-md'
                      : isWasted
                      ? 'border-[#ff3b30]/30 bg-[#ff3b30]/5 opacity-60'
                      : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#86868b]">
                    <span>[{slot.index}]</span>
                    <div className="flex items-center gap-1 font-bold">
                      {isFront && <span className="text-[#34c759]">FRONT</span>}
                      {isRear && <span className="text-[#0071e3]">REAR</span>}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {slot.value !== null ? (
                      <motion.div
                        key={`q-val-${slot.value}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="w-14 h-14 rounded-2xl page-tile flex items-center justify-center font-mono font-bold text-xl text-[var(--tile-text)] shadow-sm"
                      >
                        {slot.value}
                      </motion.div>
                    ) : (
                      <div className="text-[10px] font-mono text-[#86868b] opacity-40">
                        {isWasted ? '[ Wasted ]' : '[ Empty ]'}
                      </div>
                    )}
                  </AnimatePresence>

                  <span className="text-[9px] font-mono text-[#86868b]">
                    {slot.value !== null ? 'Resident' : 'Available'}
                  </span>
                </div>
              );
            })}
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
          statusBadge={queueType.toUpperCase()}
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
          Queue Visualizer
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
          snippet={C_CODE_SNIPPETS['circular-queue-c']}
          activeLine={currentStep?.codeLine}
        />
      )}

      {activeTab === 'quiz' && (
        <ChallengeQuiz
          questions={UNIT_QUIZZES['unit-5']}
          unitTitle="Unit V: Queues"
        />
      )}
    </div>
  );
}
