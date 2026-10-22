'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UnitId } from '@/types/dsa';
import { CURRICULUM_METADATA } from '@/data/curriculumData';
import { DSANavigationHeader } from './DSANavigationHeader';
import { DSAHomeHero } from './DSAHomeHero';
import { CurriculumSyllabusModal } from './CurriculumSyllabusModal';
import { Unit1IntroVisualizer } from './Unit1IntroVisualizer';
import { Unit2SearchSortVisualizer } from './Unit2SearchSortVisualizer';
import { Unit3LinkedListVisualizer } from './Unit3LinkedListVisualizer';
import { Unit4StackVisualizer } from './Unit4StackVisualizer';
import { Unit5QueueVisualizer } from './Unit5QueueVisualizer';
import { Unit6TreeGraphVisualizer } from './Unit6TreeGraphVisualizer';
import { QROverlay } from '../apple/QROverlay';
import { sound } from '@/lib/sound';

// Preserve the existing OS module as a bonus unit!
import { StoryFIFO } from '../apple/StoryFIFO';
import { StoryLRU } from '../apple/StoryLRU';
import { StoryComparison } from '../apple/StoryComparison';
import { StoryBelady } from '../apple/StoryBelady';

export function DSALearningPlatform() {
  const [activeUnit, setActiveUnit] = useState<UnitId>('unit-1');
  const [isHomeHero, setIsHomeHero] = useState<boolean>(true);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState<boolean>(false);
  const [isQROpen, setIsQROpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Fullscreen helper
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
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        sound.enabled = !sound.enabled;
        setIsMuted(!sound.enabled);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sound.click();
        setIsSyllabusOpen((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        sound.click();
        setIsQROpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSyllabusOpen(false);
        setIsQROpen(false);
      } else if (e.key >= '1' && e.key <= '6') {
        const uId = `unit-${e.key}` as UnitId;
        sound.click();
        setActiveUnit(uId);
        setIsHomeHero(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  const handleSelectUnit = (unit: UnitId) => {
    setActiveUnit(unit);
    setIsHomeHero(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getUnitTitle = () => {
    if (activeUnit === 'unit-os') return 'Operating Systems: Page Replacement';
    const found = CURRICULUM_METADATA.units.find((u) => u.id === activeUnit);
    return found ? `${found.unitNumber}: ${found.title}` : 'DSA Laboratory';
  };

  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] relative flex flex-col items-center select-none transition-colors duration-300">
      {/* Top Floating Apple Header */}
      <DSANavigationHeader
        activeUnit={activeUnit}
        onSelectUnit={handleSelectUnit}
        currentTopicTitle={getUnitTitle()}
        progressPercent={
          activeUnit === 'unit-1'
            ? 16.6
            : activeUnit === 'unit-2'
            ? 33.3
            : activeUnit === 'unit-3'
            ? 50
            : activeUnit === 'unit-4'
            ? 66.6
            : activeUnit === 'unit-5'
            ? 83.3
            : 100
        }
        isFullscreen={isFullscreen}
        isMuted={isMuted}
        onToggleFullscreen={toggleFullscreen}
        onToggleSound={() => {
          sound.enabled = !sound.enabled;
          setIsMuted(!sound.enabled);
        }}
        onOpenSyllabus={() => setIsSyllabusOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center pt-16 sm:pt-20 px-4 sm:px-6">
        {isHomeHero ? (
          <DSAHomeHero
            onStart={() => {
              setIsHomeHero(false);
              setActiveUnit('unit-1');
            }}
            onSelectUnit={handleSelectUnit}
            onOpenSyllabus={() => setIsSyllabusOpen(true)}
          />
        ) : (
          <div className="w-full max-w-6xl flex flex-col items-center">
            {/* Unit Header Badge */}
            <div className="flex flex-col items-center text-center gap-2 pt-4 pb-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#0071e3]">
                MIT-WPU CSE00370 • Scheme 2025-2028
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--foreground)]">
                {getUnitTitle()}
              </h2>
            </div>

            {/* Render Active Unit Visualizer */}
            {activeUnit === 'unit-1' && <Unit1IntroVisualizer />}
            {activeUnit === 'unit-2' && <Unit2SearchSortVisualizer />}
            {activeUnit === 'unit-3' && <Unit3LinkedListVisualizer />}
            {activeUnit === 'unit-4' && <Unit4StackVisualizer />}
            {activeUnit === 'unit-5' && <Unit5QueueVisualizer />}
            {activeUnit === 'unit-6' && <Unit6TreeGraphVisualizer />}

            {/* Preserved OS Bonus Unit */}
            {activeUnit === 'unit-os' && (
              <div className="w-full flex flex-col gap-12 py-6">
                <StoryFIFO />
                <StoryLRU />
                <StoryComparison />
                <StoryBelady />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Academic Curriculum Syllabus Modal */}
      <CurriculumSyllabusModal
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
      />

      {/* Mobile Companion QR Modal */}
      <QROverlay isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
    </div>
  );
}
