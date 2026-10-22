export interface CCodeSnippet {
  title: string;
  filename: string;
  description: string;
  code: string;
  highlightLines?: number[];
  notes?: string[];
}

export const C_CODE_SNIPPETS: Record<string, CCodeSnippet> = {
  // UNIT 1: Array Operations
  'array-ops': {
    title: 'Array Operations in C (Create, Insert, Delete, Display)',
    filename: 'array_operations.c',
    description: 'Implements sequential traversal, element access by index offset, element insertion with right-shifting, and deletion with left-shifting.',
    code: `#include <stdio.h>
#define MAX 100

// Display all array elements - O(n)
void display(int arr[], int size) {
    printf("Array elements: ");
    for (int i = 0; i < size; i++) {
        printf("%d (at %p) ", arr[i], (void*)&arr[i]);
    }
    printf("\\n");
}

// Insert at index - O(n)
int insertAt(int arr[], int *size, int index, int value) {
    if (*size >= MAX) {
        printf("Error: Array Overflow\\n");
        return -1;
    }
    if (index < 0 || index > *size) {
        printf("Error: Index out of bounds\\n");
        return -1;
    }
    // Shift elements to the right
    for (int i = *size - 1; i >= index; i--) {
        arr[i + 1] = arr[i];
    }
    arr[index] = value;
    (*size)++;
    return 0;
}

// Delete from index - O(n)
int deleteAt(int arr[], int *size, int index) {
    if (*size <= 0) {
        printf("Error: Array Underflow\\n");
        return -1;
    }
    if (index < 0 || index >= *size) {
        printf("Error: Index out of bounds\\n");
        return -1;
    }
    int deleted = arr[index];
    // Shift elements to the left
    for (int i = index; i < *size - 1; i++) {
        arr[i] = arr[i + 1];
    }
    (*size)--;
    return deleted;
}`,
  },

  // UNIT 1: String Functions
  'string-functions': {
    title: 'Standard C String Functions Implementation',
    filename: 'string_functions.c',
    description: 'Manual C implementations of strlen, strcmp, strcpy, and strrev showing null terminator \\0 handling.',
    code: `#include <stdio.h>

// Compute string length until null byte \\0
int my_strlen(const char *str) {
    int len = 0;
    while (str[len] != '\\0') {
        len++;
    }
    return len;
}

// Compare two strings lexicographically
int my_strcmp(const char *s1, const char *s2) {
    while (*s1 && (*s1 == *s2)) {
        s1++;
        s2++;
    }
    return *(const unsigned char*)s1 - *(const unsigned char*)s2;
}

// In-place string reversal using two pointers
void my_strrev(char *str) {
    int left = 0;
    int right = my_strlen(str) - 1;
    while (left < right) {
        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;
        left++;
        right--;
    }
}`,
  },

  // UNIT 1: Bitwise Operations
  'bitwise-ops': {
    title: 'Bitwise Manipulation in C',
    filename: 'bitwise_manipulation.c',
    description: 'Bit manipulation idioms: check nth bit, set bit, clear bit, toggle bit, even/odd, and pairwise maximum AND.',
    code: `#include <stdio.h>

// Check if nth bit is set (0-indexed from LSB)
int is_bit_set(int num, int n) {
    return (num & (1 << n)) != 0;
}

// Set nth bit to 1
int set_bit(int num, int n) {
    return num | (1 << n);
}

// Clear nth bit to 0
int clear_bit(int num, int n) {
    return num & ~(1 << n);
}

// Toggle nth bit
int toggle_bit(int num, int n) {
    return num ^ (1 << n);
}

// Check even / odd using bitwise &
int is_even(int num) {
    return (num & 1) == 0;
}

// Pairwise maximum AND in an array
int max_pairwise_and(int arr[], int n) {
    int max_val = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int and_res = arr[i] & arr[j];
            if (and_res > max_val) max_val = and_res;
        }
    }
    return max_val;
}`,
  },

  // UNIT 2: Linear Search
  'linear-search': {
    title: 'Linear Search on Numbers & Strings',
    filename: 'linear_search.c',
    description: 'Sequentially checks every element in the collection until the target key is located.',
    code: `#include <stdio.h>

// Linear Search for Integer - Time: O(n), Space: O(1)
int linear_search(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i; // Target found at index i
        }
    }
    return -1; // Target not found
}`,
  },

  // UNIT 2: Binary Search
  'binary-search': {
    title: 'Binary Search on Sorted Array',
    filename: 'binary_search.c',
    description: 'Efficient logarithmic search that divides the search interval in half each step. Precondition: Array must be sorted.',
    code: `#include <stdio.h>

// Binary Search - Time: O(log n), Space: O(1)
int binary_search(int arr[], int n, int target) {
    int low = 0;
    int high = n - 1;

    while (low <= high) {
        // Prevent overflow compared to (low + high) / 2
        int mid = low + (high - low) / 2;

        if (arr[mid] == target) {
            return mid; // Found at index mid
        } else if (arr[mid] < target) {
            low = mid + 1; // Discard left half
        } else {
            high = mid - 1; // Discard right half
        }
    }
    return -1; // Target absent
}`,
  },

  // UNIT 2: Bubble Sort
  'bubble-sort': {
    title: 'Optimized Bubble Sort',
    filename: 'bubble_sort.c',
    description: 'Adjacent element comparisons with swapped flag for O(n) best-case termination.',
    code: `#include <stdio.h>

void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap adjacent elements
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = 1;
            }
        }
        // If no swaps occurred, array is already sorted
        if (!swapped) break;
    }
}`,
  },

  // UNIT 2: Selection Sort
  'selection-sort': {
    title: 'Selection Sort',
    filename: 'selection_sort.c',
    description: 'Finds minimum element in unsorted section and swaps it to index i. Performs at most n swaps.',
    code: `#include <stdio.h>

void selection_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        if (min_idx != i) {
            int temp = arr[i];
            arr[i] = arr[min_idx];
            arr[min_idx] = temp;
        }
    }
}`,
  },

  // UNIT 2: Insertion Sort
  'insertion-sort': {
    title: 'Insertion Sort',
    filename: 'insertion_sort.c',
    description: 'Builds sorted prefix incrementally by shifting elements greater than key rightward.',
    code: `#include <stdio.h>

void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;

        // Shift elements of arr[0..i-1] that are > key to one position ahead
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
  },

  // UNIT 2: Quick Sort
  'quick-sort': {
    title: 'Quick Sort (Lomuto Partition Scheme)',
    filename: 'quick_sort.c',
    description: 'Divide and conquer sorting algorithm using pivot partitioning.',
    code: `#include <stdio.h>

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Lomuto pivot
    int i = (low - 1);

    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return (i + 1);
}

void quick_sort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quick_sort(arr, low, pi - 1);
        quick_sort(arr, pi + 1, high);
    }
}`,
  },

  // UNIT 2: Radix Sort
  'radix-sort': {
    title: 'Radix Sort (Least Significant Digit)',
    filename: 'radix_sort.c',
    description: 'Non-comparative integer sorting algorithm using stable digit bucket counting.',
    code: `#include <stdio.h>

int getMax(int arr[], int n) {
    int mx = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > mx) mx = arr[i];
    return mx;
}

void countSort(int arr[], int n, int exp) {
    int output[n];
    int count[10] = {0};

    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}

void radix_sort(int arr[], int n) {
    int m = getMax(arr, n);
    for (int exp = 1; m / exp > 0; exp *= 10) countSort(arr, n, exp);
}`,
  },

  // UNIT 3: Singly Linked List
  'singly-linked-list': {
    title: 'Singly Linked List Implementation in C',
    filename: 'singly_linked_list.c',
    description: 'Dynamic memory allocation with malloc and free for node insertion, deletion, and traversal.',
    code: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

// Insert at beginning - O(1)
struct Node* insert_beginning(struct Node* head, int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = head;
    return newNode; // New head
}

// Insert at end - O(n)
void insert_end(struct Node** head_ref, int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = NULL;

    if (*head_ref == NULL) {
        *head_ref = newNode;
        return;
    }
    struct Node* temp = *head_ref;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    temp->next = newNode;
}

// Delete head node - O(1)
struct Node* delete_beginning(struct Node* head) {
    if (head == NULL) return NULL;
    struct Node* temp = head;
    head = head->next;
    free(temp);
    return head;
}

// In-place 3-pointer reversal - O(n)
struct Node* reverse_list(struct Node* head) {
    struct Node* prev = NULL;
    struct Node* curr = head;
    struct Node* next = NULL;
    while (curr != NULL) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev; // New head
}`,
  },

  // UNIT 4: Stack ADT
  'stack-c': {
    title: 'Stack ADT Implementation using Array',
    filename: 'stack_array.c',
    description: 'LIFO data structure operations: push, pop, peek, overflow, and underflow handling.',
    code: `#include <stdio.h>
#define CAPACITY 5

struct Stack {
    int items[CAPACITY];
    int top;
};

void init(struct Stack* s) {
    s->top = -1;
}

int isFull(struct Stack* s) {
    return s->top == CAPACITY - 1;
}

int isEmpty(struct Stack* s) {
    return s->top == -1;
}

void push(struct Stack* s, int val) {
    if (isFull(s)) {
        printf("Stack Overflow! Cannot push %d\\n", val);
        return;
    }
    s->top++;
    s->items[s->top] = val;
}

int pop(struct Stack* s) {
    if (isEmpty(s)) {
        printf("Stack Underflow! Cannot pop\\n");
        return -1;
    }
    int val = s->items[s->top];
    s->top--;
    return val;
}

int peek(struct Stack* s) {
    if (isEmpty(s)) return -1;
    return s->items[s->top];
}`,
  },

  // UNIT 5: Circular Queue
  'circular-queue-c': {
    title: 'Circular Queue Implementation in C',
    filename: 'circular_queue.c',
    description: 'Ring buffer with modular arithmetic (rear + 1) % MAX that reuses freed positions.',
    code: `#include <stdio.h>
#define MAX 5

struct CircularQueue {
    int items[MAX];
    int front;
    int rear;
};

void init(struct CircularQueue* q) {
    q->front = -1;
    q->rear = -1;
}

int isFull(struct CircularQueue* q) {
    return (q->rear + 1) % MAX == q->front;
}

int isEmpty(struct CircularQueue* q) {
    return q->front == -1;
}

void enqueue(struct CircularQueue* q, int val) {
    if (isFull(q)) {
        printf("Circular Queue Overflow\\n");
        return;
    }
    if (isEmpty(q)) {
        q->front = 0;
    }
    q->rear = (q->rear + 1) % MAX;
    q->items[q->rear] = val;
}

int dequeue(struct CircularQueue* q) {
    if (isEmpty(q)) {
        printf("Circular Queue Underflow\\n");
        return -1;
    }
    int val = q->items[q->front];
    if (q->front == q->rear) {
        // Last element dequeued, reset
        q->front = -1;
        q->rear = -1;
    } else {
        q->front = (q->front + 1) % MAX;
    }
    return val;
}`,
  },

  // UNIT 6: Binary Search Tree
  'bst-c': {
    title: 'Binary Search Tree (BST) Creation and Traversals',
    filename: 'binary_search_tree.c',
    description: 'Recursive node insertion, and In-Order, Pre-Order, and Post-Order traversal implementations.',
    code: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* left;
    struct Node* right;
};

struct Node* createNode(int value) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = value;
    newNode->left = NULL;
    newNode->right = NULL;
    return newNode;
}

struct Node* insert(struct Node* root, int key) {
    if (root == NULL) return createNode(key);
    if (key < root->data) {
        root->left = insert(root->left, key);
    } else if (key > root->data) {
        root->right = insert(root->right, key);
    }
    return root;
}

// In-Order Traversal (Left, Root, Right) -> Yields Sorted Output!
void inorder(struct Node* root) {
    if (root != NULL) {
        inorder(root->left);
        printf("%d ", root->data);
        inorder(root->right);
    }
}

// Pre-Order Traversal (Root, Left, Right)
void preorder(struct Node* root) {
    if (root != NULL) {
        printf("%d ", root->data);
        preorder(root->left);
        preorder(root->right);
    }
}

// Post-Order Traversal (Left, Right, Root)
void postorder(struct Node* root) {
    if (root != NULL) {
        postorder(root->left);
        postorder(root->right);
        printf("%d ", root->data);
    }
}`,
  },

  // UNIT 6: Graph Adjacency Matrix & List
  'graph-c': {
    title: 'Graph Adjacency Matrix & Adjacency List in C',
    filename: 'graph_representations.c',
    description: 'Representation of graphs using 2D matrix and linked list adjacency structures.',
    code: `#include <stdio.h>
#include <stdlib.h>
#define V 4

// Adjacency Matrix Representation
void addEdgeMatrix(int matrix[V][V], int u, int v) {
    matrix[u][v] = 1;
    matrix[v][u] = 1; // Undirected graph
}

// Adjacency List Representation
struct AdjListNode {
    int dest;
    struct AdjListNode* next;
};

struct AdjList {
    struct AdjListNode* head;
};

struct Graph {
    int numVertices;
    struct AdjList* array;
};

struct Graph* createGraph(int numV) {
    struct Graph* graph = (struct Graph*)malloc(sizeof(struct Graph));
    graph->numVertices = numV;
    graph->array = (struct AdjList*)malloc(numV * sizeof(struct AdjList));
    for (int i = 0; i < numV; ++i) graph->array[i].head = NULL;
    return graph;
}

void addEdgeList(struct Graph* graph, int src, int dest) {
    // Add edge from src to dest
    struct AdjListNode* newNode = (struct AdjListNode*)malloc(sizeof(struct AdjListNode));
    newNode->dest = dest;
    newNode->next = graph->array[src].head;
    graph->array[src].head = newNode;
}`,
  },
};
