import { BaseSimulationStep } from '@/types/dsa';

export interface QueueSlot {
  index: number;
  value: number | null;
  priority?: number;
  state: 'idle' | 'front' | 'rear' | 'enqueued' | 'dequeued' | 'wasted';
}

export interface QueueSimulationStep extends BaseSimulationStep {
  slots: QueueSlot[];
  front: number;
  rear: number;
  capacity: number;
  count: number;
  queueType: 'linear' | 'circular' | 'priority' | 'deque';
  isFull: boolean;
  isEmpty: boolean;
  isFalseOverflow?: boolean;
}

export function simulateLinearQueue(
  initialValues: (number | null)[],
  capacity: number,
  front: number,
  rear: number,
  operation: 'enqueue' | 'dequeue',
  valToEnqueue: number = 77
): {
  steps: QueueSimulationStep[];
  finalSlots: (number | null)[];
  finalFront: number;
  finalRear: number;
} {
  const steps: QueueSimulationStep[] = [];
  const slots: (number | null)[] = [...initialValues];
  let curFront = front;
  let curRear = rear;

  const buildSlots = (
    arr: (number | null)[],
    f: number,
    r: number,
    states?: Record<number, QueueSlot['state']>
  ): QueueSlot[] => {
    return arr.map((v, i) => {
      let state: QueueSlot['state'] = 'idle';
      if (states?.[i]) state = states[i];
      else if (i === f && v !== null) state = 'front';
      else if (i === r && v !== null) state = 'rear';
      else if (i < f && v === null) state = 'wasted';
      return { index: i, value: v, state };
    });
  };

  const countOccupied = () => slots.filter((v) => v !== null).length;

  if (operation === 'enqueue') {
    // Check if rear reached end of array
    if (curRear === capacity - 1) {
      const isFalse = curFront > 0;
      steps.push({
        stepIndex: 0,
        title: isFalse ? 'Linear Queue: False Overflow Alert!' : 'Queue Full Overflow',
        description: isFalse
          ? `rear has reached capacity index (${curRear}), but ${curFront} slot(s) at front are empty! Linear queues cannot reuse freed memory without O(n) shifting. This problem motivated the Circular Queue.`
          : `Queue is truly full. rear == capacity - 1 (${capacity - 1}) and front == 0.`,
        rationale: 'In C: if (rear == MAX - 1) { printf("Queue Overflow\\n"); return; }',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'linear',
        isFull: true,
        isEmpty: false,
        isFalseOverflow: isFalse,
        isTerminal: true,
        codeLine: 2,
      });
    } else {
      const newRear = curRear === -1 ? 0 : curRear + 1;
      const newFront = curFront === -1 ? 0 : curFront;

      steps.push({
        stepIndex: 0,
        title: `Prepare ENQUEUE: Insert ${valToEnqueue}`,
        description: curRear === -1
          ? `Queue was empty. Initializing front = 0 and rear = 0.`
          : `Incrementing rear pointer: rear = ${curRear} + 1 = ${newRear}.`,
        rationale: 'In C: if (front == -1) front = 0; rear++; queue[rear] = val;',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'linear',
        isFull: false,
        isEmpty: curFront === -1,
        activePointers: { newRear, value: valToEnqueue },
        codeLine: 4,
      });

      curFront = newFront;
      curRear = newRear;
      slots[curRear] = valToEnqueue;

      steps.push({
        stepIndex: 1,
        title: `ENQUEUE Complete: Stored ${valToEnqueue} at rear [${curRear}]`,
        description: `queue[${curRear}] = ${valToEnqueue}. Front is at [${curFront}], Rear is at [${curRear}].`,
        rationale: 'Enqueue completed in O(1) time.',
        slots: buildSlots(slots, curFront, curRear, { [curRear]: 'enqueued' }),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'linear',
        isFull: curRear === capacity - 1,
        isEmpty: false,
        isTerminal: true,
        codeLine: 5,
      });
    }
  } else if (operation === 'dequeue') {
    if (curFront === -1 || curFront > curRear) {
      steps.push({
        stepIndex: 0,
        title: 'Queue Underflow Error!',
        description: 'Cannot DEQUEUE from an empty queue. front is -1 or front > rear.',
        rationale: 'In C: if (front == -1 || front > rear) { printf("Queue Underflow\\n"); return -1; }',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: 0,
        queueType: 'linear',
        isFull: false,
        isEmpty: true,
        isTerminal: true,
        codeLine: 2,
      });
    } else {
      const dequeuedVal = slots[curFront];

      steps.push({
        stepIndex: 0,
        title: `Prepare DEQUEUE: Value ${dequeuedVal} at front [${curFront}]`,
        description: `Extracting element from the front of the queue according to FIFO order.`,
        rationale: 'int item = queue[front];',
        slots: buildSlots(slots, curFront, curRear, { [curFront]: 'dequeued' }),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'linear',
        isFull: false,
        isEmpty: false,
        activePointers: { front: curFront, item: dequeuedVal },
        codeLine: 4,
      });

      slots[curFront] = null;

      if (curFront === curRear) {
        // Queue becomes empty
        curFront = -1;
        curRear = -1;
      } else {
        curFront++;
      }

      steps.push({
        stepIndex: 1,
        title: `DEQUEUE Complete: Removed ${dequeuedVal}`,
        description: curFront === -1
          ? `Queue is now completely empty. Reset front = -1, rear = -1.`
          : `Front pointer advanced to index [${curFront}]. Slot ${curFront - 1} is now unoccupied.`,
        rationale: 'front++; // O(1) time removal',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'linear',
        isFull: false,
        isEmpty: curFront === -1,
        isTerminal: true,
        codeLine: 5,
      });
    }
  }

  return { steps, finalSlots: slots, finalFront: curFront, finalRear: curRear };
}

export function simulateCircularQueue(
  initialValues: (number | null)[],
  capacity: number,
  front: number,
  rear: number,
  operation: 'enqueue' | 'dequeue',
  valToEnqueue: number = 88
): {
  steps: QueueSimulationStep[];
  finalSlots: (number | null)[];
  finalFront: number;
  finalRear: number;
} {
  const steps: QueueSimulationStep[] = [];
  const slots: (number | null)[] = [...initialValues];
  let curFront = front;
  let curRear = rear;

  const buildSlots = (
    arr: (number | null)[],
    f: number,
    r: number,
    states?: Record<number, QueueSlot['state']>
  ): QueueSlot[] => {
    return arr.map((v, i) => {
      let state: QueueSlot['state'] = 'idle';
      if (states?.[i]) state = states[i];
      else if (i === f && v !== null) state = 'front';
      else if (i === r && v !== null) state = 'rear';
      return { index: i, value: v, state };
    });
  };

  const countOccupied = () => slots.filter((v) => v !== null).length;

  if (operation === 'enqueue') {
    // Full condition: (rear + 1) % capacity == front
    const nextRear = (curRear + 1) % capacity;
    if (nextRear === curFront) {
      steps.push({
        stepIndex: 0,
        title: 'Circular Queue Full (Overflow)',
        description: `(rear + 1) % capacity == front: (${curRear} + 1) % ${capacity} == ${curFront}. The circular ring is completely filled.`,
        rationale: 'In C: if ((rear + 1) % MAX == front) { printf("Circular Queue Overflow\\n"); return; }',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: capacity,
        queueType: 'circular',
        isFull: true,
        isEmpty: false,
        isTerminal: true,
        codeLine: 2,
      });
    } else {
      const isWrap = curRear !== -1 && nextRear < curRear;

      steps.push({
        stepIndex: 0,
        title: isWrap ? `Circular Wraparound: rear [${curRear}] → [0]` : `Advance rear to [${nextRear}]`,
        description: isWrap
          ? `Rear has wrapped around the end of the array! Reusing previously freed index 0: (${curRear} + 1) % ${capacity} = 0.`
          : `rear = (${curRear} + 1) % ${capacity} = ${nextRear}. Preparing to insert ${valToEnqueue}.`,
        rationale: 'Modular arithmetic eliminates the false overflow problem of linear queues.',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'circular',
        isFull: false,
        isEmpty: curFront === -1,
        activePointers: { nextRear, valToEnqueue },
        codeLine: 4,
      });

      if (curFront === -1) {
        curFront = 0;
      }
      curRear = nextRear;
      slots[curRear] = valToEnqueue;

      steps.push({
        stepIndex: 1,
        title: `Enqueued ${valToEnqueue} at Ring Index [${curRear}]`,
        description: `queue[${curRear}] = ${valToEnqueue}. Active circular span: [front: ${curFront} → rear: ${curRear}].`,
        rationale: 'rear = (rear + 1) % MAX; queue[rear] = val;',
        slots: buildSlots(slots, curFront, curRear, { [curRear]: 'enqueued' }),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'circular',
        isFull: (curRear + 1) % capacity === curFront,
        isEmpty: false,
        isTerminal: true,
        codeLine: 5,
      });
    }
  } else if (operation === 'dequeue') {
    if (curFront === -1) {
      steps.push({
        stepIndex: 0,
        title: 'Circular Queue Underflow',
        description: 'front is -1. Circular ring contains zero elements.',
        rationale: 'In C: if (front == -1) { printf("Queue Underflow\\n"); return -1; }',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: 0,
        queueType: 'circular',
        isFull: false,
        isEmpty: true,
        isTerminal: true,
        codeLine: 2,
      });
    } else {
      const removedVal = slots[curFront];

      steps.push({
        stepIndex: 0,
        title: `Prepare DEQUEUE at front [${curFront}] (${removedVal})`,
        description: `Reading item ${removedVal} from ring slot ${curFront}.`,
        rationale: 'int item = queue[front];',
        slots: buildSlots(slots, curFront, curRear, { [curFront]: 'dequeued' }),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'circular',
        isFull: false,
        isEmpty: false,
        codeLine: 4,
      });

      slots[curFront] = null;

      if (curFront === curRear) {
        // Last element dequeued
        curFront = -1;
        curRear = -1;
      } else {
        curFront = (curFront + 1) % capacity;
      }

      steps.push({
        stepIndex: 1,
        title: `DEQUEUE Complete: Removed ${removedVal}`,
        description: curFront === -1
          ? `Queue is now completely empty. Reset front = -1, rear = -1.`
          : `Front advanced via modular arithmetic: front = (front + 1) % ${capacity} = [${curFront}].`,
        rationale: 'Freed slot is immediately available for future enqueues without memory copying.',
        slots: buildSlots(slots, curFront, curRear),
        front: curFront,
        rear: curRear,
        capacity,
        count: countOccupied(),
        queueType: 'circular',
        isFull: false,
        isEmpty: curFront === -1,
        isTerminal: true,
        codeLine: 6,
      });
    }
  }

  return { steps, finalSlots: slots, finalFront: curFront, finalRear: curRear };
}
