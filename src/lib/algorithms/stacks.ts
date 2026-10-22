import { BaseSimulationStep } from '@/types/dsa';

export interface StackSimulationStep extends BaseSimulationStep {
  elements: number[];
  capacity: number;
  topIndex: number;
  operationType: 'push' | 'pop' | 'peek' | 'overflow' | 'underflow';
}

export function simulateStackOperations(
  initialElements: number[],
  capacity: number,
  operation: 'push' | 'pop' | 'peek',
  valToPush: number = 99
): { steps: StackSimulationStep[]; finalElements: number[] } {
  const steps: StackSimulationStep[] = [];
  const stack = [...initialElements];

  if (operation === 'push') {
    if (stack.length >= capacity) {
      steps.push({
        stepIndex: 0,
        title: 'Stack Overflow Error!',
        description: `Cannot push ${valToPush}. Stack is already at maximum capacity (${capacity}).`,
        rationale: 'In C: if (top == MAX - 1) { printf("Stack Overflow\\n"); return; }',
        elements: [...stack],
        capacity,
        topIndex: stack.length - 1,
        operationType: 'overflow',
        isTerminal: true,
        codeLine: 2,
      });
    } else {
      steps.push({
        stepIndex: 0,
        title: `Prepare to PUSH ${valToPush}`,
        description: `Incrementing top pointer from index ${stack.length - 1} to ${stack.length}.`,
        rationale: 'top = top + 1;',
        elements: [...stack],
        capacity,
        topIndex: stack.length - 1,
        operationType: 'push',
        activePointers: { nextTop: stack.length, value: valToPush },
        codeLine: 4,
      });

      stack.push(valToPush);

      steps.push({
        stepIndex: 1,
        title: `PUSH: Placed ${valToPush} at Top of Stack`,
        description: `stack[${stack.length - 1}] = ${valToPush}. Total elements: ${stack.length}/${capacity}.`,
        rationale: 'Push completed in O(1) time and space.',
        elements: [...stack],
        capacity,
        topIndex: stack.length - 1,
        operationType: 'push',
        highlightedIndices: [stack.length - 1],
        activePointers: { top: stack.length - 1, value: valToPush },
        isTerminal: true,
        codeLine: 5,
      });
    }
  } else if (operation === 'pop') {
    if (stack.length === 0) {
      steps.push({
        stepIndex: 0,
        title: 'Stack Underflow Error!',
        description: 'Cannot POP from an empty stack. top is currently -1.',
        rationale: 'In C: if (top == -1) { printf("Stack Underflow\\n"); return -1; }',
        elements: [],
        capacity,
        topIndex: -1,
        operationType: 'underflow',
        isTerminal: true,
        codeLine: 2,
      });
    } else {
      const popped = stack[stack.length - 1];

      steps.push({
        stepIndex: 0,
        title: `Prepare to POP Top Element (${popped})`,
        description: `Reading element at top index ${stack.length - 1} before removal.`,
        rationale: 'int item = stack[top];',
        elements: [...stack],
        capacity,
        topIndex: stack.length - 1,
        operationType: 'pop',
        highlightedIndices: [stack.length - 1],
        activePointers: { top: stack.length - 1, item: popped },
        codeLine: 4,
      });

      stack.pop();

      steps.push({
        stepIndex: 1,
        title: `POP: Removed Element ${popped}`,
        description: `top decremented to ${stack.length - 1}. Stack now contains ${stack.length} elements.`,
        rationale: 'top = top - 1; return item; O(1) operation.',
        elements: [...stack],
        capacity,
        topIndex: stack.length - 1,
        operationType: 'pop',
        isTerminal: true,
        codeLine: 5,
      });
    }
  } else if (operation === 'peek') {
    if (stack.length === 0) {
      steps.push({
        stepIndex: 0,
        title: 'Stack is Empty',
        description: 'PEEK operation returned NULL/Empty. top is -1.',
        rationale: 'No elements to inspect.',
        elements: [],
        capacity,
        topIndex: -1,
        operationType: 'peek',
        isTerminal: true,
      });
    } else {
      const topVal = stack[stack.length - 1];
      steps.push({
        stepIndex: 0,
        title: `PEEK: Top Value is ${topVal}`,
        description: `stack[${stack.length - 1}] = ${topVal}. Stack elements remain unmodified.`,
        rationale: 'return stack[top]; O(1) time without modifying top pointer.',
        elements: [...stack],
        capacity,
        topIndex: stack.length - 1,
        operationType: 'peek',
        highlightedIndices: [stack.length - 1],
        isTerminal: true,
      });
    }
  }

  return { steps, finalElements: stack };
}

// -------------------------------------------------------------
// EXPRESSION CONVERSION & EVALUATION
// -------------------------------------------------------------

export interface ExpressionStep extends BaseSimulationStep {
  currentSymbol: string;
  operatorStack: string[];
  outputExpression: string;
  explanation: string;
}

export function simulateInfixToPostfix(infix: string): { steps: ExpressionStep[]; postfix: string } {
  const steps: ExpressionStep[] = [];
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  const isOperator = (ch: string) => ['+', '-', '*', '/', '^'].includes(ch);
  const isAlphaNum = (ch: string) => /[a-zA-Z0-9]/.test(ch);

  const tokens = infix.replace(/\s+/g, '').split('');
  const opStack: string[] = [];
  let output = '';

  steps.push({
    stepIndex: 0,
    title: 'Initialize Infix to Postfix Conversion',
    description: `Input Infix expression: "${infix}". Operator stack initialized to empty.`,
    rationale: 'Shunting-yard algorithm: Operands output directly; operators stored on stack by precedence.',
    currentSymbol: '',
    operatorStack: [],
    outputExpression: '',
    explanation: 'Begin reading tokens from left to right.',
    codeLine: 1,
  });

  for (let i = 0; i < tokens.length; i++) {
    const sym = tokens[i];

    if (isAlphaNum(sym)) {
      output += sym;
      steps.push({
        stepIndex: steps.length,
        title: `Token '${sym}': Operand`,
        description: `Operands bypass the stack and append directly to the postfix output stream.`,
        rationale: 'if (isalnum(sym)) postfix[j++] = sym;',
        currentSymbol: sym,
        operatorStack: [...opStack],
        outputExpression: output,
        explanation: `Appended operand '${sym}' to output.`,
        codeLine: 3,
      });
    } else if (sym === '(') {
      opStack.push(sym);
      steps.push({
        stepIndex: steps.length,
        title: `Token '(': Left Parenthesis`,
        description: `Pushed '(' onto the operator stack to establish a new sub-expression boundary.`,
        rationale: 'push(sym); Left parenthesis sets temporary lower precedence boundary.',
        currentSymbol: sym,
        operatorStack: [...opStack],
        outputExpression: output,
        explanation: 'Pushed left parenthesis onto operator stack.',
        codeLine: 4,
      });
    } else if (sym === ')') {
      steps.push({
        stepIndex: steps.length,
        title: `Token ')': Right Parenthesis`,
        description: `Popping all operators from stack and appending to output until matching '(' is found.`,
        rationale: 'while (stack[top] != \'(\') postfix[j++] = pop(); pop();',
        currentSymbol: sym,
        operatorStack: [...opStack],
        outputExpression: output,
        explanation: 'Encountered closing parenthesis.',
        codeLine: 5,
      });

      while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
        const popped = opStack.pop()!;
        output += popped;
        steps.push({
          stepIndex: steps.length,
          title: `Popped '${popped}' from Stack to Output`,
          description: `Extracted operator '${popped}' from inside parentheses.`,
          rationale: 'postfix[j++] = pop();',
          currentSymbol: sym,
          operatorStack: [...opStack],
          outputExpression: output,
          explanation: `Appended '${popped}' to output.`,
          codeLine: 6,
        });
      }
      if (opStack.length > 0 && opStack[opStack.length - 1] === '(') {
        opStack.pop(); // discard '('
      }
    } else if (isOperator(sym)) {
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1] !== '(' &&
        precedence[opStack[opStack.length - 1]] >= precedence[sym]
      ) {
        const popped = opStack.pop()!;
        output += popped;
        steps.push({
          stepIndex: steps.length,
          title: `Precedence Check: Pop '${popped}'`,
          description: `Top operator '${popped}' has higher or equal precedence (${precedence[popped]}) than '${sym}' (${precedence[sym]}). Popping to output.`,
          rationale: 'while (precedence(top) >= precedence(sym)) output += pop();',
          currentSymbol: sym,
          operatorStack: [...opStack],
          outputExpression: output,
          explanation: `Popped '${popped}' due to precedence rules.`,
          codeLine: 8,
        });
      }

      opStack.push(sym);
      steps.push({
        stepIndex: steps.length,
        title: `Push Operator '${sym}' onto Stack`,
        description: `Operator '${sym}' placed onto stack (Precedence: ${precedence[sym]}).`,
        rationale: 'push(sym);',
        currentSymbol: sym,
        operatorStack: [...opStack],
        outputExpression: output,
        explanation: `Pushed '${sym}' to operator stack.`,
        codeLine: 9,
      });
    }
  }

  // Drain remaining operators
  while (opStack.length > 0) {
    const popped = opStack.pop()!;
    if (popped !== '(') {
      output += popped;
      steps.push({
        stepIndex: steps.length,
        title: `Drain Stack: Pop '${popped}'`,
        description: `Input tokens consumed. Popping remaining operator '${popped}' to output.`,
        rationale: 'while (!isEmpty()) output += pop();',
        currentSymbol: 'EOF',
        operatorStack: [...opStack],
        outputExpression: output,
        explanation: `Flushed operator '${popped}'.`,
        codeLine: 11,
      });
    }
  }

  steps.push({
    stepIndex: steps.length,
    title: 'Conversion Complete',
    description: `Final Postfix (Reverse Polish) Notation: "${output}".`,
    rationale: 'No parentheses required in postfix format for unambiguous evaluation.',
    currentSymbol: 'DONE',
    operatorStack: [],
    outputExpression: output,
    explanation: 'Postfix expression ready for evaluation.',
    isTerminal: true,
    codeLine: 12,
  });

  return { steps, postfix: output };
}

export interface PostfixEvalStep extends BaseSimulationStep {
  token: string;
  operandStack: number[];
  operandA?: number;
  operandB?: number;
  operator?: string;
  computedResult?: number;
}

export function simulatePostfixEvaluation(postfix: string): { steps: PostfixEvalStep[]; result: number } {
  const steps: PostfixEvalStep[] = [];
  const tokens = postfix.trim().split(/\s+/).length > 1
    ? postfix.trim().split(/\s+/)
    : postfix.trim().split('');

  const stack: number[] = [];

  steps.push({
    stepIndex: 0,
    title: 'Initialize Postfix Evaluation',
    description: `Expression: "${postfix}". Operand stack empty.`,
    rationale: 'Numbers are pushed onto stack. Operators pop two operands and push result.',
    token: '',
    operandStack: [],
    codeLine: 1,
  });

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const num = Number(t);

    if (!isNaN(num) && t !== '') {
      stack.push(num);
      steps.push({
        stepIndex: steps.length,
        title: `Token '${t}': Push Operand`,
        description: `Pushed value ${num} onto the operand stack.`,
        rationale: 'push(operand);',
        token: t,
        operandStack: [...stack],
        codeLine: 3,
      });
    } else if (['+', '-', '*', '/', '^'].includes(t)) {
      const b = stack.pop() ?? 0;
      const a = stack.pop() ?? 0;
      let res = 0;

      switch (t) {
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b; break;
        case '/': res = b !== 0 ? Math.floor(a / b) : 0; break;
        case '^': res = Math.pow(a, b); break;
      }

      stack.push(res);

      steps.push({
        stepIndex: steps.length,
        title: `Operator '${t}': Compute ${a} ${t} ${b} = ${res}`,
        description: `Popped operand B = ${b}, operand A = ${a}. Computed ${a} ${t} ${b} = ${res}. Pushed result ${res} back onto stack.`,
        rationale: 'b = pop(); a = pop(); result = a op b; push(result);',
        token: t,
        operandStack: [...stack],
        operandA: a,
        operandB: b,
        operator: t,
        computedResult: res,
        codeLine: 5,
      });
    }
  }

  const finalRes = stack.length > 0 ? stack[0] : 0;

  steps.push({
    stepIndex: steps.length,
    title: `Evaluation Complete: Final Result = ${finalRes}`,
    description: `Single final value remaining on the stack: ${finalRes}.`,
    rationale: 'return pop();',
    token: 'EOF',
    operandStack: [...stack],
    computedResult: finalRes,
    isTerminal: true,
    codeLine: 7,
  });

  return { steps, result: finalRes };
}

// -------------------------------------------------------------
// RECURSION CALL STACK SIMULATOR
// -------------------------------------------------------------

export interface CallStackFrame {
  id: string;
  functionName: string;
  args: Record<string, string | number>;
  returnValue?: string | number;
  phase: 'call' | 'waiting' | 'returning';
}

export interface RecursionSimulationStep extends BaseSimulationStep {
  callStack: CallStackFrame[];
  currentCall: CallStackFrame;
  phase: 'descent' | 'base_case' | 'unwinding';
}

export function simulateRecursiveMultiply(a: number, b: number): { steps: RecursionSimulationStep[]; result: number } {
  const steps: RecursionSimulationStep[] = [];
  const stack: CallStackFrame[] = [];

  function recurse(x: number, y: number, depth: number): number {
    const frameId = `call-mult-${x}-${y}-${depth}`;
    const frame: CallStackFrame = {
      id: frameId,
      functionName: `multiply(${x}, ${y})`,
      args: { a: x, b: y },
      phase: 'call',
    };

    stack.push(frame);

    if (y === 0) {
      steps.push({
        stepIndex: steps.length,
        title: `Base Condition Reached: multiply(${x}, 0) = 0`,
        description: `b == 0: Terminating condition reached! Returning 0 without further recursive calls.`,
        rationale: 'if (b == 0) return 0; // Base case prevents infinite recursion',
        callStack: stack.map((f) => ({ ...f })),
        currentCall: { ...frame, returnValue: 0, phase: 'returning' },
        phase: 'base_case',
        codeLine: 2,
      });

      frame.returnValue = 0;
      frame.phase = 'returning';
      stack.pop();
      return 0;
    } else {
      steps.push({
        stepIndex: steps.length,
        title: `Descent: multiply(${x}, ${y})`,
        description: `Calling multiply(${x}, ${y - 1}) recursively. Current frame pauses awaiting result: ${x} + multiply(${x}, ${y - 1}).`,
        rationale: 'return a + multiply(a, b - 1); // Subproblem decomposition',
        callStack: stack.map((f) => ({ ...f })),
        currentCall: { ...frame },
        phase: 'descent',
        codeLine: 4,
      });

      frame.phase = 'waiting';
      const subResult = recurse(x, y - 1, depth + 1);
      const res = x + subResult;
      frame.returnValue = res;
      frame.phase = 'returning';

      steps.push({
        stepIndex: steps.length,
        title: `Unwinding: multiply(${x}, ${y}) Returns ${res}`,
        description: `Received subproblem answer ${subResult}. Computing ${x} + ${subResult} = ${res}. Frame popped from call stack.`,
        rationale: 'Execution resumes at paused point and returns value to caller.',
        callStack: stack.map((f) => ({ ...f })),
        currentCall: { ...frame },
        phase: 'unwinding',
        codeLine: 5,
      });

      stack.pop();
      return res;
    }
  }

  const finalAnswer = recurse(a, b, 0);

  steps.push({
    stepIndex: steps.length,
    title: `Recursion Complete: Result = ${finalAnswer}`,
    description: `All activation records cleared from the runtime call stack. Final product: ${a} * ${b} = ${finalAnswer}.`,
    rationale: 'Maximum call stack depth was ' + (b + 1) + ' frames: O(b) auxiliary memory.',
    callStack: [],
    currentCall: {
      id: 'final',
      functionName: `multiply(${a}, ${b})`,
      args: { a, b },
      returnValue: finalAnswer,
      phase: 'returning',
    },
    phase: 'unwinding',
    isTerminal: true,
    codeLine: 6,
  });

  return { steps, result: finalAnswer };
}
