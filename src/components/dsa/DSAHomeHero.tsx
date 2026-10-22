'use client';

import React from 'react';
import { UnitId } from '@/types/dsa';
import { CURRICULUM_METADATA } from '@/data/curriculumData';
import { sound } from '@/lib/sound';
import {
  ArrowRight,
  Database,
  Search,
  Link as LinkIcon,
  Layers,
  Repeat,
  Network,
  BookOpen,
} from 'lucide-react';

interface DSAHomeHeroProps {
  onStart: () => void;
  onSelectUnit: (unit: UnitId) => void;
  onOpenSyllabus: () => void;
}

export function DSAHomeHero({ onStart, onSelectUnit, onOpenSyllabus }: DSAHomeHeroProps) {
  const unitsInfo = [
    {
      id: 'unit-1' as UnitId,
      number: 'Unit I',
      title: 'Intro & Memory Layout',
      desc: 'Arrays, C Strings, Bitwise Operators & Big-O Complexity',
      icon: Database,
      color: '#0071e3',
      co: 'CO1',
    },
    {
      id: 'unit-2' as UnitId,
      number: 'Unit II',
      title: 'Searching & Sorting',
      desc: 'Linear/Binary Search, Bubble, Selection, Insertion, Quick & Radix Sort',
      icon: Search,
      color: '#34c759',
      co: 'CO2',
    },
    {
      id: 'unit-3' as UnitId,
      number: 'Unit III',
      title: 'Linked Lists & Heap',
      desc: 'Singly, Circular, Doubly Lists, Pointer Rewiring, Reverse & Merge',
      icon: LinkIcon,
      color: '#ff9500',
      co: 'CO3',
    },
    {
      id: 'unit-4' as UnitId,
      number: 'Unit IV',
      title: 'Stacks & Recursion',
      desc: 'LIFO ADT, Infix to Postfix/Prefix, Expression Evaluation & Call Stack',
      icon: Layers,
      color: '#5856d6',
      co: 'CO4',
    },
    {
      id: 'unit-5' as UnitId,
      number: 'Unit V',
      title: 'Queues & Scheduling',
      desc: 'FIFO ADT, Linear False Overflow, Circular Ring Buffers & Deques',
      icon: Repeat,
      color: '#af52de',
      co: 'CO5',
    },
    {
      id: 'unit-6' as UnitId,
      number: 'Unit VI',
      title: 'Trees & Graphs',
      desc: 'BST Creation, In/Pre/Post Traversals, Adjacency Matrix & List Dual-View',
      icon: Network,
      color: '#ff2d55',
      co: 'CO6',
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[92vh] px-4 sm:px-8 py-10 max-w-6xl mx-auto select-none">
      {/* Top Academic Tagline */}
      <div className="flex flex-col items-center text-center gap-4 max-w-3xl pt-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-[#0071e3]">
            {CURRICULUM_METADATA.courseCode} • {CURRICULUM_METADATA.institute}
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[var(--foreground)] leading-[1.05]">
          Data Structures <br />
          <span className="text-[#86868b] font-normal">&amp; Algorithms.</span>
        </h1>

        <p className="text-base sm:text-xl text-[#86868b] font-normal leading-relaxed max-w-2xl">
          An interactive, physically tangible visualization platform for classroom smartboards, mobile devices, and students mastering C-based computer science foundations.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.click();
              onStart();
            }}
            className="group flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-black dark:hover:bg-[#f5f5f7] active:scale-[0.98] transition-all shadow-md cursor-pointer"
          >
            <span>Begin Laboratory</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => {
              sound.click();
              onOpenSyllabus();
            }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] font-medium text-sm transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#0071e3]" />
            <span>Academic Syllabus</span>
          </button>
        </div>
      </div>

      {/* Curriculum Units Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-8">
        {unitsInfo.map((u) => {
          const Icon = u.icon;
          return (
            <div
              key={u.id}
              onClick={() => {
                sound.click();
                onSelectUnit(u.id);
              }}
              className="group p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-[#0071e3]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${u.color}15`, color: u.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#86868b] px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06]">
                    {u.co}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#86868b]">
                    {u.number}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)] group-hover:text-[#0071e3] transition-colors">
                  {u.title}
                </h3>
                <p className="text-xs text-[#86868b] mt-1 leading-relaxed">{u.desc}</p>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-[#0071e3] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Launch simulation</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <footer className="w-full flex flex-wrap items-center justify-between text-xs text-[#86868b] pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
        <span>MIT-WPU CSE00370 • Scheme 2025–2028</span>
        <span>Keyboard: 1–6 for Units • Space/Arrows to Step • F for Fullscreen</span>
      </footer>
    </div>
  );
}
