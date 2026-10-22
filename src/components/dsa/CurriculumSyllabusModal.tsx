'use client';

import React, { useState } from 'react';
import { CURRICULUM_METADATA } from '@/data/curriculumData';
import { X, BookOpen, Award, FlaskConical, FolderGit2, BookCheck } from 'lucide-react';
import { sound } from '@/lib/sound';

interface CurriculumSyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CurriculumSyllabusModal({ isOpen, onClose }: CurriculumSyllabusModalProps) {
  const [activeTab, setActiveTab] = useState<'units' | 'lab' | 'cos' | 'microprojects' | 'books'>('units');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[var(--card)] rounded-[2rem] border border-[var(--border)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[10px] font-mono font-bold">
                {CURRICULUM_METADATA.courseCode}
              </span>
              <span className="text-xs text-[#86868b] font-mono">
                {CURRICULUM_METADATA.institute} • {CURRICULUM_METADATA.semester}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {CURRICULUM_METADATA.courseTitle}
            </h2>
          </div>

          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="p-2 rounded-full text-[#86868b] hover:text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-black/[0.04] dark:border-white/[0.06] overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => {
              sound.click();
              setActiveTab('units');
            }}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'units'
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
                : 'text-[#86868b] hover:text-[var(--foreground)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory Units (I - VI)</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              setActiveTab('lab');
            }}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'lab'
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
                : 'text-[#86868b] hover:text-[var(--foreground)]'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>20 Lab Practicals</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              setActiveTab('cos');
            }}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cos'
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
                : 'text-[#86868b] hover:text-[var(--foreground)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Course Outcomes (COs)</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              setActiveTab('microprojects');
            }}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'microprojects'
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
                : 'text-[#86868b] hover:text-[var(--foreground)]'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Microprojects</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              setActiveTab('books');
            }}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'books'
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold'
                : 'text-[#86868b] hover:text-[var(--foreground)]'
            }`}
          >
            <BookCheck className="w-3.5 h-3.5" />
            <span>Textbooks</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'units' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
                <div>Lecture: <strong>4 Hrs/Wk</strong></div>
                <div>Lab: <strong>2 Hrs/Wk</strong></div>
                <div>Credits: <strong>5.0</strong></div>
                <div>Theory Marks: <strong>100</strong></div>
              </div>

              {CURRICULUM_METADATA.units.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#0071e3] uppercase">
                      {u.unitNumber} • {u.courseOutcome}
                    </span>
                    <span className="text-xs font-mono text-[#86868b]">
                      {u.hours} Hours • {u.marks} Marks
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-[var(--foreground)]">{u.title}</h4>
                  <p className="text-xs text-[#86868b]">{u.subtitle}</p>

                  <ul className="mt-2 space-y-1">
                    {u.topics.map((t, i) => (
                      <li key={i} className="text-xs text-[var(--foreground)] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-1.5 flex-shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="space-y-2">
              <p className="text-xs text-[#86868b] pb-2">
                Mandatory Lab Practicals aligned with Learning Outcomes (LLOs):
              </p>
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {CURRICULUM_METADATA.labPracticals.map((lab) => (
                  <div key={lab.id} className="py-2.5 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#0071e3]">{lab.id}</span>
                        <span className="text-xs font-semibold text-[var(--foreground)]">{lab.title}</span>
                      </div>
                      <span className="text-xs text-[#86868b]">{lab.desc}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#86868b] flex-shrink-0">
                      <span>{lab.co}</span>
                      <span>•</span>
                      <span>{lab.hrs} hrs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cos' && (
            <div className="space-y-3">
              {CURRICULUM_METADATA.courseOutcomes.map((co) => (
                <div
                  key={co.code}
                  className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-start gap-3"
                >
                  <span className="px-2.5 py-1 rounded-lg bg-[#0071e3]/10 text-[#0071e3] font-mono font-bold text-xs flex-shrink-0">
                    {co.code}
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                    {co.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'microprojects' && (
            <div className="space-y-3">
              <p className="text-xs text-[#86868b]">
                Suggested Microprojects &amp; SLA activities specified in the curriculum:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CURRICULUM_METADATA.microprojects.map((proj, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-start gap-2.5"
                  >
                    <span className="font-mono text-xs text-[#0071e3] font-bold">0{i + 1}.</span>
                    <span className="text-xs text-[var(--foreground)] font-medium">{proj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className="space-y-3">
              {CURRICULUM_METADATA.textbooks.map((b, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-1"
                >
                  <h4 className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">{b.title}</h4>
                  <div className="flex items-center justify-between text-xs text-[#86868b]">
                    <span>Author: {b.author}</span>
                    <span>{b.publisher}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#86868b]">
          <span>Approved Scheme 2025–2028</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
