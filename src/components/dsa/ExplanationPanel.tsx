'use client';

import React from 'react';
import { Info, Terminal, GitCommit } from 'lucide-react';

interface ExplanationPanelProps {
  title: string;
  description: string;
  rationale?: string;
  activePointers?: Record<string, string | number | null | undefined>;
  codeSnippetHint?: string;
  statusBadge?: string;
  statusColor?: 'blue' | 'green' | 'amber' | 'red';
}

export function ExplanationPanel({
  title,
  description,
  rationale,
  activePointers,
  codeSnippetHint,
  statusBadge,
  statusColor = 'blue',
}: ExplanationPanelProps) {
  const badgeColors = {
    blue: 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20',
    green: 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20',
    amber: 'bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20',
    red: 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20',
  };

  const hasPointers = activePointers && Object.keys(activePointers).length > 0;

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 flex flex-col gap-3 shadow-xs transition-colors">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0071e3]" />
          <h4 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight">
            {title}
          </h4>
        </div>

        {statusBadge && (
          <span
            className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${badgeColors[statusColor]}`}
          >
            {statusBadge}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-[var(--foreground)] font-normal leading-relaxed">
        {description}
      </p>

      {/* Rationale / Why it happens */}
      {rationale && (
        <div className="flex items-start gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868b]">
          <GitCommit className="w-3.5 h-3.5 mt-0.5 text-[#0071e3] flex-shrink-0" />
          <span className="font-mono leading-relaxed">
            <strong className="text-[var(--foreground)] font-semibold">Algorithmic Rationale: </strong>
            {rationale}
          </span>
        </div>
      )}

      {/* Active Pointers & Register State */}
      {(hasPointers || codeSnippetHint) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          {hasPointers && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-[#86868b]">Variables:</span>
              {Object.entries(activePointers!).map(([k, v]) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[11px] font-mono font-medium text-[var(--foreground)]"
                >
                  <span className="text-[#86868b]">{k}:</span> {v ?? 'NULL'}
                </span>
              ))}
            </div>
          )}

          {codeSnippetHint && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#86868b] ml-auto">
              <Terminal className="w-3 h-3 text-[#34c759]" />
              <code className="text-[#34c759]">{codeSnippetHint}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
