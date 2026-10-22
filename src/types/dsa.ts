export type UnitId = 'unit-1' | 'unit-2' | 'unit-3' | 'unit-4' | 'unit-5' | 'unit-6' | 'unit-os';

export interface ComplexityInfo {
  bestTime: string;
  averageTime: string;
  worstTime: string;
  spaceComplexity: string;
  explanation: string;
  assumptions?: string;
}

export interface QuizQuestion {
  id: number;
  title: string;
  question: string;
  scenario?: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface BaseSimulationStep {
  stepIndex: number;
  title: string;
  description: string;
  rationale: string;
  highlightedIndices?: number[];
  activePointers?: Record<string, number | string | null>;
  codeLine?: number;
  isTerminal?: boolean;
}

export interface CurriculumUnitMeta {
  id: UnitId;
  unitNumber: string;
  title: string;
  subtitle: string;
  courseOutcome: string;
  hours: number;
  marks: number;
  topics: string[];
  subtopics: { id: string; name: string }[];
}
