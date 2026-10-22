import { QuizQuestion, UnitId } from '@/types/dsa';

export const UNIT_QUIZZES: Record<UnitId, QuizQuestion[]> = {
  'unit-1': [
    {
      id: 1,
      title: 'Direct Memory Address Offset',
      scenario: 'An integer array begins at memory address 0x2000. Each integer takes 4 bytes in C. Which physical address stores arr[4]?',
      question: 'What is the memory address of arr[4]?',
      options: [
        {
          text: '0x2010',
          isCorrect: true,
          explanation: 'Correct! Address = Base + (index * sizeof(int)) = 0x2000 + (4 * 4) = 0x2000 + 16 (0x10) = 0x2010.',
        },
        {
          text: '0x2004',
          isCorrect: false,
          explanation: 'Incorrect. 0x2004 is the address of arr[1].',
        },
        {
          text: '0x2016',
          isCorrect: false,
          explanation: 'Incorrect. 4 * 4 = 16 bytes in decimal, which is 0x10 in hexadecimal.',
        },
      ],
    },
    {
      id: 2,
      title: 'String Null-Termination in C',
      scenario: 'A char array contains "DSA". What is the minimum buffer size required to store this string?',
      question: 'Minimum size of char str[] to hold "DSA"?',
      options: [
        {
          text: '4 bytes (including \\0)',
          isCorrect: true,
          explanation: 'Correct! C strings require a terminating null byte \'\\0\' to mark the end of the character array.',
        },
        {
          text: '3 bytes',
          isCorrect: false,
          explanation: 'Incorrect. Without the \'\\0\' null terminator, string functions will read past the buffer causing undefined behavior.',
        },
        {
          text: '8 bytes',
          isCorrect: false,
          explanation: 'Incorrect. Only 3 visible characters + 1 null terminator = 4 bytes are required.',
        },
      ],
    },
    {
      id: 3,
      title: 'Bitwise Odd/Even Check',
      scenario: 'Given an integer N = 42 (binary 00101010). We evaluate (N & 1). What is the result?',
      question: 'What does (N & 1) return for N = 42?',
      options: [
        {
          text: '0 (Even Number)',
          isCorrect: true,
          explanation: 'Correct! The least significant bit (LSB) of 42 is 0. Since 42 & 1 == 0, the number is even.',
        },
        {
          text: '1 (Odd Number)',
          isCorrect: false,
          explanation: 'Incorrect. 42 is an even number, so its lowest bit is 0.',
        },
        {
          text: '42',
          isCorrect: false,
          explanation: 'Incorrect. Bitwise AND with 1 masks all bits except the LSB.',
        },
      ],
    },
  ],

  'unit-2': [
    {
      id: 1,
      title: 'Binary Search Precondition',
      scenario: 'An array [45, 12, 89, 23, 7] is provided. A student attempts to run Binary Search for target 23.',
      question: 'Will Binary Search operate correctly on this array?',
      options: [
        {
          text: 'No, binary search strictly requires a sorted array.',
          isCorrect: true,
          explanation: 'Correct! Binary search relies on monotonicity to eliminate half the search space. On unsorted inputs, it may discard the target.',
        },
        {
          text: 'Yes, it works on any random array.',
          isCorrect: false,
          explanation: 'Incorrect. Halving requires that all elements to the right of mid are >= arr[mid].',
        },
        {
          text: 'Yes, but it takes O(n) time.',
          isCorrect: false,
          explanation: 'Incorrect. The algorithm will give invalid results or miss existing elements.',
        },
      ],
    },
    {
      id: 2,
      title: 'Selection Sort Swap Efficiency',
      scenario: 'Consider sorting an array of N items where memory writes are extremely expensive (such as Flash memory/EEPROM).',
      question: 'Why might Selection Sort be chosen over Bubble Sort?',
      options: [
        {
          text: 'Selection Sort performs at most O(n) swaps.',
          isCorrect: true,
          explanation: 'Correct! Selection Sort makes at most n - 1 swaps total, whereas Bubble Sort can make up to O(n²) swaps in the worst case.',
        },
        {
          text: 'Selection Sort has lower time complexity.',
          isCorrect: false,
          explanation: 'Incorrect. Both algorithms have O(n²) time complexity.',
        },
        {
          text: 'Selection Sort is a stable sort.',
          isCorrect: false,
          explanation: 'Incorrect. Standard Selection Sort is unstable.',
        },
      ],
    },
    {
      id: 3,
      title: 'Radix Sort Non-Comparison Mechanism',
      scenario: 'Radix Sort processes elements by individual digit places (1s, 10s, 100s...).',
      question: 'Why must the sub-routine sort be stable?',
      options: [
        {
          text: 'Stability preserves the relative order established in earlier digit passes.',
          isCorrect: true,
          explanation: 'Correct! If the intermediate sort were unstable, the sorted order from lower significant digits would be destroyed.',
        },
        {
          text: 'Stability reduces the number of buckets.',
          isCorrect: false,
          explanation: 'Incorrect. The number of buckets is fixed by the radix base (10 for decimal).',
        },
        {
          text: 'It is not required to be stable.',
          isCorrect: false,
          explanation: 'Incorrect. LSD Radix sort completely fails without stability.',
        },
      ],
    },
  ],

  'unit-3': [
    {
      id: 1,
      title: 'Head Insertion Pointer Order',
      scenario: 'A student creates a new node \'new_node\' and executes: head = new_node; new_node->next = head;.',
      question: 'What catastrophic bug does this introduce?',
      options: [
        {
          text: 'The rest of the list is lost (orphaned) and a self-loop is created.',
          isCorrect: true,
          explanation: 'Correct! Overwriting head first loses the reference to the existing list, and new_node->next points to itself.',
        },
        {
          text: 'The node is inserted correctly.',
          isCorrect: false,
          explanation: 'Incorrect. new_node->next must be set to head BEFORE moving head.',
        },
        {
          text: 'It causes a compilation error in C.',
          isCorrect: false,
          explanation: 'Incorrect. It compiles cleanly, but causes a critical runtime memory leak and infinite loop.',
        },
      ],
    },
    {
      id: 2,
      title: 'Circular Linked List End Condition',
      scenario: 'We are traversing a circular singly linked list starting at head.',
      question: 'How do we detect that we have reached the last node?',
      options: [
        {
          text: 'temp->next == head',
          isCorrect: true,
          explanation: 'Correct! In a circular linked list, the last node links back to head rather than NULL.',
        },
        {
          text: 'temp->next == NULL',
          isCorrect: false,
          explanation: 'Incorrect. A circular linked list contains no NULL pointers.',
        },
        {
          text: 'temp == NULL',
          isCorrect: false,
          explanation: 'Incorrect. Checking for NULL will loop forever in a circular list.',
        },
      ],
    },
  ],

  'unit-4': [
    {
      id: 1,
      title: 'Postfix Conversion Precedence',
      scenario: 'Given infix expression: A + B * C. The incoming token is \'*\'. Top of operator stack is \'+\'.',
      question: 'What action should the Shunting-Yard converter take?',
      options: [
        {
          text: 'Push \'*\' onto the stack (since * has higher precedence than +).',
          isCorrect: true,
          explanation: 'Correct! Multiplicative operators (*, /) have higher precedence than additive (+, -), so \'*\' is pushed on top.',
        },
        {
          text: 'Pop \'+\' from the stack to the output.',
          isCorrect: false,
          explanation: 'Incorrect. We only pop when the incoming operator has lower or equal precedence.',
        },
        {
          text: 'Append \'*\' directly to the postfix output.',
          isCorrect: false,
          explanation: 'Incorrect. Operators must be routed through the stack.',
        },
      ],
    },
    {
      id: 2,
      title: 'Recursion Call Stack Growth',
      scenario: 'A recursive function factorial(n) is called with n = 5.',
      question: 'What is the maximum number of activation records on the call stack?',
      options: [
        {
          text: '6 stack frames (from factorial(5) down to factorial(0)).',
          isCorrect: true,
          explanation: 'Correct! Each nested invocation adds an activation frame. When the base case n=0 is reached, 6 frames exist simultaneously.',
        },
        {
          text: '1 stack frame.',
          isCorrect: false,
          explanation: 'Incorrect. Without tail-call elimination, every call creates a new stack frame.',
        },
        {
          text: '5 stack frames.',
          isCorrect: false,
          explanation: 'Incorrect. Including the base case call factorial(0), there are 6 frames.',
        },
      ],
    },
  ],

  'unit-5': [
    {
      id: 1,
      title: 'Linear Queue False Overflow',
      scenario: 'A linear queue of capacity 4 has front = 2, rear = 3. Two slots at indices 0 and 1 are empty.',
      question: 'What happens if we attempt to enqueue a new value?',
      options: [
        {
          text: 'Queue Overflow occurs even though 2 slots are empty!',
          isCorrect: true,
          explanation: 'Correct! In a linear queue, overflow condition is rear == capacity - 1. Freed slots at the front cannot be reused without shifting.',
        },
        {
          text: 'The element is automatically inserted at index 0.',
          isCorrect: false,
          explanation: 'Incorrect. That is the behavior of a circular queue, not a linear queue.',
        },
        {
          text: 'All elements shift left automatically.',
          isCorrect: false,
          explanation: 'Incorrect. Linear queues do not shift elements automatically during enqueue.',
        },
      ],
    },
    {
      id: 2,
      title: 'Circular Queue Modular Arithmetic',
      scenario: 'In a circular queue of capacity 5, rear is currently at index 4.',
      question: 'After enqueuing an element, what is the new rear index?',
      options: [
        {
          text: '0 (since (4 + 1) % 5 = 0).',
          isCorrect: true,
          explanation: 'Correct! The modulo operator wraps the pointer back to the beginning of the circular buffer.',
        },
        {
          text: '5 (Index out of bounds).',
          isCorrect: false,
          explanation: 'Incorrect. The array only has indices 0 through 4.',
        },
        {
          text: '-1.',
          isCorrect: false,
          explanation: 'Incorrect. -1 indicates an empty queue.',
        },
      ],
    },
  ],

  'unit-6': [
    {
      id: 1,
      title: 'BST In-Order Property',
      scenario: 'We perform an In-Order traversal (Left, Root, Right) on any valid Binary Search Tree (BST).',
      question: 'What is guaranteed about the output sequence?',
      options: [
        {
          text: 'The values will be printed in strictly non-decreasing sorted order.',
          isCorrect: true,
          explanation: 'Correct! By definition of a BST, all left descendants are smaller and all right descendants are larger, producing sorted order.',
        },
        {
          text: 'The root node is always printed first.',
          isCorrect: false,
          explanation: 'Incorrect. That is Pre-Order traversal.',
        },
        {
          text: 'The leaf nodes are printed last.',
          isCorrect: false,
          explanation: 'Incorrect. That is Post-Order traversal.',
        },
      ],
    },
    {
      id: 2,
      title: 'Adjacency Matrix Symmetry',
      scenario: 'An undirected graph has 5 vertices. Edge (1, 3) is added.',
      question: 'Which entries in the 5x5 adjacency matrix are set to 1?',
      options: [
        {
          text: 'Both matrix[1][3] and matrix[3][1] = 1.',
          isCorrect: true,
          explanation: 'Correct! Undirected edges are bidirectional, so the adjacency matrix is always symmetric across its main diagonal.',
        },
        {
          text: 'Only matrix[1][3] = 1.',
          isCorrect: false,
          explanation: 'Incorrect. In an undirected graph, connection flows both ways.',
        },
        {
          text: 'All entries in row 1.',
          isCorrect: false,
          explanation: 'Incorrect. Only the connected vertex entry is set.',
        },
      ],
    },
  ],

  'unit-os': [
    {
      id: 1,
      title: 'Page Replacement: FIFO Victim',
      scenario: 'Three frames contain pages [7, 0, 1] in order of arrival. CPU requests page 2.',
      question: 'Which page does FIFO replace?',
      options: [
        {
          text: 'Page 7 (entered earliest)',
          isCorrect: true,
          explanation: 'Correct! Page 7 arrived first, so FIFO evicts it first.',
        },
        {
          text: 'Page 0',
          isCorrect: false,
          explanation: 'Incorrect. Page 0 arrived after 7.',
        },
        {
          text: 'Page 1',
          isCorrect: false,
          explanation: 'Incorrect. Page 1 is the newest page.',
        },
      ],
    },
  ],
};
