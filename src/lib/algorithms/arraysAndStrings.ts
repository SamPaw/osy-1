import { BaseSimulationStep } from '@/types/dsa';

export interface ArrayMemoryCell {
  index: number;
  value: number | null;
  address: string; // e.g. 0x2000, 0x2004
  state: 'idle' | 'highlight' | 'compare' | 'shift' | 'insert' | 'delete';
}

export interface ArraySimulationStep extends BaseSimulationStep {
  cells: ArrayMemoryCell[];
  capacity: number;
  length: number;
  operationType: 'access' | 'traverse' | 'insert' | 'delete' | 'shift';
}

export function simulateArrayOperation(
  initialArray: number[],
  capacity: number,
  operation: 'traverse' | 'access' | 'insert' | 'delete',
  payload?: { index?: number; value?: number }
): { steps: ArraySimulationStep[]; finalArray: number[] } {
  const steps: ArraySimulationStep[] = [];
  const baseAddress = 0x2000;
  const elementSize = 4; // 4 bytes for int in C

  const createCells = (
    arr: (number | null)[],
    states?: Record<number, ArrayMemoryCell['state']>
  ): ArrayMemoryCell[] => {
    return Array.from({ length: capacity }, (_, i) => ({
      index: i,
      value: i < arr.length ? arr[i] : null,
      address: `0x${(baseAddress + i * elementSize).toString(16).toUpperCase()}`,
      state: states?.[i] || 'idle',
    }));
  };

  const currentArr: (number | null)[] = [...initialArray];

  if (operation === 'traverse') {
    steps.push({
      stepIndex: 0,
      title: 'Initialize Array Traversal',
      description: `Starting sequential traversal through ${currentArr.length} initialized elements.`,
      rationale: 'In C: for (int i = 0; i < size; i++) { printf("%d ", arr[i]); }',
      cells: createCells(currentArr),
      capacity,
      length: currentArr.length,
      operationType: 'traverse',
      activePointers: { i: 0 },
      codeLine: 1,
    });

    for (let i = 0; i < currentArr.length; i++) {
      steps.push({
        stepIndex: steps.length,
        title: `Visiting Element at Index [${i}]`,
        description: `Inspecting arr[${i}] = ${currentArr[i]} at physical address 0x${(baseAddress + i * elementSize).toString(16).toUpperCase()}`,
        rationale: `Memory address calculated in O(1): Base (0x${baseAddress.toString(16).toUpperCase()}) + (${i} * ${elementSize} bytes)`,
        cells: createCells(currentArr, { [i]: 'highlight' }),
        capacity,
        length: currentArr.length,
        operationType: 'traverse',
        highlightedIndices: [i],
        activePointers: { i, value: currentArr[i] ?? 0 },
        codeLine: 2,
      });
    }

    steps.push({
      stepIndex: steps.length,
      title: 'Traversal Complete',
      description: `Successfully visited all ${currentArr.length} elements in O(n) linear time.`,
      rationale: 'Every element was accessed exactly once through contiguous memory offsets.',
      cells: createCells(currentArr),
      capacity,
      length: currentArr.length,
      operationType: 'traverse',
      isTerminal: true,
      codeLine: 4,
    });
  } else if (operation === 'access') {
    const targetIdx = payload?.index ?? 0;
    const clampedIdx = Math.max(0, Math.min(capacity - 1, targetIdx));

    steps.push({
      stepIndex: 0,
      title: `Direct O(1) Index Access: arr[${clampedIdx}]`,
      description: `Computing absolute memory address: Base + (${clampedIdx} * sizeof(int))`,
      rationale: `Direct pointer calculation: *(arr + ${clampedIdx}) without scanning preceding elements.`,
      cells: createCells(currentArr),
      capacity,
      length: currentArr.length,
      operationType: 'access',
      activePointers: { target: clampedIdx },
      codeLine: 1,
    });

    if (clampedIdx < currentArr.length) {
      steps.push({
        stepIndex: 1,
        title: `Found Value: ${currentArr[clampedIdx]}`,
        description: `Memory cell at 0x${(baseAddress + clampedIdx * elementSize).toString(16).toUpperCase()} contains value ${currentArr[clampedIdx]}.`,
        rationale: 'Constant time access O(1) guaranteed because array elements are stored contiguously in physical RAM.',
        cells: createCells(currentArr, { [clampedIdx]: 'highlight' }),
        capacity,
        length: currentArr.length,
        operationType: 'access',
        highlightedIndices: [clampedIdx],
        activePointers: { target: clampedIdx, value: currentArr[clampedIdx] ?? 0 },
        isTerminal: true,
        codeLine: 2,
      });
    } else {
      steps.push({
        stepIndex: 1,
        title: 'Uninitialized / Out-of-bounds Access',
        description: `Index ${clampedIdx} is outside the active length (${currentArr.length}) of the array!`,
        rationale: 'In C, accessing beyond length reads uninitialized garbage memory or triggers a Segmentation Fault.',
        cells: createCells(currentArr, { [clampedIdx]: 'delete' }),
        capacity,
        length: currentArr.length,
        operationType: 'access',
        highlightedIndices: [clampedIdx],
        isTerminal: true,
        codeLine: 3,
      });
    }
  } else if (operation === 'insert') {
    const insertIdx = Math.max(0, Math.min(currentArr.length, payload?.index ?? currentArr.length));
    const val = payload?.value ?? 99;

    if (currentArr.length >= capacity) {
      steps.push({
        stepIndex: 0,
        title: 'Array Capacity Full (Overflow)',
        description: `Cannot insert value ${val}. Array reached maximum capacity (${capacity}).`,
        rationale: 'Static C arrays have fixed capacity. Dynamic resizing requires realloc() on the heap.',
        cells: createCells(currentArr, { [capacity - 1]: 'delete' }),
        capacity,
        length: currentArr.length,
        operationType: 'insert',
        isTerminal: true,
      });
    } else {
      steps.push({
        stepIndex: 0,
        title: `Prepare Insertion of ${val} at Index [${insertIdx}]`,
        description: `To preserve order, existing elements from index ${currentArr.length - 1} down to ${insertIdx} must shift right.`,
        rationale: 'In C: for (int i = size - 1; i >= pos; i--) arr[i + 1] = arr[i];',
        cells: createCells(currentArr),
        capacity,
        length: currentArr.length,
        operationType: 'insert',
        activePointers: { insertPos: insertIdx, newValue: val },
        codeLine: 1,
      });

      // Shifting steps
      const workingArr = [...currentArr];
      for (let i = workingArr.length - 1; i >= insertIdx; i--) {
        workingArr[i + 1] = workingArr[i];
        steps.push({
          stepIndex: steps.length,
          title: `Shift arr[${i}] (${workingArr[i]}) Right to arr[${i + 1}]`,
          description: `Making space at index ${insertIdx}. Moving ${workingArr[i]} one position forward in memory.`,
          rationale: 'Shifting right avoids overwriting adjacent data.',
          cells: createCells(workingArr, { [i]: 'shift', [i + 1]: 'insert' }),
          capacity,
          length: currentArr.length + 1,
          operationType: 'shift',
          highlightedIndices: [i, i + 1],
          codeLine: 2,
        });
      }

      workingArr[insertIdx] = val;
      steps.push({
        stepIndex: steps.length,
        title: `Place New Element ${val} at Index [${insertIdx}]`,
        description: `Assigned arr[${insertIdx}] = ${val}. Total elements incremented to ${workingArr.length}.`,
        rationale: 'Worst-case insertion at index 0 requires shifting all n elements: O(n) time.',
        cells: createCells(workingArr, { [insertIdx]: 'highlight' }),
        capacity,
        length: workingArr.length,
        operationType: 'insert',
        highlightedIndices: [insertIdx],
        isTerminal: true,
        codeLine: 4,
      });

      return {
        steps,
        finalArray: workingArr.filter((x): x is number => x !== null),
      };
    }
  } else if (operation === 'delete') {
    const deleteIdx = Math.max(0, Math.min(currentArr.length - 1, payload?.index ?? 0));

    if (currentArr.length === 0) {
      steps.push({
        stepIndex: 0,
        title: 'Array Empty (Underflow)',
        description: 'Cannot delete from an empty array.',
        rationale: 'Underflow condition: size is 0.',
        cells: createCells(currentArr),
        capacity,
        length: 0,
        operationType: 'delete',
        isTerminal: true,
      });
    } else {
      const deletedVal = currentArr[deleteIdx];
      steps.push({
        stepIndex: 0,
        title: `Delete Element at Index [${deleteIdx}] (${deletedVal})`,
        description: `Removing arr[${deleteIdx}] = ${deletedVal}. Elements from index ${deleteIdx + 1} to ${currentArr.length - 1} must shift left.`,
        rationale: 'In C: for (int i = pos; i < size - 1; i++) arr[i] = arr[i + 1];',
        cells: createCells(currentArr, { [deleteIdx]: 'delete' }),
        capacity,
        length: currentArr.length,
        operationType: 'delete',
        highlightedIndices: [deleteIdx],
        codeLine: 1,
      });

      const workingArr = [...currentArr];
      for (let i = deleteIdx; i < workingArr.length - 1; i++) {
        workingArr[i] = workingArr[i + 1];
        steps.push({
          stepIndex: steps.length,
          title: `Shift arr[${i + 1}] (${workingArr[i]}) Left to arr[${i}]`,
          description: `Closing the gap created by deleted element.`,
          rationale: 'Moving values leftward to maintain contiguous storage.',
          cells: createCells(workingArr, { [i]: 'shift', [i + 1]: 'highlight' }),
          capacity,
          length: currentArr.length - 1,
          operationType: 'shift',
          highlightedIndices: [i, i + 1],
          codeLine: 2,
        });
      }

      workingArr.pop(); // remove last element
      steps.push({
        stepIndex: steps.length,
        title: `Deletion Complete: Removed ${deletedVal}`,
        description: `Array size decremented to ${workingArr.length}. Time complexity: O(n) worst-case.`,
        rationale: 'Contiguity restored without any gaps.',
        cells: createCells(workingArr),
        capacity,
        length: workingArr.length,
        operationType: 'delete',
        isTerminal: true,
        codeLine: 4,
      });

      return {
        steps,
        finalArray: workingArr.filter((x): x is number => x !== null),
      };
    }
  }

  return {
    steps,
    finalArray: currentArr.filter((x): x is number => x !== null),
  };
}

// -------------------------------------------------------------
// STRING LABORATORY ENGINE
// -------------------------------------------------------------

export interface StringCell {
  index: number;
  char: string;
  ascii: number;
  address: string;
  isTerminator: boolean;
  state: 'idle' | 'active' | 'match' | 'swap' | 'done';
}

export interface StringSimulationStep extends BaseSimulationStep {
  str1Cells: StringCell[];
  str2Cells?: StringCell[];
  resultValue?: string | number | boolean;
  functionName: string;
}

export function simulateStringFunction(
  fn: 'strlen' | 'strcmp' | 'strcpy' | 'strrev' | 'strcat' | 'strupr' | 'strlwr' | 'strchr',
  input1: string,
  input2?: string,
  targetChar?: string
): { steps: StringSimulationStep[]; resultSummary: string } {
  const steps: StringSimulationStep[] = [];
  const base1 = 0x3000;
  const base2 = 0x3040;

  const toCells = (str: string, base: number, activeIdx?: number, states?: Record<number, StringCell['state']>): StringCell[] => {
    const chars = str.split('');
    const full = [...chars, '\\0'];
    return full.map((c, i) => ({
      index: i,
      char: c,
      ascii: c === '\\0' ? 0 : c.charCodeAt(0),
      address: `0x${(base + i).toString(16).toUpperCase()}`,
      isTerminator: c === '\\0',
      state: states?.[i] || (i === activeIdx ? 'active' : 'idle'),
    }));
  };

  if (fn === 'strlen') {
    steps.push({
      stepIndex: 0,
      title: 'Initialize strlen(str)',
      description: `Counting characters starting from index 0 until null terminator '\\0' is reached.`,
      rationale: 'In C, strings do not store length separately. strlen loops until *s == \'\\0\'.',
      functionName: 'strlen',
      str1Cells: toCells(input1, base1, 0),
      activePointers: { length: 0 },
      codeLine: 1,
    });

    for (let i = 0; i < input1.length; i++) {
      steps.push({
        stepIndex: steps.length,
        title: `Examining Index [${i}]: '${input1[i]}'`,
        description: `'${input1[i]}' is not '\\0' (ASCII ${input1[i].charCodeAt(0)}). Increment counter to ${i + 1}.`,
        rationale: 'Advancing pointer in O(n) linear scan.',
        functionName: 'strlen',
        str1Cells: toCells(input1, base1, i),
        highlightedIndices: [i],
        activePointers: { index: i, length: i + 1 },
        codeLine: 2,
      });
    }

    // Hit \0
    steps.push({
      stepIndex: steps.length,
      title: "Null Terminator '\\0' Reached",
      description: `Encountered '\\0' at index ${input1.length}. Loop terminates. Length is ${input1.length}.`,
      rationale: "The null byte '\\0' signals the physical end of the C-string.",
      functionName: 'strlen',
      str1Cells: toCells(input1, base1, input1.length, { [input1.length]: 'done' }),
      highlightedIndices: [input1.length],
      activePointers: { result: input1.length },
      resultValue: input1.length,
      isTerminal: true,
      codeLine: 3,
    });

    return { steps, resultSummary: `Length = ${input1.length}` };
  } else if (fn === 'strrev') {
    const chars = input1.split('');
    let left = 0;
    let right = chars.length - 1;

    steps.push({
      stepIndex: 0,
      title: 'Initialize Two-Pointer String Reverse',
      description: `Left pointer at index 0 ('${chars[0]}'), Right pointer at index ${right} ('${chars[right]}').`,
      rationale: 'Swapping opposite ends in O(n/2) = O(n) time and O(1) auxiliary space.',
      functionName: 'strrev',
      str1Cells: toCells(chars.join(''), base1, undefined, { [left]: 'active', [right]: 'active' }),
      activePointers: { left, right },
      codeLine: 1,
    });

    while (left < right) {
      const temp = chars[left];
      chars[left] = chars[right];
      chars[right] = temp;

      steps.push({
        stepIndex: steps.length,
        title: `Swap '${chars[right]}' and '${chars[left]}'`,
        description: `Exchanged character at index ${left} with index ${right}. Advancing left, decrementing right.`,
        rationale: 'char temp = str[left]; str[left] = str[right]; str[right] = temp;',
        functionName: 'strrev',
        str1Cells: toCells(chars.join(''), base1, undefined, { [left]: 'swap', [right]: 'swap' }),
        highlightedIndices: [left, right],
        activePointers: { left, right },
        codeLine: 3,
      });

      left++;
      right--;
    }

    steps.push({
      stepIndex: steps.length,
      title: 'String Reversal Complete',
      description: `Pointers crossed or met in the middle. Reversed string is "${chars.join('')}".`,
      rationale: 'Null terminator remains intact at the final memory position.',
      functionName: 'strrev',
      str1Cells: toCells(chars.join(''), base1, undefined, Object.fromEntries(chars.map((_, i) => [i, 'done']))),
      resultValue: chars.join(''),
      isTerminal: true,
      codeLine: 5,
    });

    return { steps, resultSummary: `Reversed: "${chars.join('')}"` };
  } else if (fn === 'strcmp') {
    const str2 = input2 ?? 'sample';
    steps.push({
      stepIndex: 0,
      title: 'Initialize strcmp(str1, str2)',
      description: `Comparing string 1 ("${input1}") against string 2 ("${str2}") character by character.`,
      rationale: 'Returns 0 if equal, >0 if str1 > str2, <0 if str1 < str2.',
      functionName: 'strcmp',
      str1Cells: toCells(input1, base1, 0),
      str2Cells: toCells(str2, base2, 0),
      codeLine: 1,
    });

    let diff = 0;
    const maxLen = Math.max(input1.length, str2.length) + 1;
    for (let i = 0; i < maxLen; i++) {
      const c1 = i < input1.length ? input1[i] : '\\0';
      const c2 = i < str2.length ? str2[i] : '\\0';
      const code1 = c1 === '\\0' ? 0 : c1.charCodeAt(0);
      const code2 = c2 === '\\0' ? 0 : c2.charCodeAt(0);

      diff = code1 - code2;

      if (diff !== 0 || (c1 === '\\0' && c2 === '\\0')) {
        const isMatch = diff === 0;
        steps.push({
          stepIndex: steps.length,
          title: isMatch ? 'Strings are Identical (Match)' : `Difference Found at Index [${i}]`,
          description: isMatch
            ? `Both strings reached '\\0' simultaneously. Difference = 0.`
            : `'${c1}' (ASCII ${code1}) vs '${c2}' (ASCII ${code2}). Diff = ${diff}.`,
          rationale: isMatch
            ? 'Return 0 (identical).'
            : diff > 0
            ? 'Return > 0 (str1 lexicographically greater).'
            : 'Return < 0 (str1 lexicographically smaller).',
          functionName: 'strcmp',
          str1Cells: toCells(input1, base1, i, { [i]: isMatch ? 'done' : 'swap' }),
          str2Cells: toCells(str2, base2, i, { [i]: isMatch ? 'done' : 'swap' }),
          highlightedIndices: [i],
          resultValue: diff,
          isTerminal: true,
          codeLine: 3,
        });
        break;
      } else {
        steps.push({
          stepIndex: steps.length,
          title: `Index [${i}]: '${c1}' == '${c2}'`,
          description: `ASCII match (${code1}). Moving to next character.`,
          rationale: 'Advancing both pointers.',
          functionName: 'strcmp',
          str1Cells: toCells(input1, base1, i, { [i]: 'match' }),
          str2Cells: toCells(str2, base2, i, { [i]: 'match' }),
          highlightedIndices: [i],
          codeLine: 2,
        });
      }
    }

    return { steps, resultSummary: `strcmp result = ${diff}` };
  } else if (fn === 'strupr' || fn === 'strlwr') {
    const isUpper = fn === 'strupr';
    const chars = input1.split('');

    steps.push({
      stepIndex: 0,
      title: `Initialize ${fn}(str)`,
      description: `Iterating through string to convert each character to ${isUpper ? 'UPPERCASE' : 'lowercase'}.`,
      rationale: isUpper
        ? "In C: if (c >= 'a' && c <= 'z') c = c - 32;"
        : "In C: if (c >= 'A' && c <= 'Z') c = c + 32;",
      functionName: fn,
      str1Cells: toCells(chars.join(''), base1),
      codeLine: 1,
    });

    for (let i = 0; i < chars.length; i++) {
      const orig = chars[i];
      const converted = isUpper ? orig.toUpperCase() : orig.toLowerCase();
      chars[i] = converted;

      steps.push({
        stepIndex: steps.length,
        title: `Index [${i}]: '${orig}' → '${converted}'`,
        description:
          orig === converted
            ? `'${orig}' does not need ASCII case adjustment.`
            : `Adjusted ASCII code: ${orig.charCodeAt(0)} ${isUpper ? '- 32' : '+ 32'} = ${converted.charCodeAt(0)}.`,
        rationale: 'Direct in-place character transformation.',
        functionName: fn,
        str1Cells: toCells(chars.join(''), base1, i, { [i]: 'active' }),
        highlightedIndices: [i],
        codeLine: 2,
      });
    }

    steps.push({
      stepIndex: steps.length,
      title: `${fn} Transformation Finished`,
      description: `Final string in memory: "${chars.join('')}".`,
      rationale: 'In-place conversion completed in O(n) time.',
      functionName: fn,
      str1Cells: toCells(chars.join(''), base1, undefined, Object.fromEntries(chars.map((_, i) => [i, 'done']))),
      resultValue: chars.join(''),
      isTerminal: true,
      codeLine: 4,
    });

    return { steps, resultSummary: `Result: "${chars.join('')}"` };
  } else if (fn === 'strchr') {
    const ch = targetChar || 'A';
    steps.push({
      stepIndex: 0,
      title: `Initialize strchr(str, '${ch}')`,
      description: `Searching for first occurrence of character '${ch}' in "${input1}".`,
      rationale: 'In C: while (*str) { if (*str == ch) return (char*)str; str++; }',
      functionName: 'strchr',
      str1Cells: toCells(input1, base1, 0),
      codeLine: 1,
    });

    let foundIdx = -1;
    for (let i = 0; i < input1.length; i++) {
      const match = input1[i] === ch;
      steps.push({
        stepIndex: steps.length,
        title: `Compare Index [${i}]: '${input1[i]}' vs '${ch}'`,
        description: match
          ? `Match found! '${ch}' located at address 0x${(base1 + i).toString(16).toUpperCase()}.`
          : `'${input1[i]}' != '${ch}'. Advancing pointer.`,
        rationale: match ? 'Return pointer to matched character.' : 'str++;',
        functionName: 'strchr',
        str1Cells: toCells(input1, base1, i, { [i]: match ? 'done' : 'active' }),
        highlightedIndices: [i],
        isTerminal: match,
        codeLine: match ? 3 : 2,
      });
      if (match) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx === -1) {
      steps.push({
        stepIndex: steps.length,
        title: `Character '${ch}' Not Found`,
        description: `Reached '\\0' without finding '${ch}'. Returned NULL.`,
        rationale: 'Return NULL when character is not present in string.',
        functionName: 'strchr',
        str1Cells: toCells(input1, base1, input1.length),
        isTerminal: true,
        codeLine: 4,
      });
    }

    return {
      steps,
      resultSummary: foundIdx !== -1 ? `Found at index ${foundIdx}` : 'Not found (NULL)',
    };
  }

  // Fallback default
  return {
    steps: [
      {
        stepIndex: 0,
        title: `${fn} Ready`,
        description: `Operation ${fn} configured with input "${input1}".`,
        rationale: 'C standard string library operation.',
        functionName: fn,
        str1Cells: toCells(input1, base1),
        isTerminal: true,
      },
    ],
    resultSummary: 'Complete',
  };
}

// -------------------------------------------------------------
// BITWISE MANIPULATION ENGINE
// -------------------------------------------------------------

export interface BitInfo {
  index: number;
  value: 0 | 1;
  weight: number; // 2^index (1, 2, 4, 8, ...)
}

export interface BitwiseSimulationStep extends BaseSimulationStep {
  registerA: BitInfo[];
  registerB?: BitInfo[];
  registerResult: BitInfo[];
  decimalA: number;
  decimalB?: number;
  decimalResult: number;
  operationName: string;
  cExpression: string;
}

export function toBitArray(num: number, bitCount: number = 8): BitInfo[] {
  const bits: BitInfo[] = [];
  const clamped = (num & ((1 << bitCount) - 1)) >>> 0;
  for (let i = bitCount - 1; i >= 0; i--) {
    bits.push({
      index: i,
      value: ((clamped >> i) & 1) as 0 | 1,
      weight: Math.pow(2, i),
    });
  }
  return bits;
}

export function simulateBitwise(
  op: 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT' | 'CHECK_BIT' | 'SET_BIT' | 'CLEAR_BIT' | 'TOGGLE_BIT' | 'ODD_EVEN',
  valA: number,
  valB: number = 0,
  targetBit: number = 2
): { steps: BitwiseSimulationStep[]; finalDecimal: number } {
  const steps: BitwiseSimulationStep[] = [];
  const bitCount = 8;
  const aBits = toBitArray(valA, bitCount);
  let bBits = toBitArray(valB, bitCount);
  let resDecimal = 0;
  let cExpr = '';
  let opName = '';

  switch (op) {
    case 'AND': {
      resDecimal = (valA & valB) & 0xff;
      opName = 'Bitwise AND (&)';
      cExpr = `int result = a & b; // ${valA} & ${valB} = ${resDecimal}`;
      break;
    }
    case 'OR': {
      resDecimal = (valA | valB) & 0xff;
      opName = 'Bitwise OR (|)';
      cExpr = `int result = a | b; // ${valA} | ${valB} = ${resDecimal}`;
      break;
    }
    case 'XOR': {
      resDecimal = (valA ^ valB) & 0xff;
      opName = 'Bitwise XOR (^)';
      cExpr = `int result = a ^ b; // ${valA} ^ ${valB} = ${resDecimal}`;
      break;
    }
    case 'NOT': {
      resDecimal = (~valA) & 0xff;
      opName = 'Bitwise NOT (~)';
      cExpr = `int result = ~a; // ~${valA} (8-bit) = ${resDecimal}`;
      break;
    }
    case 'LSHIFT': {
      const shiftAmt = Math.min(7, Math.max(1, valB || 1));
      resDecimal = (valA << shiftAmt) & 0xff;
      opName = `Left Shift (<< ${shiftAmt})`;
      cExpr = `int result = a << ${shiftAmt}; // ${valA} * 2^${shiftAmt} = ${resDecimal}`;
      break;
    }
    case 'RSHIFT': {
      const shiftAmt = Math.min(7, Math.max(1, valB || 1));
      resDecimal = (valA >> shiftAmt) & 0xff;
      opName = `Right Shift (>> ${shiftAmt})`;
      cExpr = `int result = a >> ${shiftAmt}; // ${valA} / 2^${shiftAmt} = ${resDecimal}`;
      break;
    }
    case 'CHECK_BIT': {
      const isSet = (valA & (1 << targetBit)) !== 0;
      resDecimal = isSet ? 1 : 0;
      opName = `Check Bit ${targetBit}`;
      cExpr = `int is_set = (a & (1 << ${targetBit})) != 0; // Bit ${targetBit} is ${isSet ? 'SET (1)' : 'CLEAR (0)'}`;
      bBits = toBitArray(1 << targetBit, bitCount);
      break;
    }
    case 'SET_BIT': {
      resDecimal = (valA | (1 << targetBit)) & 0xff;
      opName = `Set Bit ${targetBit}`;
      cExpr = `int result = a | (1 << ${targetBit}); // Sets bit ${targetBit} to 1`;
      bBits = toBitArray(1 << targetBit, bitCount);
      break;
    }
    case 'CLEAR_BIT': {
      resDecimal = (valA & ~(1 << targetBit)) & 0xff;
      opName = `Clear Bit ${targetBit}`;
      cExpr = `int result = a & ~(1 << ${targetBit}); // Clears bit ${targetBit} to 0`;
      bBits = toBitArray(~(1 << targetBit), bitCount);
      break;
    }
    case 'TOGGLE_BIT': {
      resDecimal = (valA ^ (1 << targetBit)) & 0xff;
      opName = `Toggle Bit ${targetBit}`;
      cExpr = `int result = a ^ (1 << ${targetBit}); // Inverts bit ${targetBit}`;
      bBits = toBitArray(1 << targetBit, bitCount);
      break;
    }
    case 'ODD_EVEN': {
      const isOdd = (valA & 1) === 1;
      resDecimal = isOdd ? 1 : 0;
      opName = `Check Even / Odd`;
      cExpr = `if (a & 1) printf("Odd"); else printf("Even"); // Result: ${isOdd ? 'Odd' : 'Even'}`;
      bBits = toBitArray(1, bitCount);
      break;
    }
  }

  const resBits = toBitArray(resDecimal, bitCount);

  steps.push({
    stepIndex: 0,
    title: `Initialize ${opName}`,
    description: `Loaded operand A = ${valA} (binary: ${aBits.map((b) => b.value).join('')}).`,
    rationale: 'Hardware registers execute bitwise logic operations in a single CPU cycle O(1).',
    registerA: aBits,
    registerB: op !== 'NOT' ? bBits : undefined,
    registerResult: toBitArray(0, bitCount),
    decimalA: valA,
    decimalB: valB,
    decimalResult: 0,
    operationName: opName,
    cExpression: cExpr,
    codeLine: 1,
  });

  steps.push({
    stepIndex: 1,
    title: `Executed ${opName}`,
    description: `Result register updated to binary: ${resBits.map((b) => b.value).join('')} (decimal: ${resDecimal}).`,
    rationale: cExpr,
    registerA: aBits,
    registerB: op !== 'NOT' ? bBits : undefined,
    registerResult: resBits,
    decimalA: valA,
    decimalB: valB,
    decimalResult: resDecimal,
    operationName: opName,
    cExpression: cExpr,
    isTerminal: true,
    codeLine: 2,
  });

  return { steps, finalDecimal: resDecimal };
}
