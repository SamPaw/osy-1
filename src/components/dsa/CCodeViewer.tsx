'use client';

import React, { useState } from 'react';
import { CCodeSnippet } from '@/lib/algorithms/cCodeSnippets';
import { Copy, Check, FileCode2 } from 'lucide-react';
import { sound } from '@/lib/sound';

interface CCodeViewerProps {
  snippet: CCodeSnippet;
  activeLine?: number;
}

export function CCodeViewer({ snippet, activeLine }: CCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sound.click();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(snippet.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const lines = snippet.code.split('\n');

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-[#141416] text-[#f5f5f7] border border-white/[0.1] shadow-md overflow-hidden flex flex-col font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1c1c1e] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-[#0071e3]" />
          <span className="font-semibold text-white tracking-tight">{snippet.filename}</span>
          <span className="text-[#86868b] text-[10px] hidden sm:inline">• {snippet.title}</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#34c759]" />
              <span className="text-[#34c759]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-4 overflow-x-auto max-h-[380px] no-scrollbar flex flex-col leading-relaxed select-text">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isActive = activeLine === lineNum;

          return (
            <div
              key={`code-line-${lineNum}`}
              className={`flex items-start gap-4 px-2 py-0.5 rounded transition-colors ${
                isActive
                  ? 'bg-[#0071e3]/20 border-l-2 border-[#0071e3] text-white font-semibold'
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <span className="w-8 text-right text-[#555558] select-none flex-shrink-0">
                {lineNum}
              </span>
              <pre className="flex-1 font-mono text-xs whitespace-pre">
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightCSyntax(line),
                  }}
                />
              </pre>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#18181a] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b] font-sans">
        <span>Standard C99 / GCC Compatible Implementation</span>
        <span>MIT-WPU CSE00370 Curriculum Reference</span>
      </div>
    </div>
  );
}

/**
 * Lightweight C syntax coloring helper
 */
function highlightCSyntax(line: string): string {
  if (line.trim().startsWith('//')) {
    return `<span class="text-[#86868b] italic">${escapeHtml(line)}</span>`;
  }

  let escaped = escapeHtml(line);

  // Keywords
  const keywords = ['int', 'void', 'char', 'struct', 'sizeof', 'return', 'if', 'else', 'for', 'while', 'break', 'const', 'unsigned'];
  keywords.forEach((kw) => {
    const reg = new RegExp(`\\b${kw}\\b`, 'g');
    escaped = escaped.replace(reg, `<span class="text-[#ff7b72]">${kw}</span>`);
  });

  // Preprocessor directives
  escaped = escaped.replace(/#include &lt;.*?&gt;/g, '<span class="text-[#d2a8ff]">$&</span>');
  escaped = escaped.replace(/#define \w+/g, '<span class="text-[#d2a8ff]">$&</span>');

  // Strings
  escaped = escaped.replace(/&quot;.*?&quot;/g, '<span class="text-[#a5d6ff]">$&</span>');

  // NULL / Pointer arrow
  escaped = escaped.replace(/\bNULL\b/g, '<span class="text-[#79c0ff] font-bold">NULL</span>');
  escaped = escaped.replace(/-&gt;/g, '<span class="text-[#79c0ff] font-bold">-&gt;</span>');

  return escaped;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
