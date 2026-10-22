import { BaseSimulationStep } from '@/types/dsa';

export interface VisualNode {
  id: string;
  data: number;
  address: string; // e.g. 0x4020
  nextAddress: string | null;
  prevAddress?: string | null;
  state: 'idle' | 'allocating' | 'active' | 'relinking' | 'deleted' | 'found';
}

export interface LinkedListSimulationStep extends BaseSimulationStep {
  nodes: VisualNode[];
  headAddress: string | null;
  listType: 'singly' | 'circular' | 'doubly';
  activeNodeId?: string;
  freeMemoryAddress?: string;
}

export function simulateLinkedListOperation(
  initialValues: number[],
  listType: 'singly' | 'circular' | 'doubly',
  operation: 'insert_head' | 'insert_tail' | 'insert_after' | 'delete_head' | 'delete_tail' | 'delete_value' | 'reverse' | 'search',
  payload?: { value?: number; targetValue?: number }
): { steps: LinkedListSimulationStep[]; finalValues: number[] } {
  const steps: LinkedListSimulationStep[] = [];
  const baseAddr = 0x4000;

  const buildNodes = (vals: number[], states?: Record<string, VisualNode['state']>): VisualNode[] => {
    return vals.map((val, idx) => {
      const addr = `0x${(baseAddr + idx * 0x30).toString(16).toUpperCase()}`;
      let nextAddr: string | null = null;
      if (idx < vals.length - 1) {
        nextAddr = `0x${(baseAddr + (idx + 1) * 0x30).toString(16).toUpperCase()}`;
      } else if (listType === 'circular' && vals.length > 0) {
        nextAddr = `0x${baseAddr.toString(16).toUpperCase()}`; // point back to head!
      }

      let prevAddr: string | null = null;
      if (listType === 'doubly') {
        if (idx > 0) {
          prevAddr = `0x${(baseAddr + (idx - 1) * 0x30).toString(16).toUpperCase()}`;
        }
      }

      const id = `node-${val}-${idx}`;
      return {
        id,
        data: val,
        address: addr,
        nextAddress: nextAddr,
        prevAddress: prevAddr,
        state: states?.[id] || 'idle',
      };
    });
  };

  let currentVals = [...initialValues];
  const initialNodes = buildNodes(currentVals);
  const headAddr = initialNodes.length > 0 ? initialNodes[0].address : null;

  if (operation === 'insert_head') {
    const val = payload?.value ?? 42;
    const newAddr = `0x${(baseAddr + 0x280).toString(16).toUpperCase()}`;
    const newNode: VisualNode = {
      id: `node-${val}-new`,
      data: val,
      address: newAddr,
      nextAddress: null,
      prevAddress: null,
      state: 'allocating',
    };

    steps.push({
      stepIndex: 0,
      title: 'Step 1: Allocate New Node on Heap',
      description: `struct Node* newNode = (struct Node*)malloc(sizeof(struct Node)); allocated at heap address ${newAddr}.`,
      rationale: 'Dynamic memory allocation via malloc reserves memory on the runtime heap.',
      nodes: [newNode, ...initialNodes],
      headAddress: headAddr,
      listType,
      activeNodeId: newNode.id,
      codeLine: 1,
    });

    newNode.data = val;
    newNode.state = 'active';
    steps.push({
      stepIndex: 1,
      title: 'Step 2: Initialize Data Field',
      description: `Assigned newNode->data = ${val}. newNode->next remains uninitialized.`,
      rationale: 'Assigning values to struct members through the arrow (->) operator.',
      nodes: [newNode, ...initialNodes],
      headAddress: headAddr,
      listType,
      activeNodeId: newNode.id,
      codeLine: 2,
    });

    newNode.nextAddress = headAddr;
    newNode.state = 'relinking';
    steps.push({
      stepIndex: 2,
      title: 'Step 3: Point newNode->next to Current Head',
      description: `newNode->next = head (${headAddr ?? 'NULL'}). The new node now references the former first node.`,
      rationale: 'Always connect the new node to the rest of the list before moving the head pointer to avoid memory orphan.',
      nodes: [newNode, ...initialNodes],
      headAddress: headAddr,
      listType,
      activeNodeId: newNode.id,
      codeLine: 3,
    });

    currentVals = [val, ...currentVals];
    const finalNodes = buildNodes(currentVals);

    steps.push({
      stepIndex: 3,
      title: 'Step 4: Update Head Pointer to newNode',
      description: `head = newNode (${newAddr}). Insertion at beginning completed in O(1) constant time!`,
      rationale: 'Head pointer reassignment is an atomic O(1) pointer swap.',
      nodes: finalNodes,
      headAddress: finalNodes[0].address,
      listType,
      activeNodeId: finalNodes[0].id,
      isTerminal: true,
      codeLine: 4,
    });
  } else if (operation === 'insert_tail') {
    const val = payload?.value ?? 88;
    const newAddr = `0x${(baseAddr + 0x320).toString(16).toUpperCase()}`;

    steps.push({
      stepIndex: 0,
      title: 'Step 1: Traverse to the Last Node',
      description: 'Starting from head, advancing temp pointer until temp->next == NULL.',
      rationale: 'In C: struct Node* temp = head; while (temp->next != NULL) temp = temp->next;',
      nodes: initialNodes,
      headAddress: headAddr,
      listType,
      codeLine: 1,
    });

    // Traverse
    for (let i = 0; i < initialNodes.length; i++) {
      steps.push({
        stepIndex: steps.length,
        title: `Traversing: Visiting Node [${initialNodes[i].data}]`,
        description: `Inspecting address ${initialNodes[i].address}. next = ${initialNodes[i].nextAddress ?? 'NULL'}.`,
        rationale: i === initialNodes.length - 1 ? 'Last node reached! temp->next is NULL.' : 'temp = temp->next;',
        nodes: buildNodes(currentVals, { [initialNodes[i].id]: 'active' }),
        headAddress: headAddr,
        listType,
        activeNodeId: initialNodes[i].id,
        codeLine: 2,
      });
    }

    const newNode: VisualNode = {
      id: `node-${val}-new`,
      data: val,
      address: newAddr,
      nextAddress: listType === 'circular' ? headAddr : null,
      prevAddress: listType === 'doubly' && initialNodes.length > 0 ? initialNodes[initialNodes.length - 1].address : null,
      state: 'allocating',
    };

    steps.push({
      stepIndex: steps.length,
      title: 'Step 2: Allocate & Connect New Tail Node',
      description: `Allocated newNode at ${newAddr}. Linked lastNode->next = newNode.`,
      rationale: 'temp->next = newNode; newNode->next = NULL;',
      nodes: [...initialNodes, newNode],
      headAddress: headAddr,
      listType,
      activeNodeId: newNode.id,
      codeLine: 4,
    });

    currentVals.push(val);
    const finalNodes = buildNodes(currentVals);

    steps.push({
      stepIndex: steps.length,
      title: 'Tail Insertion Complete',
      description: `New tail [${val}] successfully appended. Traversal took O(n) time.`,
      rationale: 'Without a dedicated tail pointer, inserting at end requires linear scan O(n).',
      nodes: finalNodes,
      headAddress: headAddr,
      listType,
      isTerminal: true,
      codeLine: 5,
    });
  } else if (operation === 'delete_head') {
    if (initialNodes.length === 0) {
      steps.push({
        stepIndex: 0,
        title: 'Empty List (Underflow)',
        description: 'Cannot delete from an empty linked list. head == NULL.',
        rationale: 'if (head == NULL) { printf("List Underflow\\n"); return; }',
        nodes: [],
        headAddress: null,
        listType,
        isTerminal: true,
      });
    } else {
      const first = initialNodes[0];

      steps.push({
        stepIndex: 0,
        title: 'Step 1: Save Target Node in Temp Pointer',
        description: `struct Node* temp = head; (holding address ${first.address} with data ${first.data}).`,
        rationale: 'Must keep reference to node so its memory can be reclaimed with free().',
        nodes: buildNodes(currentVals, { [first.id]: 'active' }),
        headAddress: headAddr,
        listType,
        activeNodeId: first.id,
        codeLine: 1,
      });

      const nextHead = initialNodes.length > 1 ? initialNodes[1].address : null;

      steps.push({
        stepIndex: 1,
        title: 'Step 2: Advance Head Pointer',
        description: `head = head->next; (${nextHead ?? 'NULL'}). The second node becomes the new head.`,
        rationale: 'Head pointer safely bypassed the first node.',
        nodes: buildNodes(currentVals, { [first.id]: 'deleted' }),
        headAddress: nextHead,
        listType,
        activeNodeId: first.id,
        codeLine: 2,
      });

      currentVals.shift();
      const finalNodes = buildNodes(currentVals);

      steps.push({
        stepIndex: 2,
        title: 'Step 3: Free Allocated Memory (free(temp))',
        description: `free(temp); Deallocated heap memory at ${first.address}. Node [${first.data}] destroyed.`,
        rationale: 'Frees heap memory to prevent memory leaks in C.',
        nodes: finalNodes,
        headAddress: finalNodes.length > 0 ? finalNodes[0].address : null,
        listType,
        freeMemoryAddress: first.address,
        isTerminal: true,
        codeLine: 3,
      });
    }
  } else if (operation === 'reverse') {
    steps.push({
      stepIndex: 0,
      title: 'Initialize 3-Pointer Reversal',
      description: 'Using three pointers: struct Node *prev = NULL, *curr = head, *next = NULL.',
      rationale: 'Standard in-place linked list reversal requiring O(n) time and O(1) space.',
      nodes: initialNodes,
      headAddress: headAddr,
      listType,
      codeLine: 1,
    });

    const reversedVals = [...currentVals].reverse();
    currentVals = reversedVals;
    const finalNodes = buildNodes(currentVals);

    steps.push({
      stepIndex: 1,
      title: 'Inverting Pointers in Place',
      description: 'At each node: next = curr->next; curr->next = prev; prev = curr; curr = next;',
      rationale: 'Reverses the direction of next pointers without allocating any new nodes.',
      nodes: finalNodes,
      headAddress: finalNodes[0]?.address ?? null,
      listType,
      codeLine: 3,
    });

    steps.push({
      stepIndex: 2,
      title: 'Reversal Complete: New Head Established',
      description: `head = prev (${finalNodes[0]?.address ?? 'NULL'}). List order is completely reversed!`,
      rationale: 'Head now points to what was previously the last node.',
      nodes: finalNodes,
      headAddress: finalNodes[0]?.address ?? null,
      listType,
      isTerminal: true,
      codeLine: 5,
    });
  } else if (operation === 'search') {
    const target = payload?.targetValue ?? currentVals[1] ?? 20;
    let found = false;

    steps.push({
      stepIndex: 0,
      title: `Search for Key: ${target}`,
      description: `Starting linear pointer traversal from head (${headAddr}).`,
      rationale: 'while (temp != NULL) { if (temp->data == key) return temp; temp = temp->next; }',
      nodes: initialNodes,
      headAddress: headAddr,
      listType,
      codeLine: 1,
    });

    for (let i = 0; i < initialNodes.length; i++) {
      const isMatch = initialNodes[i].data === target;

      steps.push({
        stepIndex: steps.length,
        title: `Inspect Node [${initialNodes[i].data}] at ${initialNodes[i].address}`,
        description: isMatch
          ? `MATCH FOUND! Node contains target value ${target}.`
          : `${initialNodes[i].data} != ${target}. Following next pointer to ${initialNodes[i].nextAddress ?? 'NULL'}.`,
        rationale: isMatch ? 'Key matched!' : 'temp = temp->next;',
        nodes: buildNodes(currentVals, { [initialNodes[i].id]: isMatch ? 'found' : 'active' }),
        headAddress: headAddr,
        listType,
        activeNodeId: initialNodes[i].id,
        isTerminal: isMatch,
        codeLine: isMatch ? 3 : 2,
      });

      if (isMatch) {
        found = true;
        break;
      }
    }

    if (!found) {
      steps.push({
        stepIndex: steps.length,
        title: 'Key Not Found (Reached NULL)',
        description: `Traversed entire list without finding ${target}. Returned NULL.`,
        rationale: 'Search failed in O(n) linear scan.',
        nodes: initialNodes,
        headAddress: headAddr,
        listType,
        isTerminal: true,
        codeLine: 5,
      });
    }
  }

  return { steps, finalValues: currentVals };
}
