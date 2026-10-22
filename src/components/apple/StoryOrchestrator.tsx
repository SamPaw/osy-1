'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StartupExperience } from './StartupExperience';
import { NavigationOverlay } from './NavigationOverlay';
import { QROverlay } from './QROverlay';
import { StoryHero } from './StoryHero';
import { StoryMemoryConstraint } from './StoryMemoryConstraint';
import { StoryPageFault } from './StoryPageFault';
import { StoryFIFO } from './StoryFIFO';
import { StoryThePivot } from './StoryThePivot';
import { StoryLRU } from './StoryLRU';
import { StoryComparison } from './StoryComparison';
import { StoryBelady } from './StoryBelady';
import { StoryComparisonMatrix } from './StoryComparisonMatrix';
import { StoryQuiz } from './StoryQuiz';
import { StorySummary } from './StorySummary';
import { MobileExperience } from './MobileExperience';
import { sound } from '@/lib/sound';

export function StoryOrchestrator() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [isQROpen, setIsQROpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSectionTitle, setActiveSectionTitle] = useState<string>('Overview');

  // Detect mobile on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        // Option to default to mobile mode if opened on phone
      }
    }
  }, []);

  // Track window scroll
  useEffect(() => {
    if (!hasStarted || isMobileMode) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }

      // Detect active section
      const sections = [
        { id: 'sec-hero', title: 'Page Replacement' },
        { id: 'sec-constraint', title: 'Memory Constraint' },
        { id: 'sec-fault', title: 'What is a Page Fault?' },
        { id: 'sec-fifo', title: 'FIFO Simulation' },
        { id: 'sec-pivot', title: 'Arrival vs Recency' },
        { id: 'sec-lru', title: 'LRU Simulation' },
        { id: 'sec-compare', title: 'Synchronous Comparison' },
        { id: 'sec-belady', title: "Belady's Anomaly" },
        { id: 'sec-matrix', title: 'Architectural Matrix' },
        { id: 'sec-quiz', title: 'Whiteboard Challenge' },
        { id: 'sec-summary', title: 'Summary' },
      ];

      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveSectionTitle(s.title);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasStarted, isMobileMode]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        sound.click();
        toggleFullscreen();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        sound.click();
        setIsQROpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsQROpen(false);
      } else if (e.key === ' ' || e.key === 'PageDown' || e.key === 'ArrowDown') {
        if (!hasStarted) {
          setHasStarted(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, toggleFullscreen]);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setIsMuted(!sound.enabled);
  };

  const scrollToFirstSection = () => {
    const el = document.getElementById('sec-constraint');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in initial waiting room
  if (!hasStarted) {
    return (
      <>
        <StartupExperience
          onStart={() => {
            setHasStarted(true);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          onOpenMobile={() => setIsMobileMode(true)}
        />
        <QROverlay isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      </>
    );
  }

  // If mobile companion view
  if (isMobileMode) {
    return (
      <>
        <MobileExperience
          onOpenQR={() => setIsQROpen(true)}
          onSwitchToDesktop={() => setIsMobileMode(false)}
        />
        <QROverlay isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      </>
    );
  }

  // Main Apple-style Storytelling Canvas
  return (
    <div className="w-full bg-[var(--background)] text-[var(--foreground)] relative min-h-screen transition-colors duration-300">
      {/* Discreet floating Apple navigation header */}
      <NavigationOverlay
        currentSectionTitle={activeSectionTitle}
        progressPercent={scrollProgress}
        isFullscreen={isFullscreen}
        isMuted={isMuted}
        onToggleFullscreen={toggleFullscreen}
        onToggleSound={toggleSound}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* Chapters / Story Flow */}
      <main className="w-full flex flex-col items-center">
        {/* Section 1: Hero */}
        <div id="sec-hero" className="w-full">
          <StoryHero onScrollDown={scrollToFirstSection} />
        </div>

        {/* Section 2: Memory Constraint */}
        <div id="sec-constraint" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryMemoryConstraint />
        </div>

        {/* Section 3: Page Fault */}
        <div id="sec-fault" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryPageFault />
        </div>

        {/* Section 4: FIFO Simulation */}
        <div id="sec-fifo" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryFIFO />
        </div>

        {/* Section 5: The Pivot (Arrival vs Recency) */}
        <div id="sec-pivot" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryThePivot />
        </div>

        {/* Section 6: LRU Simulation */}
        <div id="sec-lru" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryLRU />
        </div>

        {/* Section 7: Live Synchronous Comparison */}
        <div id="sec-compare" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryComparison />
        </div>

        {/* Section 8: Belady's Anomaly */}
        <div id="sec-belady" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryBelady />
        </div>

        {/* Section 9: Architectural Matrix */}
        <div id="sec-matrix" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryComparisonMatrix />
        </div>

        {/* Section 10: Whiteboard Quiz */}
        <div id="sec-quiz" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StoryQuiz />
        </div>

        {/* Section 11: Summary */}
        <div id="sec-summary" className="w-full border-t border-black/[0.04] dark:border-white/[0.06]">
          <StorySummary
            onRestart={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveSectionTitle('Page Replacement');
            }}
            onOpenQR={() => setIsQROpen(true)}
          />
        </div>
      </main>

      {/* QR Overlay Sheet */}
      <QROverlay isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
    </div>
  );
}
