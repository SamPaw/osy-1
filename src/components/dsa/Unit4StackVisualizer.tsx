'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  simulateStackOperations,
  simulateInfixToPostfix,
  simulatePostfixEvaluation,
  simulateRecursiveMultiply,
} from '@/lib/algorithms/stacks';
import { C_CODE_SNIPPETS } from '@/lib/algorithms/cCodeSnippets';
import { UNIT_QUIZZES } from '@/data/quizData';
import { SimulationControls } from './SimulationControls';
import { ExplanationPanel } from './ExplanationPanel';
import { CCodeViewer } from './CCodeViewer';
import { ChallengeQuiz } from './ChallengeQuiz';
import { sound } from '@/lib/sound';
import {
  Layers,
  Calculator,
  GitBranch,
  Code2,
  HelpCircle,
} from 'lucide-react';

export function Unit4StackVisualizer() {
  const [subtopic, setSubtopic] = useState<'stack-adt' | 'infix-postfix' | 'postfix-eval' | 'recursion'>('stack-adt');
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'quiz'>('visual');

  // Stack ADT state
  const [stackCapacity] = useState<number>(5);
  const [stackElements, setStackElements] = useState<number[]>([10, 20]);
  const [stackOp, setStackOp] = useState<'push' | 'pop' | 'peek'>('push');
  const [pushVal, setPushVal] = useState<number>(30);

  // Infix expression state
  const [infixExpr, setInfixExpr] = useState<string>('(A + B) * C');

  // Postfix eval state
  const [postfixExpr, setPostfixExpr] = useState<string>('5 3 + 2 *');

  // Recursion state
  const [recA, setRecA] = useState<number>(4);
  const [recB, setRecB] = useState<number>(3);

  // Stepping State
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const simulation = useMemo(() => {
    switch (subtopic) {
      case 'stack-adt':
        return simulateStackOperations(stackElements, stackCapacity, stackOp, pushVal);
      case 'infix-postfix':
        return simulateInfixToPostfix(infixExpr);
      case 'postfix-eval':
        return simulatePostfixEvaluation(postfixExpr);
      case 'recursion':
        return simulateRecursiveMultiply(recA, recB);
      default:
        return { steps: [] };
    }
  }, [subtopic, stackElements, stackCapacity, stackOp, pushVal, infixExpr, postfixExpr, recA, recB]);

  const steps = simulation.steps;
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [subtopic, stackOp, pushVal, infixExpr, postfixExpr, recA, recB, stackElements]);

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
          const s = steps[next] as any;
          if (s.title.includes('PUSH') || s.title.includes('Push') || s.phase === 'descent') {
            sound.push();
          } else if (s.title.includes('POP') || s.title.includes('Pop') || s.phase === 'unwinding') {
            sound.pop();
          } else {
            sound.step();
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
      if (s.title.includes('PUSH') || s.title.includes('Push')) sound.push();
      else if (s.title.includes('POP') || s.title.includes('Pop')) sound.pop();
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

  const applyPushCommit = () => {
    if (stackElements.length < stackCapacity) {
      setStackElements([...stackElements, pushVal]);
      setPushVal(pushVal + 10);
    }
  };

  const applyPopCommit = () => {
    if (stackElements.length > 0) {
      const next = [...stackElements];
      next.pop();
      setStackElements(next);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 my-auto py-6">
      {/* Subtopic Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <button
          onClick={() => {
            sound.click();
            setSubtopic('stack-adt');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'stack-adt'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Stack ADT (LIFO)</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('infix-postfix');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'infix-postfix'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-[#34c759]" />
          <span>Infix → Postfix Conversion</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('postfix-eval');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'postfix-eval'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-[#ff9500]" />
          <span>Postfix Evaluation</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('recursion');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'recursion'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-[#5856d6]" />
          <span>Recursion Call Stack</span>
        </button>
      </div>

      {/* Visual Canvas */}
      {subtopic === 'stack-adt' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          {/* Operations Bar */}
          <div className="flex flex-wrap items-center justify-between w-full gap-3 px-4 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#86868b] font-mono">Operation:</span>
              {(['push', 'pop', 'peek'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => {
                    sound.click();
                    setStackOp(op);
                  }}
                  className={`px-3 py-1 rounded-full font-mono uppercase font-bold transition-colors cursor-pointer ${
                    stackOp === op
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08]'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            {stackOp === 'push' && (
              <div className="flex items-center gap-2">
                <span className="text-[#86868b] font-mono">Push Val:</span>
                <input
                  type="number"
                  value={pushVal}
                  onChange={(e) => setPushVal(Number(e.target.value))}
                  className="w-16 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-center text-xs"
                />
                <button
                  onClick={applyPushCommit}
                  disabled={stackElements.length >= stackCapacity}
                  className="px-3 py-1 rounded-full bg-[#34c759] text-white text-xs font-semibold cursor-pointer disabled:opacity-30"
                >
                  Commit Push
                </button>
              </div>
            )}

            {stackOp === 'pop' && (
              <button
                onClick={applyPopCommit}
                disabled={stackElements.length === 0}
                className="px-3 py-1 rounded-full bg-[#ff3b30] text-white text-xs font-semibold cursor-pointer disabled:opacity-30"
              >
                Commit Pop
              </button>
            )}
          </div>

          {/* Vertical Stack Tank Layout */}
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full text-xs font-mono text-[#86868b]">
              <span>Vertical Physical Memory Column</span>
              <span>
                TOP: {stackElements.length > 0 ? `[${stackElements.length - 1}]` : '-1 (Empty)'}
              </span>
            </div>

            {/* Stack Chamber */}
            <div className="relative w-48 sm:w-56 h-72 border-x-2 border-b-2 border-black/[0.2] dark:border-white/[0.2] rounded-b-2xl p-2 flex flex-col-reverse gap-2 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
              {Array.from({ length: stackCapacity }, (_, idx) => {
                const isOccupied = idx < ((currentStep as any).elements?.length ?? stackElements.length);
                const val = (currentStep as any).elements?.[idx] ?? stackElements[idx];
                const isTop = idx === ((currentStep as any).elements?.length ?? stackElements.length) - 1;

                return (
                  <div
                    key={`slot-${idx}`}
                    className={`h-11 rounded-xl border flex items-center justify-between px-3 font-mono transition-all duration-200 ${
                      isOccupied
                        ? isTop
                          ? 'bg-[#0071e3] text-white border-[#0071e3] font-bold shadow-md scale-102'
                          : 'page-tile text-[var(--tile-text)]'
                        : 'border-dashed border-black/[0.1] dark:border-white/[0.1] text-[#86868b] opacity-40'
                    }`}
                  >
                    <span className="text-[10px] opacity-70">[{idx}]</span>
                    <span className="text-base font-bold">{isOccupied ? val : 'Empty'}</span>
                    <span className="text-[9px] font-bold">
                      {isTop ? 'TOP' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs font-mono text-[#86868b] text-center">
              Capacity: {stackCapacity} | Elements: {((currentStep as any).elements?.length ?? stackElements.length)}
            </div>
          </div>
        </div>
      )}

      {subtopic === 'infix-postfix' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full max-w-xl px-4 py-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            <span className="font-mono text-[#86868b]">Infix String:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={infixExpr}
                onChange={(e) => setInfixExpr(e.target.value)}
                className="w-48 px-2.5 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs uppercase"
              />
            </div>
          </div>

          {/* Shunting Yard Visualization */}
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Operator Stack */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-xs font-mono font-bold text-[#0071e3] uppercase">
                  Operator Stack (LIFO)
                </span>
                <div className="h-44 border-x-2 border-b-2 border-black/[0.15] dark:border-white/[0.15] rounded-b-xl flex flex-col-reverse gap-1.5 p-2 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto">
                  {(currentStep as any).operatorStack?.map((op: string, i: number) => (
                    <div
                      key={`op-${i}`}
                      className="h-9 rounded-lg bg-[#0071e3] text-white flex items-center justify-center font-mono font-bold text-base shadow-xs"
                    >
                      {op}
                    </div>
                  ))}
                  {!(currentStep as any).operatorStack?.length && (
                    <div className="my-auto text-xs text-[#86868b] font-mono text-center opacity-40">
                      Empty Stack
                    </div>
                  )}
                </div>
              </div>

              {/* Output Expression Stream */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-xs font-mono font-bold text-[#34c759] uppercase">
                  Postfix Output Stream
                </span>
                <div className="h-44 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {((currentStep as any).outputExpression || '').split('').map((tok: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-[#34c759]/15 text-[#34c759] font-mono font-bold text-sm"
                      >
                        {tok}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs font-mono text-[#86868b]">
                    Current Token: <strong className="text-[var(--foreground)]">{(currentStep as any).currentSymbol || 'Start'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subtopic === 'postfix-eval' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full max-w-xl px-4 py-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            <span className="font-mono text-[#86868b]">Postfix Expression:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={postfixExpr}
                onChange={(e) => setPostfixExpr(e.target.value)}
                className="w-48 px-2.5 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-xs"
              />
            </div>
          </div>

          <div className="w-full p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full text-xs font-mono text-[#86868b]">
              <span>Operand Evaluation Stack</span>
              {(currentStep as any).computedResult !== undefined && (
                <span className="text-[#34c759] font-bold">
                  Result: {(currentStep as any).computedResult}
                </span>
              )}
            </div>

            {/* Vertical Stack of Operands */}
            <div className="w-48 h-56 border-x-2 border-b-2 border-black/[0.15] dark:border-white/[0.15] rounded-b-xl flex flex-col-reverse gap-2 p-2 bg-black/[0.02] dark:bg-white/[0.02]">
              {(currentStep as any).operandStack?.map((val: number, i: number) => (
                <div
                  key={`val-${i}`}
                  className="h-10 rounded-lg bg-[#ff9500] text-white flex items-center justify-center font-mono font-bold text-base shadow-sm"
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subtopic === 'recursion' && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full max-w-xl px-4 py-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            <span className="font-mono text-[#86868b]">Recursive Multiplication:</span>
            <div className="flex items-center gap-2 font-mono">
              <input
                type="number"
                value={recA}
                onChange={(e) => setRecA(Math.min(9, Math.max(1, Number(e.target.value))))}
                className="w-12 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] text-center font-bold"
              />
              <span>×</span>
              <input
                type="number"
                value={recB}
                onChange={(e) => setRecB(Math.min(5, Math.max(0, Number(e.target.value))))}
                className="w-12 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] text-center font-bold"
              />
            </div>
          </div>

          {/* Call Stack Frames Column */}
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#86868b]">
              <span>Runtime Call Stack (Activation Records)</span>
              <span>
                Phase: <strong className="text-[#0071e3] uppercase">{(currentStep as any).phase}</strong>
              </span>
            </div>

            <div className="flex flex-col-reverse gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] min-h-[220px]">
              {(currentStep as any).callStack?.map((frame: any) => {
                const isCurrent = (currentStep as any).currentCall?.id === frame.id;
                return (
                  <motion.div
                    key={frame.id}
                    layout
                    className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs shadow-xs ${
                      isCurrent
                        ? 'bg-[#0071e3]/15 border-[#0071e3] text-[var(--foreground)] font-bold'
                        : 'bg-[var(--card)] border-[var(--border)] text-[#86868b]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
                      <span>{frame.functionName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>b = {frame.args.b}</span>
                      {frame.returnValue !== undefined && (
                        <span className="text-[#34c759] font-bold">
                          return {frame.returnValue}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {!(currentStep as any).callStack?.length && (
                <div className="my-auto text-xs font-mono text-[#86868b] text-center opacity-40">
                  Call stack cleared (All activation frames returned).
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          statusBadge={subtopic.toUpperCase()}
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
          <span>Challenge</span>
        </button>
      </div>

      {activeTab === 'code' && (
        <CCodeViewer
          snippet={C_CODE_SNIPPETS['stack-c']}
          activeLine={currentStep?.codeLine}
        />
      )}

      {activeTab === 'quiz' && (
        <ChallengeQuiz
          questions={UNIT_QUIZZES['unit-4']}
          unitTitle="Unit IV: Stacks & Recursion"
        />
      )}
    </div>
  );
}
