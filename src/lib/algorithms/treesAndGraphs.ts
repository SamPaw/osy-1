import { BaseSimulationStep } from '@/types/dsa';

export interface TreeNode {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
  x: number; // 0 to 100 percentage layout
  y: number; // 0 to 100 percentage layout
  level: number;
  isLeaf: boolean;
  state: 'idle' | 'visiting' | 'visited' | 'inserted' | 'comparing';
}

export interface TreeSimulationStep extends BaseSimulationStep {
  nodes: Record<string, TreeNode>;
  rootId: string | null;
  currentNodeId: string | null;
  traversalOutput: number[];
  visitedNodeIds: string[];
  activeComparison?: { nodeValue: number; insertingValue: number; direction: 'left' | 'right' };
}

export function buildBSTLayout(values: number[]): { nodes: Record<string, TreeNode>; rootId: string | null } {
  const nodes: Record<string, TreeNode> = {};
  if (values.length === 0) return { nodes: {}, rootId: null };

  const rootId = `node-${values[0]}`;
  nodes[rootId] = {
    id: rootId,
    value: values[0],
    leftId: null,
    rightId: null,
    x: 50,
    y: 16,
    level: 0,
    isLeaf: true,
    state: 'idle',
  };

  for (let i = 1; i < values.length; i++) {
    const val = values[i];
    let currId = rootId;
    let currLevel = 0;
    let currX = 50;
    let deltaX = 24;

    while (true) {
      const curr = nodes[currId];
      currLevel++;
      deltaX = deltaX * 0.52;

      if (val < curr.value) {
        if (!curr.leftId) {
          const newId = `node-${val}`;
          nodes[newId] = {
            id: newId,
            value: val,
            leftId: null,
            rightId: null,
            x: Math.max(10, currX - deltaX),
            y: curr.y + 20,
            level: currLevel,
            isLeaf: true,
            state: 'idle',
          };
          curr.leftId = newId;
          curr.isLeaf = false;
          break;
        } else {
          currX = nodes[curr.leftId].x;
          currId = curr.leftId;
        }
      } else {
        if (!curr.rightId) {
          const newId = `node-${val}`;
          nodes[newId] = {
            id: newId,
            value: val,
            leftId: null,
            rightId: null,
            x: Math.min(90, currX + deltaX),
            y: curr.y + 20,
            level: currLevel,
            isLeaf: true,
            state: 'idle',
          };
          curr.rightId = newId;
          curr.isLeaf = false;
          break;
        } else {
          currX = nodes[curr.rightId].x;
          currId = curr.rightId;
        }
      }
    }
  }

  return { nodes, rootId };
}

export function simulateBSTInsert(
  currentValues: number[],
  newValue: number
): { steps: TreeSimulationStep[]; finalValues: number[] } {
  const steps: TreeSimulationStep[] = [];
  const { nodes } = buildBSTLayout(currentValues);

  if (currentValues.length === 0) {
    const rootId = `node-${newValue}`;
    const newNodes: Record<string, TreeNode> = {
      [rootId]: {
        id: rootId,
        value: newValue,
        leftId: null,
        rightId: null,
        x: 50,
        y: 16,
        level: 0,
        isLeaf: true,
        state: 'inserted',
      },
    };

    steps.push({
      stepIndex: 0,
      title: `Insert ${newValue} as BST Root`,
      description: 'Tree was empty. Created root node with value ' + newValue + '.',
      rationale: 'root = createNode(value); O(1) creation.',
      nodes: newNodes,
      rootId,
      currentNodeId: rootId,
      traversalOutput: [],
      visitedNodeIds: [rootId],
      isTerminal: true,
      codeLine: 1,
    });

    return { steps, finalValues: [newValue] };
  }

  const rootId = `node-${currentValues[0]}`;
  let currId: string | null = rootId;
  const visited: string[] = [];

  steps.push({
    stepIndex: 0,
    title: `Begin BST Search for Insertion Spot: ${newValue}`,
    description: `Comparing incoming value ${newValue} against root node [${nodes[rootId].value}].`,
    rationale: 'In C: struct Node* insert(struct Node* node, int key) { if (node == NULL) return createNode(key); ... }',
    nodes: JSON.parse(JSON.stringify(nodes)),
    rootId,
    currentNodeId: rootId,
    traversalOutput: [],
    visitedNodeIds: [],
    codeLine: 1,
  });

  while (currId) {
    const currNode: TreeNode = nodes[currId];
    visited.push(currId);
    const goLeft = newValue < currNode.value;

    steps.push({
      stepIndex: steps.length,
      title: `Compare: ${newValue} ${goLeft ? '<' : '>='} ${currNode.value}`,
      description: goLeft
        ? `${newValue} < ${currNode.value}: Value belongs in the LEFT subtree.`
        : `${newValue} >= ${currNode.value}: Value belongs in the RIGHT subtree.`,
      rationale: goLeft ? 'node->left = insert(node->left, key);' : 'node->right = insert(node->right, key);',
      nodes: JSON.parse(JSON.stringify(nodes)),
      rootId,
      currentNodeId: currId,
      traversalOutput: [],
      visitedNodeIds: [...visited],
      activeComparison: {
        nodeValue: currNode.value,
        insertingValue: newValue,
        direction: goLeft ? 'left' : 'right',
      },
      codeLine: goLeft ? 3 : 5,
    });

    const nextId = goLeft ? currNode.leftId : currNode.rightId;
    if (!nextId) {
      // Found spot!
      const finalValues = [...currentValues, newValue];
      const finalLayout = buildBSTLayout(finalValues);
      const insertedId = `node-${newValue}`;
      if (finalLayout.nodes[insertedId]) {
        finalLayout.nodes[insertedId].state = 'inserted';
      }

      steps.push({
        stepIndex: steps.length,
        title: `Attached New Node [${newValue}] as ${goLeft ? 'Left' : 'Right'} Child of [${currNode.value}]`,
        description: `Empty child pointer reached! Allocated new node and updated parent link.`,
        rationale: 'Leaf node attached successfully. Time complexity: O(h) where h is tree height.',
        nodes: finalLayout.nodes,
        rootId,
        currentNodeId: insertedId,
        traversalOutput: [],
        visitedNodeIds: [...visited, insertedId],
        isTerminal: true,
        codeLine: 7,
      });

      return { steps, finalValues };
    }

    currId = nextId;
  }

  return { steps, finalValues: currentValues };
}

export function simulateTreeTraversal(
  values: number[],
  traversalType: 'inorder' | 'preorder' | 'postorder'
): { steps: TreeSimulationStep[]; order: number[] } {
  const steps: TreeSimulationStep[] = [];
  const { nodes, rootId } = buildBSTLayout(values);
  if (!rootId) return { steps: [], order: [] };

  const collected: number[] = [];
  const visited: string[] = [];

  steps.push({
    stepIndex: 0,
    title: `Initialize ${traversalType.toUpperCase()} Traversal`,
    description:
      traversalType === 'inorder'
        ? 'In-Order Rule: Traverse LEFT Subtree → Visit ROOT → Traverse RIGHT Subtree. (Produces strictly sorted values in a BST!).'
        : traversalType === 'preorder'
        ? 'Pre-Order Rule: Visit ROOT → Traverse LEFT Subtree → Traverse RIGHT Subtree. (Used for copying/serializing trees).'
        : 'Post-Order Rule: Traverse LEFT Subtree → Traverse RIGHT Subtree → Visit ROOT. (Used for bottom-up deletion & expression tree evaluation).',
    rationale: 'Recursive depth-first binary tree traversal: O(n) time, O(h) auxiliary call stack space.',
    nodes: JSON.parse(JSON.stringify(nodes)),
    rootId,
    currentNodeId: rootId,
    traversalOutput: [],
    visitedNodeIds: [],
    codeLine: 1,
  });

  function traverse(nodeId: string | null) {
    if (!nodeId || !nodes[nodeId]) return;
    const node = nodes[nodeId];

    if (traversalType === 'preorder') {
      collected.push(node.value);
      visited.push(nodeId);
      steps.push({
        stepIndex: steps.length,
        title: `Visit Node [${node.value}] (Root)`,
        description: `Pre-order: Processed root [${node.value}] before traversing children. Added to output.`,
        rationale: 'printf("%d ", root->data);',
        nodes: JSON.parse(JSON.stringify(nodes)),
        rootId,
        currentNodeId: nodeId,
        traversalOutput: [...collected],
        visitedNodeIds: [...visited],
        codeLine: 2,
      });
      traverse(node.leftId);
      traverse(node.rightId);
    } else if (traversalType === 'inorder') {
      traverse(node.leftId);
      collected.push(node.value);
      visited.push(nodeId);
      steps.push({
        stepIndex: steps.length,
        title: `Visit Node [${node.value}] (Left Subtree Complete)`,
        description: `In-order: Left subtree finished. Processing node [${node.value}]. Appended to output sequence.`,
        rationale: 'printf("%d ", root->data);',
        nodes: JSON.parse(JSON.stringify(nodes)),
        rootId,
        currentNodeId: nodeId,
        traversalOutput: [...collected],
        visitedNodeIds: [...visited],
        codeLine: 3,
      });
      traverse(node.rightId);
    } else if (traversalType === 'postorder') {
      traverse(node.leftId);
      traverse(node.rightId);
      collected.push(node.value);
      visited.push(nodeId);
      steps.push({
        stepIndex: steps.length,
        title: `Visit Node [${node.value}] (Both Subtrees Complete)`,
        description: `Post-order: Both left and right subtrees finished. Processing node [${node.value}].`,
        rationale: 'printf("%d ", root->data);',
        nodes: JSON.parse(JSON.stringify(nodes)),
        rootId,
        currentNodeId: nodeId,
        traversalOutput: [...collected],
        visitedNodeIds: [...visited],
        codeLine: 4,
      });
    }
  }

  traverse(rootId);

  steps.push({
    stepIndex: steps.length,
    title: `${traversalType.toUpperCase()} Traversal Complete`,
    description: `All ${values.length} nodes processed. Output sequence: [${collected.join(', ')}].`,
    rationale: traversalType === 'inorder' ? 'Notice that BST In-Order traversal produced monotonically sorted order!' : 'Traversal completed.',
    nodes: JSON.parse(JSON.stringify(nodes)),
    rootId,
    currentNodeId: null,
    traversalOutput: [...collected],
    visitedNodeIds: [...visited],
    isTerminal: true,
    codeLine: 5,
  });

  return { steps, order: collected };
}

// -------------------------------------------------------------
// GRAPH DUAL-VIEW (MATRIX & LIST) ENGINE
// -------------------------------------------------------------

export interface GraphVertex {
  id: number;
  label: string;
  x: number; // percentage layout
  y: number; // percentage layout
}

export interface GraphEdge {
  u: number;
  v: number;
  weight?: number;
}

export interface GraphModel {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  isDirected: boolean;
}

export function generateAdjacencyMatrix(graph: GraphModel): number[][] {
  const n = graph.vertices.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (const edge of graph.edges) {
    if (edge.u < n && edge.v < n) {
      matrix[edge.u][edge.v] = edge.weight ?? 1;
      if (!graph.isDirected) {
        matrix[edge.v][edge.u] = edge.weight ?? 1;
      }
    }
  }

  return matrix;
}

export function generateAdjacencyList(graph: GraphModel): { vertex: number; neighbors: number[] }[] {
  const n = graph.vertices.length;
  const list: { vertex: number; neighbors: number[] }[] = Array.from({ length: n }, (_, i) => ({
    vertex: i,
    neighbors: [],
  }));

  for (const edge of graph.edges) {
    if (edge.u < n && edge.v < n) {
      list[edge.u].neighbors.push(edge.v);
      if (!graph.isDirected && edge.u !== edge.v) {
        list[edge.v].neighbors.push(edge.u);
      }
    }
  }

  // Sort neighbors for deterministic presentation
  list.forEach((item) => item.neighbors.sort((a, b) => a - b));

  return list;
}
