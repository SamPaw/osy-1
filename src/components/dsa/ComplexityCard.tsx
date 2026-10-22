'use client';

import React from 'react';
import { ComplexityInfo } from '@/types/dsa';
import { Activity, Clock, Database, CheckCircle2 } from 'lucide-react';

interface ComplexityCardProps {
  algorithmName: string;
  complexity: ComplexityInfo;
}

export function ComplexityCard({ algorithmName, complexity }: ComplexityCardProps) {
  return (
    <div className="w-full max-w-4xl rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0071e3]" />
          <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
            Asymptotic Complexity Analysis — {algorithmName}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#86868b]">Formal Big-O Metrics</span>
      </div>

      {/* Grid of Complexities */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-1">
          <span className="text-[11px] text-[#86868b] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#34c759]" />
            Best Time
          </span>
          <span className="text-lg font-mono font-bold text-[#34c759]">
            {complexity.bestTime}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-1">
          <span className="text-[11px] text-[#86868b] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#0071e3]" />
            Average Time
          </span>
          <span className="text-lg font-mono font-bold text-[#0071e3]">
            {complexity.averageTime}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-1">
          <span className="text-[11px] text-[#86868b] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#ff3b30]" />
            Worst Time
          </span>
          <span className="text-lg font-mono font-bold text-[#ff3b30]">
            {complexity.worstTime}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-1">
          <span className="text-[11px] text-[#86868b] flex items-center gap-1">
            <Database className="w-3 h-3 text-[#ff9500]" />
            Auxiliary Space
          </span>
          <span className="text-lg font-mono font-bold text-[#ff9500]">
            {complexity.spaceComplexity}
          </span>
        </div>
      </div>

      {/* Explanatory notes */}
      <div className="flex flex-col gap-2 text-xs text-[#86868b] pt-1">
        <p className="leading-relaxed">
          <strong className="text-[var(--foreground)] font-medium">Mechanism: </strong>
          {complexity.explanation}
        </p>

        {complexity.assumptions && (
          <p className="flex items-start gap-1.5 leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3] mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-[var(--foreground)] font-medium">Assumptions &amp; Preconditions: </strong>
              {complexity.assumptions}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
