'use client';

import React, { useState } from 'react';
import { UnitId } from '@/types/dsa';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

interface DSANavigationHeaderProps {
  activeUnit: UnitId;
  onSelectUnit: (unit: UnitId) => void;
  currentTopicTitle: string;
  progressPercent: number;
  isFullscreen: boolean;
  isMuted: boolean;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onOpenSyllabus: () => void;
  onOpenQR: () => void;
}

export function DSANavigationHeader({
  activeUnit,
  onSelectUnit,
  currentTopicTitle,
  progressPercent,
  isFullscreen,
  isMuted,
  onToggleFullscreen,
  onToggleSound,
  onOpenSyllabus,
  onOpenQR,
}: DSANavigationHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const unitsList: { id: UnitId; label: string; badge: string }[] = [
    { id: 'unit-1', label: 'Unit I: Memory & Intro', badge: 'CO1' },
    { id: 'unit-2', label: 'Unit II: Search & Sort', badge: 'CO2' },
    { id: 'unit-3', label: 'Unit III: Linked Lists', badge: 'CO3' },
    { id: 'unit-4', label: 'Unit IV: Stacks & Recursion', badge: 'CO4' },
    { id: 'unit-5', label: 'Unit V: Queues', badge: 'CO5' },
    { id: 'unit-6', label: 'Unit VI: Trees & Graphs', badge: 'CO6' },
    { id: 'unit-os', label: 'Operating Systems (Bonus)', badge: 'OS' },
  ];

  const currentUnitMeta = unitsList.find((u) => u.id === activeUnit) || unitsList[0];

  return (
    <>
      {/* Top micro progress line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-black/[0.04] dark:bg-white/[0.06] z-50 pointer-events-none">
        <div
          className="h-full bg-[#0071e3] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {/* Floating Apple Navigation Bar */}
      <header className="fixed top-2 sm:top-4 left-3 right-3 sm:left-6 sm:right-6 max-w-6xl mx-auto z-40 flex items-center justify-between px-3 sm:px-5 py-2 rounded-full apple-glass shadow-[0_4px_24px_rgba(0,0,0,0.06)] select-none transition-colors duration-300">
        {/* Left: Brand & Unit Picker */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectUnit('unit-1')}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] animate-pulse" />
            <span className="font-semibold text-xs tracking-tight text-[var(--foreground)] hidden md:inline">
              DSA Visual Lab
            </span>
          </div>

          <span className="text-[#86868b] text-xs hidden md:inline">•</span>

          {/* Unit Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.click();
                setShowUnitDropdown(!showUnitDropdown);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[var(--foreground)] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
              <span className="font-semibold">{currentUnitMeta.label.split(':')[0]}</span>
              <ChevronDown className="w-3 h-3 text-[#86868b]" />
            </button>

            {showUnitDropdown && (
              <div
                className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowUnitDropdown(false)}
              >
                {unitsList.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      sound.click();
                      onSelectUnit(u.id);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                      activeUnit === u.id
                        ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold'
                        : 'text-[var(--foreground)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{u.label}</span>
                    <span className="text-[10px] font-mono opacity-60">{u.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-[#86868b] truncate max-w-[150px] sm:max-w-[220px] hidden lg:inline font-normal">
            / {currentTopicTitle}
          </span>
        </div>

        {/* Right Tools: Syllabus, Audio, Theme, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Syllabus modal button */}
          <button
            onClick={() => {
              sound.click();
              onOpenSyllabus();
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium text-[#0071e3] hover:bg-[#0071e3]/10 transition-colors cursor-pointer"
            title="View MIT-WPU CSE00370 Academic Syllabus"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Syllabus</span>
          </button>

          {/* Phone Companion QR */}
          <button
            onClick={() => {
              sound.click();
              onOpenQR();
            }}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Mobile Companion QR"
          >
            <Smartphone className="w-4 h-4 text-[#0071e3]" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.click();
              onToggleSound();
            }}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#ff3b30]" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              sound.click();
              toggleTheme();
            }}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#ffd60a]" /> : <Moon className="w-4 h-4 text-[#1d1d1f]" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              sound.click();
              onToggleFullscreen();
            }}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[var(--foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Presentation Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>
    </>
  );
}
