import assert from 'node:assert';
import { simulateArrayOperation, simulateStringFunction, simulateBitwise } from '@/lib/algorithms/arraysAndStrings';
import { simulateLinearSearch, simulateBinarySearch, simulateBubbleSort, simulateSelectionSort, simulateInsertionSort, simulateQuickSort, simulateRadixSort } from '@/lib/algorithms/searchingSorting';
import { simulateLinkedListOperation } from '@/lib/algorithms/linkedLists';
import { simulateStackOperations, simulateInfixToPostfix, simulatePostfixEvaluation, simulateRecursiveMultiply } from '@/lib/algorithms/stacks';
import { simulateLinearQueue, simulateCircularQueue } from '@/lib/algorithms/queues';
import { simulateTreeTraversal, generateAdjacencyMatrix, generateAdjacencyList } from '@/lib/algorithms/treesAndGraphs';

console.log('🧪 RUNNING DSA ALGORITHM VERIFICATION SUITE...\n');

// 1. Array Operations
console.log('Testing Unit I: Array, String & Bitwise...');
const arrRes = simulateArrayOperation([10, 20, 30], 5, 'insert', { index: 1, value: 15 });
assert.deepStrictEqual(arrRes.finalArray, [10, 15, 20, 30]);

const delRes = simulateArrayOperation([10, 15, 20, 30], 5, 'delete', { index: 2 });
assert.deepStrictEqual(delRes.finalArray, [10, 15, 30]);

const strLen = simulateStringFunction('strlen', 'MIT-WPU');
assert.strictEqual(strLen.resultSummary, 'Length = 7');

const strRev = simulateStringFunction('strrev', 'ALGO');
assert.strictEqual(strRev.resultSummary, 'Reversed: "OGLA"');

const bitOdd = simulateBitwise('ODD_EVEN', 7);
assert.strictEqual(bitOdd.finalDecimal, 1); // Odd

const bitSet = simulateBitwise('SET_BIT', 4, 0, 1); // 4 = 100b, set bit 1 -> 110b = 6
assert.strictEqual(bitSet.finalDecimal, 6);
console.log('✓ Unit I Passed!');

// 2. Searching & Sorting
console.log('\nTesting Unit II: Searching & Sorting...');
const lSearch = simulateLinearSearch([4, 2, 9, 1, 7], 9);
assert.strictEqual(lSearch.foundIndex, 2);

const bSearch = simulateBinarySearch([1, 3, 5, 7, 9, 11], 7);
assert.strictEqual(bSearch.foundIndex, 3);
assert.strictEqual(bSearch.isSorted, true);

const unsorted = [64, 34, 25, 12, 22, 11, 90];
const expectedSorted = [11, 12, 22, 25, 34, 64, 90];

const bubble = simulateBubbleSort(unsorted);
assert.deepStrictEqual(bubble.finalArray, expectedSorted);

const selection = simulateSelectionSort(unsorted);
assert.deepStrictEqual(selection.finalArray, expectedSorted);

const insertion = simulateInsertionSort(unsorted);
assert.deepStrictEqual(insertion.finalArray, expectedSorted);

const quick = simulateQuickSort(unsorted);
assert.deepStrictEqual(quick.finalArray, expectedSorted);

const radix = simulateRadixSort([170, 45, 75, 90, 802, 24, 2, 66]);
assert.deepStrictEqual(radix.finalArray, [2, 24, 45, 66, 75, 90, 170, 802]);
console.log('✓ Unit II Passed!');

// 3. Linked Lists
console.log('\nTesting Unit III: Linked Lists...');
const llHead = simulateLinkedListOperation([20, 30], 'singly', 'insert_head', { value: 10 });
assert.deepStrictEqual(llHead.finalValues, [10, 20, 30]);

const llTail = simulateLinkedListOperation([10, 20], 'singly', 'insert_tail', { value: 30 });
assert.deepStrictEqual(llTail.finalValues, [10, 20, 30]);

const llDel = simulateLinkedListOperation([10, 20, 30], 'singly', 'delete_head');
assert.deepStrictEqual(llDel.finalValues, [20, 30]);

const llRev = simulateLinkedListOperation([10, 20, 30], 'singly', 'reverse');
assert.deepStrictEqual(llRev.finalValues, [30, 20, 10]);
console.log('✓ Unit III Passed!');

// 4. Stacks & Expressions
console.log('\nTesting Unit IV: Stacks & Recursion...');
const stPush = simulateStackOperations([10, 20], 4, 'push', 30);
assert.deepStrictEqual(stPush.finalElements, [10, 20, 30]);

const stPop = simulateStackOperations([10, 20, 30], 4, 'pop');
assert.deepStrictEqual(stPop.finalElements, [10, 20]);

const infix = simulateInfixToPostfix('(A + B) * C');
assert.strictEqual(infix.postfix, 'AB+C*');

const evalRes = simulatePostfixEvaluation('5 3 + 2 *'); // (5+3)*2 = 16
assert.strictEqual(evalRes.result, 16);

const multRec = simulateRecursiveMultiply(4, 3);
assert.strictEqual(multRec.result, 12);
console.log('✓ Unit IV Passed!');

// 5. Queues
console.log('\nTesting Unit V: Queues (Linear & Circular)...');
const linQ = simulateLinearQueue([null, null, 10, 20], 4, 2, 3, 'enqueue', 50);
assert.strictEqual(linQ.steps[0].isFalseOverflow, true); // False overflow detected!

const circQ = simulateCircularQueue([null, 20, 30, null], 4, 1, 2, 'enqueue', 40);
assert.strictEqual(circQ.finalRear, 3);
const circWrap = simulateCircularQueue([null, 20, 30, 40], 4, 1, 3, 'enqueue', 50);
assert.strictEqual(circWrap.finalRear, 0); // Wrapped around to index 0!
console.log('✓ Unit V Passed!');

// 6. Trees & Graphs
console.log('\nTesting Unit VI: Trees & Graphs...');
const bstVals = [50, 30, 70, 20, 40, 60, 80];
const inOrder = simulateTreeTraversal(bstVals, 'inorder');
assert.deepStrictEqual(inOrder.order, [20, 30, 40, 50, 60, 70, 80]); // Must be sorted in BST!

const preOrder = simulateTreeTraversal(bstVals, 'preorder');
assert.deepStrictEqual(preOrder.order, [50, 30, 20, 40, 70, 60, 80]);

const postOrder = simulateTreeTraversal(bstVals, 'postorder');
assert.deepStrictEqual(postOrder.order, [20, 40, 30, 60, 80, 70, 50]);

const graph = {
  vertices: [{ id: 0, label: 'A', x: 20, y: 20 }, { id: 1, label: 'B', x: 80, y: 20 }, { id: 2, label: 'C', x: 50, y: 80 }],
  edges: [{ u: 0, v: 1 }, { u: 1, v: 2 }],
  isDirected: false,
};
const mat = generateAdjacencyMatrix(graph);
assert.strictEqual(mat[0][1], 1);
assert.strictEqual(mat[1][0], 1);
assert.strictEqual(mat[0][2], 0);

const adj = generateAdjacencyList(graph);
assert.deepStrictEqual(adj[1].neighbors, [0, 2]);
console.log('✓ Unit VI Passed!');

console.log('\n🎉 ALL ALGORITHM ENGINES PASSED 100% OF TESTS!');
