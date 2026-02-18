import type { Topic } from '../types';

export const stacksQueues: Topic = {
  id: 'stacks-queues',
  title: 'Stacks & Queues',
  category: 'data-structures',
  description: 'LIFO and FIFO abstractions — the backbone of expression evaluation, BFS, and monotonic patterns.',
  complexity: {
    access: 'O(n)',
    search: 'O(n)',
    insert: 'O(1)',
    delete: 'O(1)',
  },
  theory: `Stacks and queues are abstract data types that restrict how elements are added and removed.

**Stack (LIFO — Last In, First Out):**
- Push adds to the top; pop removes from the top.
- JavaScript arrays are natural stacks: \`push()\` and \`pop()\` are both O(1).
- Used for: function call stack, undo/redo, expression parsing, DFS, backtracking.

**Queue (FIFO — First In, First Out):**
- Enqueue adds to the back; dequeue removes from the front.
- JavaScript \`Array.shift()\` is O(n) because it re-indexes. For performance-critical code, use a linked list or circular buffer.
- Used for: BFS, task scheduling, message queues, rate limiting.

**Deque (Double-Ended Queue):**
- Supports insertion and removal at both ends in O(1).
- Used for sliding window maximum, palindrome checking.

**Monotonic stack/queue:**
- A stack/queue where elements are maintained in sorted (monotonically increasing or decreasing) order.
- Key trick: when pushing a new element, pop all elements that violate the monotonic property.
- Solves "next greater element," "daily temperatures," and "sliding window maximum" in O(n).

**When to use:**
- Stack: anything with nesting (parentheses, HTML tags), last-seen tracking, DFS.
- Queue: anything with ordering (BFS, scheduling), producer-consumer patterns.`,
  keyPoints: [
    'Stack: push/pop at one end — LIFO — O(1) operations',
    'Queue: enqueue at back, dequeue from front — FIFO — O(1) with proper implementation',
    'JS Array.shift() is O(n) — avoid for hot-path queues',
    'Monotonic stack: maintains sorted order, solves "next greater/smaller" in O(n)',
    'Call stack is itself a stack — recursion depth = stack depth',
    'BFS uses a queue; DFS uses a stack (or recursion)',
  ],
  visualization: 'StackQueueViz',
  useCases: [
    {
      title: 'Undo/redo system',
      description:
        'Editor undo/redo using two stacks — performing an action pushes onto undo stack and clears redo; undoing moves to redo stack.',
      code: `interface EditorAction {
  type: 'insert' | 'delete' | 'format';
  position: number;
  content: string;
  previousContent: string;
}

class UndoRedoManager {
  private undoStack: EditorAction[] = [];
  private redoStack: EditorAction[] = [];

  execute(action: EditorAction): void {
    this.undoStack.push(action);
    this.redoStack.length = 0; // new action invalidates redo history
  }

  undo(): EditorAction | undefined {
    const action = this.undoStack.pop();
    if (!action) return undefined;
    this.redoStack.push(action);
    return action; // caller applies the reverse
  }

  redo(): EditorAction | undefined {
    const action = this.redoStack.pop();
    if (!action) return undefined;
    this.undoStack.push(action);
    return action; // caller re-applies the action
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

const history = new UndoRedoManager();
history.execute({
  type: 'insert',
  position: 0,
  content: 'Hello',
  previousContent: '',
});
history.undo();  // returns the insert action to reverse
history.redo();  // re-applies the insert`,
      complexity: 'Time: O(1) per operation | Space: O(n) actions',
    },
    {
      title: 'Bracket/tag validator',
      description:
        'Validate nested HTML tags or JSON brackets in a code linter, ensuring every opening tag has a matching close in correct order.',
      code: `type TokenType = 'open' | 'close';
interface TagToken {
  type: TokenType;
  name: string;
  line: number;
}

interface ValidationError {
  message: string;
  line: number;
}

function validateNesting(tokens: TagToken[]): ValidationError[] {
  const stack: TagToken[] = [];
  const errors: ValidationError[] = [];

  for (const token of tokens) {
    if (token.type === 'open') {
      stack.push(token);
      continue;
    }

    // Closing tag
    if (stack.length === 0) {
      errors.push({
        message: \`Unexpected closing tag </\${token.name}>\`,
        line: token.line,
      });
      continue;
    }

    const openTag = stack.pop()!;
    if (openTag.name !== token.name) {
      errors.push({
        message: \`Mismatched tags: <\${openTag.name}> on line \${openTag.line} closed by </\${token.name}>\`,
        line: token.line,
      });
    }
  }

  for (const unclosed of stack) {
    errors.push({
      message: \`Unclosed tag <\${unclosed.name}>\`,
      line: unclosed.line,
    });
  }

  return errors;
}

// Lint HTML: <div><span></div></span> → mismatched error`,
      complexity: 'Time: O(n) tokens | Space: O(d) nesting depth',
    },
    {
      title: 'Toast notification queue',
      description:
        'FIFO queue for stacking toast notifications with auto-dismiss timers. New toasts enqueue at the back; dismissed or expired toasts dequeue from the front — the pattern used by every notification system.',
      code: `type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
  durationMs: number;
}

class ToastQueue {
  private queue: Toast[] = [];
  private maxVisible: number;
  private listeners: Array<() => void> = [];

  constructor(maxVisible: number = 5) {
    this.maxVisible = maxVisible;
  }

  push(type: ToastType, message: string, durationMs = 5000): Toast {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type,
      message,
      createdAt: Date.now(),
      durationMs,
    };
    this.queue.push(toast); // enqueue at back

    // Auto-dismiss: remove from front after duration
    setTimeout(() => this.dismiss(toast.id), durationMs);

    // If over limit, dismiss oldest
    while (this.queue.length > this.maxVisible) {
      this.queue.shift(); // dequeue from front (FIFO)
    }

    this.notify();
    return toast;
  }

  dismiss(id: string): void {
    const idx = this.queue.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      this.notify();
    }
  }

  get visible(): Toast[] {
    return [...this.queue];
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}

const toasts = new ToastQueue(3);
toasts.push('success', 'Changes saved');
toasts.push('error', 'Upload failed', 8000);
// Renders up to 3 toasts, oldest auto-dismisses first`,
      complexity: 'Time: O(1) push, O(n) dismiss by id | Space: O(maxVisible)',
    },
    {
      title: 'Browser history navigation',
      description:
        'Back/forward navigation using two stacks, modeling how a browser manages page history when the user navigates, goes back, or goes forward.',
      code: `class BrowserHistory {
  private backStack: string[] = [];
  private forwardStack: string[] = [];
  private current: string;

  constructor(homepage: string) {
    this.current = homepage;
  }

  visit(url: string): void {
    this.backStack.push(this.current);
    this.current = url;
    this.forwardStack.length = 0; // new navigation clears forward
  }

  back(): string | null {
    if (this.backStack.length === 0) return null;
    this.forwardStack.push(this.current);
    this.current = this.backStack.pop()!;
    return this.current;
  }

  forward(): string | null {
    if (this.forwardStack.length === 0) return null;
    this.backStack.push(this.current);
    this.current = this.forwardStack.pop()!;
    return this.current;
  }

  get currentUrl(): string {
    return this.current;
  }
}

const browser = new BrowserHistory('https://home.com');
browser.visit('https://docs.com');
browser.visit('https://blog.com');
browser.back();    // → 'https://docs.com'
browser.back();    // → 'https://home.com'
browser.forward(); // → 'https://docs.com'
browser.visit('https://new.com'); // clears forward stack`,
      complexity: 'Time: O(1) per operation | Space: O(n) visited pages',
    },
    {
      title: 'Expression evaluator',
      description:
        'Evaluate mathematical expressions in a spreadsheet formula engine, using a stack to handle operator precedence and parentheses.',
      code: `type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function evaluate(tokens: Token[]): number {
  const values: number[] = [];
  const ops: string[] = [];

  const precedence: Record<string, number> = {
    '+': 1, '-': 1, '*': 2, '/': 2,
  };

  const applyOp = () => {
    const b = values.pop()!;
    const a = values.pop()!;
    const op = ops.pop()!;
    switch (op) {
      case '+': values.push(a + b); break;
      case '-': values.push(a - b); break;
      case '*': values.push(a * b); break;
      case '/': values.push(a / b); break;
    }
  };

  for (const token of tokens) {
    if (token.type === 'number') {
      values.push(token.value);
    } else if (token.type === 'lparen') {
      ops.push('(');
    } else if (token.type === 'rparen') {
      while (ops[ops.length - 1] !== '(') applyOp();
      ops.pop(); // remove '('
    } else {
      while (
        ops.length > 0 &&
        ops[ops.length - 1] !== '(' &&
        precedence[ops[ops.length - 1]] >= precedence[token.value]
      ) {
        applyOp();
      }
      ops.push(token.value);
    }
  }

  while (ops.length > 0) applyOp();
  return values[0];
}

// Evaluate "3 + 4 * (2 - 1)" → 7`,
      complexity: 'Time: O(n) tokens | Space: O(n)',
    },
    {
      title: 'Event-driven middleware pipeline',
      description:
        'Request/response middleware chain using a queue — each middleware processes the request and calls next(), similar to Express or Koa.',
      code: `interface HttpRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
}

interface HttpResponse {
  status: number;
  body: unknown;
}

type Middleware = (
  req: HttpRequest,
  res: HttpResponse,
  next: () => Promise<void>
) => Promise<void>;

class MiddlewarePipeline {
  private middlewares: Middleware[] = [];

  use(mw: Middleware): void {
    this.middlewares.push(mw);
  }

  async execute(req: HttpRequest): Promise<HttpResponse> {
    const res: HttpResponse = { status: 200, body: null };
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const mw = this.middlewares[index++];
        await mw(req, res, next);
      }
    };

    await next();
    return res;
  }
}

const pipeline = new MiddlewarePipeline();
pipeline.use(async (req, _res, next) => {
  const start = Date.now();
  await next();
  console.log(\`\${req.method} \${req.path} — \${Date.now() - start}ms\`);
});
pipeline.use(async (req, res, next) => {
  if (!req.headers['authorization']) {
    res.status = 401;
    return; // short-circuit, skip remaining middleware
  }
  await next();
});`,
      complexity: 'Time: O(m) middlewares | Space: O(m) call stack depth',
    },
  ],
};
