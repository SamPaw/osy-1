'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  buildBSTLayout,
  simulateBSTInsert,
  simulateTreeTraversal,
  generateAdjacencyMatrix,
  generateAdjacencyList,
  GraphModel,
} from '@/lib/algorithms/treesAndGraphs';
import { C_CODE_SNIPPETS } from '@/lib/algorithms/cCodeSnippets';
import { UNIT_QUIZZES } from '@/data/quizData';
import { SimulationControls } from './SimulationControls';
import { ExplanationPanel } from './ExplanationPanel';
import { CCodeViewer } from './CCodeViewer';
import { ChallengeQuiz } from './ChallengeQuiz';
import { sound } from '@/lib/sound';
import {
  GitBranch,
  Network,
  Code2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export function Unit6TreeGraphVisualizer() {
  const [subtopic, setSubtopic] = useState<'bst' | 'traversals' | 'graphs'>('bst');
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'quiz'>('visual');

  // BST state
  const [bstValues, setBstValues] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  const [insertVal, setInsertVal] = useState<number>(35);
  const [traversalType, setTraversalType] = useState<'inorder' | 'preorder' | 'postorder'>('inorder');

  // Graph state
  const [graph, setGraph] = useState<GraphModel>({
    vertices: [
      { id: 0, label: 'V0', x: 25, y: 30 },
      { id: 1, label: 'V1', x: 75, y: 30 },
      { id: 2, label: 'V2', x: 75, y: 75 },
      { id: 3, label: 'V3', x: 25, y: 75 },
    ],
    edges: [
      { u: 0, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 0 },
      { u: 0, v: 2 },
    ],
    isDirected: false,
  });

  // Stepping State
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const simulation = useMemo(() => {
    if (subtopic === 'bst') {
      return simulateBSTInsert(bstValues, insertVal);
    } else if (subtopic === 'traversals') {
      return simulateTreeTraversal(bstValues, traversalType);
    }
    return { steps: [] };
  }, [subtopic, bstValues, insertVal, traversalType]);

  const steps = simulation.steps;
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [subtopic, bstValues, insertVal, traversalType]);

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
          if (s.title.includes('Attached') || s.title.includes('Visit')) sound.compare();
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
      sound.compare();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex((prev) => prev - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const commitBSTInsert = () => {
    sound.push();
    if (!bstValues.includes(insertVal)) {
      setBstValues([...bstValues, insertVal]);
      setInsertVal(insertVal + 7);
    }
  };

  const toggleEdge = (u: number, v: number) => {
    sound.click();
    const exists = graph.edges.some(
      (e) => (e.u === u && e.v === v) || (!graph.isDirected && e.u === v && e.v === u)
    );

    let nextEdges: { u: number; v: number }[];
    if (exists) {
      nextEdges = graph.edges.filter(
        (e) => !(e.u === u && e.v === v) && !(!graph.isDirected && e.u === v && e.v === u)
      );
    } else {
      nextEdges = [...graph.edges, { u, v }];
    }

    setGraph({ ...graph, edges: nextEdges });
  };

  const adjMatrix = useMemo(() => generateAdjacencyMatrix(graph), [graph]);
  const adjList = useMemo(() => generateAdjacencyList(graph), [graph]);

  // Current active tree nodes layout
  const treeNodes = (currentStep as any)?.nodes || buildBSTLayout(bstValues).nodes;

  return (
    <div className="w-full flex flex-col items-center gap-6 my-auto py-6">
      {/* Subtopic Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <button
          onClick={() => {
            sound.click();
            setSubtopic('bst');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'bst'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>BST Creation &amp; Insert</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('traversals');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'traversals'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-[#34c759]" />
          <span>Tree Traversals (In/Pre/Post)</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            setSubtopic('graphs');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            subtopic === 'graphs'
              ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-xs'
              : 'text-[#86868b] hover:text-[var(--foreground)]'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-[#ff9500]" />
          <span>Graph: Matrix &amp; List Dual-View</span>
        </button>
      </div>

      {/* BST Visual Stage */}
      {(subtopic === 'bst' || subtopic === 'traversals') && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between w-full gap-3 px-4 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs">
            {subtopic === 'bst' ? (
              <div className="flex items-center gap-2">
                <span className="text-[#86868b] font-mono">Insert Key:</span>
                <input
                  type="number"
                  value={insertVal}
                  onChange={(e) => setInsertVal(Number(e.target.value))}
                  className="w-16 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] font-mono text-center text-xs"
                />
                <button
                  onClick={commitBSTInsert}
                  className="px-3 py-1 rounded-full bg-[#0071e3] text-white font-medium cursor-pointer"
                >
                  Apply Insert
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[#86868b] font-mono">Traversal Method:</span>
                {(['inorder', 'preorder', 'postorder'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      sound.click();
                      setTraversalType(t);
                    }}
                    className={`px-3 py-1 rounded-full font-mono uppercase font-bold transition-colors cursor-pointer ${
                      traversalType === t
                        ? 'bg-[#34c759] text-white'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                sound.click();
                setBstValues([50, 30, 70, 20, 40, 60, 80]);
              }}
              className="px-3 py-1 text-xs text-[#86868b] hover:text-[var(--foreground)]"
            >
              Reset Tree
            </button>
          </div>

          {/* Canvas View of Binary Search Tree */}
          <div className="relative w-full h-[340px] rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm p-6 overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-[#86868b] mb-2">
              <span>Binary Search Tree (Left &lt; Root &le; Right)</span>
              {subtopic === 'traversals' && (
                <div className="flex items-center gap-2">
                  <span>Output Sequence:</span>
                  <div className="flex items-center gap-1 font-bold text-[#34c759]">
                    {(currentStep as any).traversalOutput?.map((val: number, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-[#34c759]/15">
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {Object.values(treeNodes).map((node: any) => {
                const leftChild = node.leftId ? treeNodes[node.leftId] : null;
                const rightChild = node.rightId ? treeNodes[node.rightId] : null;

                return (
                  <g key={`edges-${node.id}`}>
                    {leftChild && (
                      <line
                        x1={`${node.x}%`}
                        y1={`${node.y + 3}%`}
                        x2={`${leftChild.x}%`}
                        y2={`${leftChild.y - 1}%`}
                        stroke="rgba(128, 128, 128, 0.4)"
                        strokeWidth="2"
                      />
                    )}
                    {rightChild && (
                      <line
                        x1={`${node.x}%`}
                        y1={`${node.y + 3}%`}
                        x2={`${rightChild.x}%`}
                        y2={`${rightChild.y - 1}%`}
                        stroke="rgba(128, 128, 128, 0.4)"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tree Node Circles */}
            {Object.values(treeNodes).map((node: any) => {
              const isCurrent = (currentStep as any)?.currentNodeId === node.id;
              const isVisited = (currentStep as any)?.visitedNodeIds?.includes(node.id);
              const isInserted = node.state === 'inserted';

              return (
                <motion.div
                  key={node.id}
                  layout
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm shadow-md transition-all ${
                    isCurrent
                      ? 'bg-[#0071e3] text-white border-white ring-4 ring-[#0071e3]/40 scale-115 z-20'
                      : isInserted
                      ? 'bg-[#34c759] text-white border-white scale-110 z-10'
                      : isVisited
                      ? 'bg-[#34c759]/20 text-[#34c759] border-[#34c759]'
                      : 'page-tile text-[var(--tile-text)] z-10'
                  }`}
                >
                  {node.value}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Graph Visual Stage (Dual-View: Matrix & List) */}
      {subtopic === 'graphs' && (
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Top Note */}
          <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs text-[#86868b]">
            <span>Click any pair of vertices in the Adjacency Matrix to toggle the edge!</span>
            <span className="font-mono text-[var(--foreground)]">Undirected Graph (Symmetric)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Adjacency Matrix */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-[#0071e3] uppercase">
                1. Adjacency Matrix (N × N Grid)
              </span>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs font-bold text-[#86868b]">
                  <span />
                  {graph.vertices.map((v) => (
                    <span key={v.id}>{v.label}</span>
                  ))}
                </div>

                {adjMatrix.map((row, u) => (
                  <div key={`row-${u}`} className="grid grid-cols-5 gap-1 items-center font-mono text-xs">
                    <span className="font-bold text-[#86868b] text-center">{graph.vertices[u].label}</span>
                    {row.map((val, v) => (
                      <button
                        key={`cell-${u}-${v}`}
                        onClick={() => toggleEdge(u, v)}
                        className={`h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                          val === 1
                            ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                            : 'bg-black/[0.02] dark:bg-white/[0.04] border-[var(--border)] text-[#86868b] hover:bg-black/[0.06]'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Adjacency List */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-[#34c759] uppercase">
                2. Adjacency List (Linked List Pointers)
              </span>

              <div className="flex flex-col gap-3 divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {adjList.map((item) => (
                  <div key={`adj-${item.vertex}`} className="pt-2 flex items-center gap-3 font-mono text-xs">
                    <span className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] flex items-center justify-center font-bold text-sm">
                      {graph.vertices[item.vertex].label}
                    </span>

                    <ArrowRight className="w-4 h-4 text-[#86868b] flex-shrink-0" />

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.neighbors.map((nbr) => (
                        <span
                          key={nbr}
                          className="px-2.5 py-1 rounded-lg bg-[#34c759]/15 text-[#34c759] font-bold border border-[#34c759]/30"
                        >
                          {graph.vertices[nbr].label}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#86868b] text-[10px]">
                        NULL
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stepping Controls (for BST & Traversals) */}
      {subtopic !== 'graphs' && (
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

      {/* Explanation Panel */}
      {subtopic !== 'graphs' && currentStep && (
        <ExplanationPanel
          title={currentStep.title}
          description={currentStep.description}
          rationale={currentStep.rationale}
          statusBadge={subtopic === 'bst' ? 'BST INSERT' : traversalType.toUpperCase()}
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
          snippet={subtopic === 'graphs' ? C_CODE_SNIPPETS['graph-c'] : C_CODE_SNIPPETS['bst-c']}
          activeLine={currentStep?.codeLine}
        />
      )}

      {activeTab === 'quiz' && (
        <ChallengeQuiz
          questions={UNIT_QUIZZES['unit-6']}
          unitTitle="Unit VI: Trees & Graphs"
        />
      )}
    </div>
  );
}
