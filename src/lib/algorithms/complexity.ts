export interface ComplexityModel {
  name: string;
  notation: string;
  color: string;
  description: string;
  exampleInC: string;
  calcOps: (n: number) => number;
}

export const COMPLEXITY_CLASSES: ComplexityModel[] = [
  {
    name: 'Constant Time',
    notation: 'O(1)',
    color: '#34c759',
    description: 'Execution count does not depend on the input size N. Direct memory index access or bitwise operation.',
    exampleInC: 'int val = arr[5]; // direct pointer offset',
    calcOps: () => 1,
  },
  {
    name: 'Logarithmic Time',
    notation: 'O(log n)',
    color: '#0071e3',
    description: 'Halves the search space at each iteration. Classic example: Binary Search in sorted arrays.',
    exampleInC: 'while (low <= high) { mid = (low + high) / 2; ... }',
    calcOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(1, n)))),
  },
  {
    name: 'Linear Time',
    notation: 'O(n)',
    color: '#5856d6',
    description: 'Operations grow in direct proportion to input size N. Array traversal, Linear Search, strlen.',
    exampleInC: 'for (int i = 0; i < n; i++) { sum += arr[i]; }',
    calcOps: (n) => n,
  },
  {
    name: 'Linearithmic Time',
    notation: 'O(n log n)',
    color: '#ff9500',
    description: 'Optimal comparison-based sorting complexity. Quick Sort average case, Merge Sort.',
    exampleInC: 'quick_sort(arr, 0, n - 1); // divide and conquer',
    calcOps: (n) => Math.max(1, Math.round(n * Math.log2(Math.max(2, n)))),
  },
  {
    name: 'Quadratic Time',
    notation: 'O(n²)',
    color: '#ff3b30',
    description: 'Nested loops over the data. Bubble Sort, Selection Sort, Insertion Sort worst cases.',
    exampleInC: 'for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) ...',
    calcOps: (n) => n * n,
  },
];

export interface ComplexityComparisonRow {
  n: number;
  o1: number;
  oLogN: number;
  oN: number;
  oNLogN: number;
  oN2: number;
}

export function generateComplexityData(nValues: number[] = [1, 2, 4, 8, 16, 32, 64, 128]): ComplexityComparisonRow[] {
  return nValues.map((n) => ({
    n,
    o1: 1,
    oLogN: Math.max(1, Math.round(Math.log2(n))),
    oN: n,
    oNLogN: Math.round(n * Math.log2(Math.max(1, n))),
    oN2: n * n,
  }));
}
