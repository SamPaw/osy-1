import { BaseSimulationStep, ComplexityInfo } from '@/types/dsa';

export interface SearchSimulationStep extends BaseSimulationStep {
  array: (number | string)[];
  target: number | string;
  foundIndex: number | null;
  low?: number;
  mid?: number;
  high?: number;
  comparisonsCount: number;
  eliminatedIndices?: number[];
  isTargetFound: boolean;
}

export interface SortSimulationStep extends BaseSimulationStep {
  array: number[];
  comparingIndices?: [number, number];
  swappingIndices?: [number, number];
  sortedIndices: number[];
  pivotIndex?: number;
  comparisonsCount: number;
  swapsCount: number;
  currentPass?: number;
  bucketState?: { digit: number; buckets: number[][] };
}

// -------------------------------------------------------------
// SEARCHING ALGORITHMS
// -------------------------------------------------------------

export function simulateLinearSearch(
  arr: (number | string)[],
  target: number | string
): { steps: SearchSimulationStep[]; foundIndex: number | null } {
  const steps: SearchSimulationStep[] = [];
  let compCount = 0;
  let found = -1;

  steps.push({
    stepIndex: 0,
    title: 'Initialize Linear Search',
    description: `Target is "${target}". Beginning sequential scan from index 0 across ${arr.length} elements.`,
    rationale: 'In C: for (int i = 0; i < n; i++) if (arr[i] == target) return i;',
    array: [...arr],
    target,
    foundIndex: null,
    comparisonsCount: 0,
    isTargetFound: false,
    activePointers: { i: 0 },
    codeLine: 1,
  });

  for (let i = 0; i < arr.length; i++) {
    compCount++;
    const isMatch = arr[i] === target;

    steps.push({
      stepIndex: steps.length,
      title: `Compare arr[${i}] against Target`,
      description: `Examining arr[${i}] = "${arr[i]}". ${
        isMatch ? `MATCH FOUND! Target "${target}" located at index [${i}].` : `Does not match target "${target}". Continuing scan.`
      }`,
      rationale: isMatch ? 'Match found! Halting search with index.' : 'Advancing iterator i to the next contiguous element.',
      array: [...arr],
      target,
      foundIndex: isMatch ? i : null,
      highlightedIndices: [i],
      comparisonsCount: compCount,
      isTargetFound: isMatch,
      activePointers: { i, currentVal: arr[i] },
      isTerminal: isMatch,
      codeLine: isMatch ? 3 : 2,
    });

    if (isMatch) {
      found = i;
      break;
    }
  }

  if (found === -1) {
    steps.push({
      stepIndex: steps.length,
      title: 'Target Not Found (Search Exhausted)',
      description: `Scanned all ${arr.length} elements without finding "${target}". Returned -1.`,
      rationale: 'Worst-case time complexity: O(n) when target is absent.',
      array: [...arr],
      target,
      foundIndex: -1,
      comparisonsCount: compCount,
      isTargetFound: false,
      isTerminal: true,
      codeLine: 5,
    });
  }

  return { steps, foundIndex: found };
}

export function simulateBinarySearch(
  arr: number[],
  target: number
): { steps: SearchSimulationStep[]; foundIndex: number | null; isSorted: boolean } {
  const steps: SearchSimulationStep[] = [];

  // Verify sorted precondition
  const isSorted = arr.every((v, i) => i === 0 || v >= arr[i - 1]);

  let low = 0;
  let high = arr.length - 1;
  let compCount = 0;
  let found = -1;
  const eliminated: number[] = [];

  steps.push({
    stepIndex: 0,
    title: 'Initialize Binary Search',
    description: isSorted
      ? `Search interval: [low: ${low}, high: ${high}]. Array is correctly sorted in ascending order.`
      : `CAUTION: Input array is NOT sorted! Binary search requires a sorted collection to eliminate halves accurately.`,
    rationale: 'Precondition: Array elements must be monotonically non-decreasing.',
    array: [...arr],
    target,
    foundIndex: null,
    low,
    high,
    comparisonsCount: 0,
    isTargetFound: false,
    activePointers: { low, high },
    codeLine: 1,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    compCount++;
    const midVal = arr[mid];

    steps.push({
      stepIndex: steps.length,
      title: `Calculate Midpoint: mid = (${low} + ${high}) / 2 = ${mid}`,
      description: `Inspecting middle element arr[${mid}] = ${midVal}. Comparing with target ${target}.`,
      rationale: 'In C: mid = low + (high - low) / 2 to prevent integer overflow.',
      array: [...arr],
      target,
      foundIndex: null,
      low,
      mid,
      high,
      highlightedIndices: [mid],
      eliminatedIndices: [...eliminated],
      comparisonsCount: compCount,
      isTargetFound: false,
      activePointers: { low, mid, high, midVal },
      codeLine: 3,
    });

    if (midVal === target) {
      steps.push({
        stepIndex: steps.length,
        title: `Target Found at Index [${mid}]!`,
        description: `arr[${mid}] == ${target}. Successfully found in ${compCount} comparison(s).`,
        rationale: 'Search terminates immediately with middle index.',
        array: [...arr],
        target,
        foundIndex: mid,
        low,
        mid,
        high,
        highlightedIndices: [mid],
        eliminatedIndices: [...eliminated],
        comparisonsCount: compCount,
        isTargetFound: true,
        isTerminal: true,
        codeLine: 4,
      });
      found = mid;
      break;
    } else if (midVal < target) {
      // Eliminate left half
      for (let k = low; k <= mid; k++) {
        if (!eliminated.includes(k)) eliminated.push(k);
      }
      steps.push({
        stepIndex: steps.length,
        title: `arr[${mid}] (${midVal}) < Target (${target})`,
        description: `Target must be in the right subarray. Eliminating left range [${low}..${mid}]. Updating low = ${mid + 1}.`,
        rationale: 'Since array is sorted, no element <= mid can equal target.',
        array: [...arr],
        target,
        foundIndex: null,
        low: mid + 1,
        mid,
        high,
        eliminatedIndices: [...eliminated],
        comparisonsCount: compCount,
        isTargetFound: false,
        activePointers: { low: mid + 1, high },
        codeLine: 6,
      });
      low = mid + 1;
    } else {
      // Eliminate right half
      for (let k = mid; k <= high; k++) {
        if (!eliminated.includes(k)) eliminated.push(k);
      }
      steps.push({
        stepIndex: steps.length,
        title: `arr[${mid}] (${midVal}) > Target (${target})`,
        description: `Target must be in the left subarray. Eliminating right range [${mid}..${high}]. Updating high = ${mid - 1}.`,
        rationale: 'Since array is sorted, no element >= mid can equal target.',
        array: [...arr],
        target,
        foundIndex: null,
        low,
        mid,
        high: mid - 1,
        eliminatedIndices: [...eliminated],
        comparisonsCount: compCount,
        isTargetFound: false,
        activePointers: { low, high: mid - 1 },
        codeLine: 8,
      });
      high = mid - 1;
    }
  }

  if (found === -1) {
    steps.push({
      stepIndex: steps.length,
      title: 'Target Absent (low > high)',
      description: `Search interval exhausted (low ${low} > high ${high}). Target ${target} is not in the array.`,
      rationale: 'Binary search achieved worst-case O(log n) efficiency.',
      array: [...arr],
      target,
      foundIndex: -1,
      low,
      high,
      eliminatedIndices: Array.from({ length: arr.length }, (_, i) => i),
      comparisonsCount: compCount,
      isTargetFound: false,
      isTerminal: true,
      codeLine: 10,
    });
  }

  return { steps, foundIndex: found, isSorted };
}

// -------------------------------------------------------------
// SORTING ALGORITHMS
// -------------------------------------------------------------

export function simulateBubbleSort(initialArray: number[]): { steps: SortSimulationStep[]; finalArray: number[] } {
  const steps: SortSimulationStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  steps.push({
    stepIndex: 0,
    title: 'Initialize Bubble Sort',
    description: `Array of ${n} elements loaded. Bubble sort makes adjacent comparisons, floating larger values rightward.`,
    rationale: 'In C: for (int i = 0; i < n - 1; i++) for (int j = 0; j < n - i - 1; j++) ...',
    array: [...arr],
    sortedIndices: [],
    comparisonsCount: 0,
    swapsCount: 0,
    currentPass: 1,
    codeLine: 1,
  });

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const needSwap = arr[j] > arr[j + 1];

      steps.push({
        stepIndex: steps.length,
        title: `Pass ${i + 1}: Compare arr[${j}] (${arr[j]}) & arr[${j + 1}] (${arr[j + 1]})`,
        description: needSwap
          ? `${arr[j]} > ${arr[j + 1]}: Out of order. Swapping positions!`
          : `${arr[j]} <= ${arr[j + 1]}: In correct relative order. No swap.`,
        rationale: 'Comparing adjacent elements to propagate the maximum element to the right.',
        array: [...arr],
        comparingIndices: [j, j + 1],
        sortedIndices: [...sorted],
        comparisonsCount: comparisons,
        swapsCount: swaps,
        currentPass: i + 1,
        activePointers: { j, 'j+1': j + 1 },
        codeLine: 3,
      });

      if (needSwap) {
        swaps++;
        swappedInPass = true;
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        steps.push({
          stepIndex: steps.length,
          title: `Swap: Exchanged arr[${j}] and arr[${j + 1}]`,
          description: `Array state updated: [${arr.join(', ')}].`,
          rationale: 'int temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;',
          array: [...arr],
          swappingIndices: [j, j + 1],
          sortedIndices: [...sorted],
          comparisonsCount: comparisons,
          swapsCount: swaps,
          currentPass: i + 1,
          codeLine: 4,
        });
      }
    }

    sorted.push(n - 1 - i);

    if (!swappedInPass) {
      steps.push({
        stepIndex: steps.length,
        title: 'Optimized Early Termination',
        description: `Pass ${i + 1} completed with zero swaps. Array is already completely sorted!`,
        rationale: 'Best-case optimization: O(n) time when input is pre-sorted.',
        array: [...arr],
        sortedIndices: Array.from({ length: n }, (_, k) => k),
        comparisonsCount: comparisons,
        swapsCount: swaps,
        currentPass: i + 1,
        isTerminal: true,
        codeLine: 6,
      });
      return { steps, finalArray: arr };
    }
  }

  sorted.push(0);
  steps.push({
    stepIndex: steps.length,
    title: 'Bubble Sort Complete',
    description: `All passes finished. Total comparisons: ${comparisons}, swaps: ${swaps}.`,
    rationale: 'Quadratic time O(n²) in worst/average case.',
    array: [...arr],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    comparisonsCount: comparisons,
    swapsCount: swaps,
    isTerminal: true,
    codeLine: 8,
  });

  return { steps, finalArray: arr };
}

export function simulateSelectionSort(initialArray: number[]): { steps: SortSimulationStep[]; finalArray: number[] } {
  const steps: SortSimulationStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  steps.push({
    stepIndex: 0,
    title: 'Initialize Selection Sort',
    description: `Starting selection sort on ${n} items. In each pass, finds the minimum item in unsorted suffix and exchanges it with index i.`,
    rationale: 'In C: for (int i = 0; i < n - 1; i++) { int min_idx = i; ... }',
    array: [...arr],
    sortedIndices: [],
    comparisonsCount: 0,
    swapsCount: 0,
    currentPass: 1,
    codeLine: 1,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      stepIndex: steps.length,
      title: `Pass ${i + 1}: Assume Minimum is at Index [${i}] (${arr[i]})`,
      description: `Scanning unsorted region [${i + 1}..${n - 1}] to locate true minimum.`,
      rationale: 'int min_idx = i;',
      array: [...arr],
      sortedIndices: [...sorted],
      comparisonsCount: comparisons,
      swapsCount: swaps,
      currentPass: i + 1,
      activePointers: { i, minIdx },
      codeLine: 2,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const isSmaller = arr[j] < arr[minIdx];

      steps.push({
        stepIndex: steps.length,
        title: `Compare arr[${j}] (${arr[j]}) with Current Min arr[${minIdx}] (${arr[minIdx]})`,
        description: isSmaller
          ? `New minimum found! Updating minIdx to [${j}] (${arr[j]}).`
          : `${arr[j]} >= ${arr[minIdx]}. Current minimum unchanged.`,
        rationale: 'if (arr[j] < arr[min_idx]) min_idx = j;',
        array: [...arr],
        comparingIndices: [j, minIdx],
        sortedIndices: [...sorted],
        comparisonsCount: comparisons,
        swapsCount: swaps,
        currentPass: i + 1,
        activePointers: { i, j, minIdx: isSmaller ? j : minIdx },
        codeLine: 4,
      });

      if (isSmaller) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      swaps++;
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        stepIndex: steps.length,
        title: `Swap Minimum (${arr[i]}) into Final Position [${i}]`,
        description: `Exchanged arr[${i}] with arr[${minIdx}]. Element at [${i}] is now permanently sorted.`,
        rationale: 'Swapping minimum into its sorted position.',
        array: [...arr],
        swappingIndices: [i, minIdx],
        sortedIndices: [...sorted, i],
        comparisonsCount: comparisons,
        swapsCount: swaps,
        currentPass: i + 1,
        codeLine: 6,
      });
    }

    sorted.push(i);
  }

  sorted.push(n - 1);
  steps.push({
    stepIndex: steps.length,
    title: 'Selection Sort Complete',
    description: `Sorted in ${comparisons} comparisons and ${swaps} swaps. Makes at most O(n) swaps.`,
    rationale: 'Always makes n*(n-1)/2 comparisons regardless of initial ordering: Θ(n²).',
    array: [...arr],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    comparisonsCount: comparisons,
    swapsCount: swaps,
    isTerminal: true,
    codeLine: 8,
  });

  return { steps, finalArray: arr };
}

export function simulateInsertionSort(initialArray: number[]): { steps: SortSimulationStep[]; finalArray: number[] } {
  const steps: SortSimulationStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let shifts = 0;
  const sorted: number[] = [0];

  steps.push({
    stepIndex: 0,
    title: 'Initialize Insertion Sort',
    description: `Initial single-element subarray [arr[0]: ${arr[0]}] is trivially sorted. Iterating from index 1 to insert each key into sorted prefix.`,
    rationale: 'In C: for (int i = 1; i < n; i++) { int key = arr[i]; int j = i - 1; ... }',
    array: [...arr],
    sortedIndices: [0],
    comparisonsCount: 0,
    swapsCount: 0,
    currentPass: 1,
    codeLine: 1,
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      stepIndex: steps.length,
      title: `Pick Key = ${key} at Index [${i}]`,
      description: `Will compare key (${key}) backwards through sorted prefix [0..${i - 1}].`,
      rationale: 'int key = arr[i]; int j = i - 1;',
      array: [...arr],
      sortedIndices: [...sorted],
      comparisonsCount: comparisons,
      swapsCount: shifts,
      currentPass: i,
      activePointers: { i, key, j },
      codeLine: 2,
    });

    while (j >= 0) {
      comparisons++;
      if (arr[j] > key) {
        shifts++;
        arr[j + 1] = arr[j];

        steps.push({
          stepIndex: steps.length,
          title: `Shift arr[${j}] (${arr[j]}) Rightward to arr[${j + 1}]`,
          description: `${arr[j]} > ${key}: Making room for key ${key}.`,
          rationale: 'arr[j + 1] = arr[j]; j--;',
          array: [...arr],
          swappingIndices: [j, j + 1],
          sortedIndices: [...sorted],
          comparisonsCount: comparisons,
          swapsCount: shifts,
          currentPass: i,
          activePointers: { j, key },
          codeLine: 4,
        });

        j--;
      } else {
        steps.push({
          stepIndex: steps.length,
          title: `Found Insert Position for Key (${key})`,
          description: `arr[${j}] (${arr[j]}) <= ${key}. Correct slot is index [${j + 1}].`,
          rationale: 'Loop breaks; element <= key found.',
          array: [...arr],
          sortedIndices: [...sorted],
          comparisonsCount: comparisons,
          swapsCount: shifts,
          currentPass: i,
          activePointers: { insertPos: j + 1, key },
          codeLine: 5,
        });
        break;
      }
    }

    arr[j + 1] = key;
    sorted.push(i);

    steps.push({
      stepIndex: steps.length,
      title: `Inserted Key (${key}) at arr[${j + 1}]`,
      description: `Prefix [0..${i}] is now sorted: [${arr.slice(0, i + 1).join(', ')}].`,
      rationale: 'arr[j + 1] = key;',
      array: [...arr],
      sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      comparisonsCount: comparisons,
      swapsCount: shifts,
      currentPass: i,
      codeLine: 6,
    });
  }

  steps.push({
    stepIndex: steps.length,
    title: 'Insertion Sort Complete',
    description: `Entire array is sorted in ${comparisons} comparisons and ${shifts} shifts.`,
    rationale: 'Excellent performance for nearly-sorted inputs: O(n) best-case.',
    array: [...arr],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    comparisonsCount: comparisons,
    swapsCount: shifts,
    isTerminal: true,
    codeLine: 8,
  });

  return { steps, finalArray: arr };
}

export function simulateQuickSort(initialArray: number[]): { steps: SortSimulationStep[]; finalArray: number[] } {
  const steps: SortSimulationStep[] = [];
  const arr = [...initialArray];
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  steps.push({
    stepIndex: 0,
    title: 'Initialize Quick Sort',
    description: `Using Lomuto partition scheme with rightmost element as pivot. Divide-and-conquer strategy.`,
    rationale: 'In C: void quick_sort(int arr[], int low, int high) { ... }',
    array: [...arr],
    sortedIndices: [],
    comparisonsCount: 0,
    swapsCount: 0,
    codeLine: 1,
  });

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      stepIndex: steps.length,
      title: `Subarray [${low}..${high}]: Selected Pivot arr[${high}] = ${pivot}`,
      description: `Partitioning elements: all values <= ${pivot} will move left of pivot; values > ${pivot} will move right.`,
      rationale: 'int pivot = arr[high]; int i = low - 1;',
      array: [...arr],
      sortedIndices: [...sorted],
      pivotIndex: high,
      comparisonsCount: comparisons,
      swapsCount: swaps,
      activePointers: { low, high, pivot, i },
      codeLine: 2,
    });

    for (let j = low; j < high; j++) {
      comparisons++;
      const isLessEqual = arr[j] <= pivot;

      steps.push({
        stepIndex: steps.length,
        title: `Compare arr[${j}] (${arr[j]}) with Pivot (${pivot})`,
        description: isLessEqual
          ? `${arr[j]} <= ${pivot}: Increment i to ${i + 1} and swap arr[${i + 1}] with arr[${j}].`
          : `${arr[j]} > ${pivot}: Belongs in right partition. Advance scan pointer j.`,
        rationale: 'if (arr[j] <= pivot) { i++; swap(&arr[i], &arr[j]); }',
        array: [...arr],
        comparingIndices: [j, high],
        sortedIndices: [...sorted],
        pivotIndex: high,
        comparisonsCount: comparisons,
        swapsCount: swaps,
        activePointers: { j, i, pivot },
        codeLine: 4,
      });

      if (isLessEqual) {
        i++;
        if (i !== j) {
          swaps++;
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;

          steps.push({
            stepIndex: steps.length,
            title: `Swap arr[${i}] (${arr[i]}) & arr[${j}] (${arr[j]})`,
            description: `Placing ${arr[i]} into the <= pivot partition.`,
            rationale: 'swap(&arr[i], &arr[j]);',
            array: [...arr],
            swappingIndices: [i, j],
            sortedIndices: [...sorted],
            pivotIndex: high,
            comparisonsCount: comparisons,
            swapsCount: swaps,
            codeLine: 5,
          });
        }
      }
    }

    // Place pivot at i + 1
    swaps++;
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    const finalPivotPos = i + 1;
    sorted.push(finalPivotPos);

    steps.push({
      stepIndex: steps.length,
      title: `Place Pivot (${pivot}) at Partition Index [${finalPivotPos}]`,
      description: `Pivot is now in its permanently sorted position. Left side: <= ${pivot}, Right side: > ${pivot}.`,
      rationale: 'swap(&arr[i + 1], &arr[high]); return i + 1;',
      array: [...arr],
      swappingIndices: [finalPivotPos, high],
      sortedIndices: [...sorted],
      pivotIndex: finalPivotPos,
      comparisonsCount: comparisons,
      swapsCount: swaps,
      codeLine: 7,
    });

    return finalPivotPos;
  }

  function quickSortHelper(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    } else if (low === high) {
      if (!sorted.includes(low)) sorted.push(low);
    }
  }

  quickSortHelper(0, arr.length - 1);

  steps.push({
    stepIndex: steps.length,
    title: 'Quick Sort Complete',
    description: `All recursive partitions finalized. Total comparisons: ${comparisons}, swaps: ${swaps}.`,
    rationale: 'Average time complexity: O(n log n). Auxiliary call stack space: O(log n).',
    array: [...arr],
    sortedIndices: Array.from({ length: arr.length }, (_, k) => k),
    comparisonsCount: comparisons,
    swapsCount: swaps,
    isTerminal: true,
    codeLine: 9,
  });

  return { steps, finalArray: arr };
}

export function simulateRadixSort(initialArray: number[]): { steps: SortSimulationStep[]; finalArray: number[] } {
  const steps: SortSimulationStep[] = [];
  const arr = [...initialArray];
  const maxVal = Math.max(...arr, 0);

  steps.push({
    stepIndex: 0,
    title: 'Initialize Radix Sort (LSD)',
    description: `Non-comparative sorting using 10 digit buckets (0–9). Maximum value is ${maxVal}.`,
    rationale: 'In C: for (int exp = 1; max / exp > 0; exp *= 10) countingSort(arr, n, exp);',
    array: [...arr],
    sortedIndices: [],
    comparisonsCount: 0,
    swapsCount: 0,
    codeLine: 1,
  });

  let exp = 1;
  let pass = 1;

  while (Math.floor(maxVal / exp) > 0) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);

    steps.push({
      stepIndex: steps.length,
      title: `Pass ${pass}: Distribute Elements by Digit (exp = ${exp})`,
      description: `Grouping elements according to digit at place value ${exp} (1s, 10s, 100s...).`,
      rationale: 'int digit = (arr[i] / exp) % 10;',
      array: [...arr],
      sortedIndices: [],
      comparisonsCount: 0,
      swapsCount: 0,
      currentPass: pass,
      bucketState: { digit: exp, buckets: buckets.map((b) => [...b]) },
      codeLine: 2,
    });

    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      buckets[digit].push(arr[i]);

      steps.push({
        stepIndex: steps.length,
        title: `Distribute arr[${i}] = ${arr[i]} → Bucket [${digit}]`,
        description: `(${arr[i]} / ${exp}) % 10 = ${digit}. Placed in Bucket ${digit}.`,
        rationale: 'Appending to digit queue preserves relative stability.',
        array: [...arr],
        highlightedIndices: [i],
        sortedIndices: [],
        comparisonsCount: 0,
        swapsCount: 0,
        currentPass: pass,
        bucketState: { digit: exp, buckets: buckets.map((b) => [...b]) },
        codeLine: 3,
      });
    }

    // Collect buckets back into array
    let idx = 0;
    for (let d = 0; d < 10; d++) {
      for (const val of buckets[d]) {
        arr[idx++] = val;
      }
    }

    steps.push({
      stepIndex: steps.length,
      title: `Pass ${pass} Complete: Stable Bucket Collection`,
      description: `Gathered elements from buckets 0 through 9 in FIFO order. Array is now sorted up to digit place ${exp}: [${arr.join(', ')}].`,
      rationale: 'Stability is vital: items with identical current digits retain previous ordering.',
      array: [...arr],
      sortedIndices: [],
      comparisonsCount: 0,
      swapsCount: 0,
      currentPass: pass,
      bucketState: { digit: exp, buckets: buckets.map((b) => [...b]) },
      codeLine: 5,
    });

    exp *= 10;
    pass++;
  }

  steps.push({
    stepIndex: steps.length,
    title: 'Radix Sort Complete',
    description: `All digit passes complete. Final sorted array: [${arr.join(', ')}].`,
    rationale: 'Linear time complexity O(d * (n + b)) where d = max digits, b = base 10.',
    array: [...arr],
    sortedIndices: Array.from({ length: arr.length }, (_, k) => k),
    comparisonsCount: 0,
    swapsCount: 0,
    isTerminal: true,
    codeLine: 7,
  });

  return { steps, finalArray: arr };
}

// Complexity references
export const ALGO_COMPLEXITIES: Record<string, ComplexityInfo> = {
  'linear-search': {
    bestTime: 'O(1)',
    averageTime: 'O(n)',
    worstTime: 'O(n)',
    spaceComplexity: 'O(1)',
    explanation: 'Scans each element sequentially until target is found or array ends.',
    assumptions: 'Works on unsorted arrays. Best case occurs when target is at index 0.',
  },
  'binary-search': {
    bestTime: 'O(1)',
    averageTime: 'O(log n)',
    worstTime: 'O(log n)',
    spaceComplexity: 'O(1)',
    explanation: 'Halves the search range on each iteration by comparing target with middle element.',
    assumptions: 'Requires array to be pre-sorted. Best case when target is at exact midpoint.',
  },
  'bubble-sort': {
    bestTime: 'O(n)',
    averageTime: 'O(n²)',
    worstTime: 'O(n²)',
    spaceComplexity: 'O(1)',
    explanation: 'Repeatedly compares and swaps adjacent elements. Optimized version stops early if no swaps occurred.',
    assumptions: 'Stable sorting algorithm. Best case O(n) achieved with pre-sorted array and swapped flag.',
  },
  'selection-sort': {
    bestTime: 'O(n²)',
    averageTime: 'O(n²)',
    worstTime: 'O(n²)',
    spaceComplexity: 'O(1)',
    explanation: 'Finds minimum element in unsorted section and swaps it with the first unsorted index.',
    assumptions: 'Always performs n*(n-1)/2 comparisons, but minimizes write operations to at most n swaps.',
  },
  'insertion-sort': {
    bestTime: 'O(n)',
    averageTime: 'O(n²)',
    worstTime: 'O(n²)',
    spaceComplexity: 'O(1)',
    explanation: 'Builds sorted prefix one element at a time, shifting larger elements rightward.',
    assumptions: 'Stable, in-place, adaptive. Very fast O(n) on nearly sorted inputs.',
  },
  'quick-sort': {
    bestTime: 'O(n log n)',
    averageTime: 'O(n log n)',
    worstTime: 'O(n²)',
    spaceComplexity: 'O(log n)',
    explanation: 'Selects pivot, partitions array into smaller/larger halves, and recurses.',
    assumptions: 'In-place but unstable. Worst case O(n²) occurs if pivot is always the extreme element.',
  },
  'radix-sort': {
    bestTime: 'O(d · (n + k))',
    averageTime: 'O(d · (n + k))',
    worstTime: 'O(d · (n + k))',
    spaceComplexity: 'O(n + k)',
    explanation: 'Non-comparative integer sort that processes individual digits from least to most significant.',
    assumptions: 'Stable. Requires positive integers or fixed-length strings. k = base (10).',
  },
};
