import type { Topic } from '../types';

export const recursion: Topic = {
  id: 'recursion',
  title: 'Recursion',
  category: 'techniques',
  description: 'A function that calls itself to solve smaller instances of the same problem — the foundation of divide-and-conquer, backtracking, and tree traversal.',
  invariant: 'Each call receives a strictly smaller subproblem. The base case terminates recursion, and each level combines subproblem results into the answer for its level.',
  theory: `Recursion solves a problem by reducing it to smaller instances of itself until reaching a trivial **base case**.

**Anatomy of a recursive function:**
1. **Base case** — The condition that stops recursion. Without it, you get infinite recursion and a stack overflow.
2. **Recursive case** — Break the problem into smaller subproblems and call the function on them.
3. **Combine** — Merge the results of subproblems into the answer for the current problem.

**The call stack:** Each recursive call creates a new stack frame with its own local variables. The stack grows until a base case is reached, then unwinds as results are returned. Stack depth is O(recursion depth), which can be a concern for deep recursion (e.g., linked list of length 100,000).

**Tail recursion:** A recursive call is "tail" if it's the very last operation in the function — the result is returned directly without further computation. Some languages optimize tail calls to avoid stack growth (tail call optimization / TCO). JavaScript engines technically support TCO in strict mode per the spec, but in practice only Safari implements it. Don't rely on TCO in Node.js or Chrome.

**Recursion vs iteration:**
- Every recursive algorithm can be converted to iteration using an explicit stack.
- Recursion is more natural for tree/graph traversal, divide-and-conquer, and backtracking.
- Iteration is safer for very deep recursion (no stack overflow) and often faster (no function call overhead).

**Common recursive patterns:**
- **Linear recursion:** f(n) calls f(n-1) — factorial, linked list operations
- **Binary recursion:** f(n) calls f(n-1) and f(n-2) — Fibonacci, binary tree traversal
- **Multiple recursion:** f(n) makes more than two recursive calls — permutations, N-queens
- **Mutual recursion:** f calls g, g calls f — even/odd checking, parser descent

**Tips for writing recursive solutions:**
- Trust the recursion: assume the recursive call returns the correct answer for the subproblem.
- Focus on one level: what does this call need to do given correct results from subproblems?
- Draw the recursion tree to understand the branching and depth.`,
  visualization: 'RecursionViz',
  keyPoints: [
    'Every recursive function needs a base case to terminate',
    'Each call adds a frame to the call stack — stack depth = recursion depth',
    'Trust the recursion: assume subproblem calls return correct results',
    'Any recursion can be converted to iteration with an explicit stack',
    'Tail recursion avoids stack growth in theory, but JS engines rarely optimize it',
    'Draw the recursion tree to visualize time complexity and spot overlapping subproblems',
  ],
  useCases: [
    {
      title: 'Nested config deep merge',
      description:
        'Recursively merge two nested configuration objects with override semantics — the pattern used by tools like webpack, Vite, and dotenv for layered config.',
      code: `type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigObject
  | ConfigValue[];

interface ConfigObject {
  [key: string]: ConfigValue;
}

function deepMerge(base: ConfigObject, override: ConfigObject): ConfigObject {
  const result: ConfigObject = { ...base };

  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overVal = override[key];

    if (
      isConfigObject(baseVal) &&
      isConfigObject(overVal)
    ) {
      // Both are objects — recurse to merge nested keys
      result[key] = deepMerge(baseVal, overVal);
    } else {
      // Override wins for primitives, arrays, or type mismatches
      result[key] = overVal;
    }
  }

  return result;
}

function isConfigObject(val: unknown): val is ConfigObject {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

// deepMerge(
//   { db: { host: 'localhost', port: 5432 }, debug: false },
//   { db: { port: 5433, ssl: true }, debug: true }
// )
// → { db: { host: 'localhost', port: 5433, ssl: true }, debug: true }`,
      complexity: 'Time: O(n) total keys | Space: O(d) stack where d = nesting depth',
    },
    {
      title: 'Dynamic form builder',
      description:
        'Recursively render a form from a JSON schema, handling nested field groups, conditional fields, and repeatable sections — the pattern behind headless form builders and CMS content editors.',
      code: `type FieldType = 'text' | 'number' | 'select' | 'group' | 'repeater';

interface FormField {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];            // for select
  fields?: FormField[];          // for group/repeater
  showWhen?: { field: string; equals: unknown };
}

interface FlatField {
  path: string;        // e.g. "address.city" or "items[0].name"
  label: string;
  type: FieldType;
  depth: number;
  required: boolean;
  visible: boolean;
}

function flattenFormSchema(
  fields: FormField[],
  values: Record<string, unknown>,
  parentPath: string = '',
  depth: number = 0
): FlatField[] {
  const result: FlatField[] = [];

  for (const field of fields) {
    const path = parentPath
      ? \`\${parentPath}.\${field.name}\`
      : field.name;

    // Check conditional visibility
    const visible = field.showWhen
      ? getNestedValue(values, field.showWhen.field) === field.showWhen.equals
      : true;

    result.push({
      path,
      label: field.label,
      type: field.type,
      depth,
      required: field.required ?? false,
      visible,
    });

    if (!visible) continue;

    // Recursive case: nested group
    if (field.type === 'group' && field.fields) {
      result.push(
        ...flattenFormSchema(field.fields, values, path, depth + 1)
      );
    }

    // Recursive case: repeater (array of groups)
    if (field.type === 'repeater' && field.fields) {
      const items = (getNestedValue(values, path) as unknown[]) ?? [];
      for (let i = 0; i < items.length; i++) {
        result.push(
          ...flattenFormSchema(
            field.fields,
            values,
            \`\${path}[\${i}]\`,
            depth + 1
          )
        );
      }
    }
  }

  return result;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (acc, key) => (acc as Record<string, unknown>)?.[key],
    obj
  );
}

// Schema: { type: 'group', name: 'address', fields: [
//   { name: 'country', type: 'select' },
//   { name: 'state', type: 'text', showWhen: { field: 'address.country', equals: 'US' } },
//   { name: 'city', type: 'text' },
// ]}
// values = { address: { country: 'US' } }
// → state field is visible; renders nested at depth 1`,
      complexity: 'Time: O(n) fields | Space: O(d) stack where d = max nesting depth',
    },
    {
      title: 'Comment thread rendering',
      description:
        'Recursively render nested comment threads (Reddit/HN style) with depth tracking, producing a flat list of display items with indentation levels.',
      code: `interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  children: Comment[];
}

interface FlatComment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  depth: number;
  parentId: string | null;
}

function flattenCommentThread(
  comments: Comment[],
  depth: number = 0,
  parentId: string | null = null
): FlatComment[] {
  const result: FlatComment[] = [];

  for (const comment of comments) {
    // Add this comment at the current depth
    result.push({
      id: comment.id,
      author: comment.author,
      text: comment.text,
      timestamp: comment.timestamp,
      depth,
      parentId,
    });

    // Recurse into replies, incrementing depth
    if (comment.children.length > 0) {
      const childComments = flattenCommentThread(
        comment.children,
        depth + 1,
        comment.id
      );
      result.push(...childComments);
    }
  }

  return result;
}

// Renders like:
// [depth 0] alice: "Great article!"
// [depth 1]   bob: "Thanks!"
// [depth 2]     alice: "You're welcome"
// [depth 0] charlie: "I disagree..."`,
      complexity: 'Time: O(n) comments | Space: O(d) stack where d = max nesting depth',
    },
    {
      title: 'AST transformation',
      description:
        'Recursively walk and transform an abstract syntax tree — the core pattern used by code formatters, linters, and transpilers like Babel and ESLint.',
      code: `interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
}

type Visitor = {
  [nodeType: string]: (node: ASTNode) => ASTNode;
};

function transformAST(node: ASTNode, visitor: Visitor): ASTNode {
  // Apply visitor if one exists for this node type
  const transformed = visitor[node.type]
    ? visitor[node.type](node)
    : { ...node };

  // Base case: leaf node with no children
  if (!transformed.children || transformed.children.length === 0) {
    return transformed;
  }

  // Recursive case: transform all children
  return {
    ...transformed,
    children: transformed.children.map(
      child => transformAST(child, visitor)
    ),
  };
}

// Example: rename all identifiers from camelCase to snake_case
const renamingVisitor: Visitor = {
  Identifier: (node) => ({
    ...node,
    value: node.value?.replace(
      /[A-Z]/g,
      letter => \`_\${letter.toLowerCase()}\`
    ),
  }),
};

// const ast: ASTNode = {
//   type: 'Program',
//   children: [
//     { type: 'Identifier', value: 'myVariable' },
//     { type: 'CallExpression', children: [
//       { type: 'Identifier', value: 'getUserName' },
//     ]},
//   ],
// };
// transformAST(ast, renamingVisitor)
// → Identifier values become 'my_variable', 'get_user_name'`,
      complexity: 'Time: O(n) nodes | Space: O(d) stack where d = AST depth',
    },
    {
      title: 'Organization chart flattening',
      description:
        'Recursively flatten a hierarchical org chart to a list with level indicators — used in HR tools and reporting dashboards.',
      code: `interface Employee {
  id: string;
  name: string;
  title: string;
  directReports: Employee[];
}

interface OrgRow {
  id: string;
  name: string;
  title: string;
  level: number;
  managerId: string | null;
  totalReports: number;
}

function flattenOrgChart(
  employee: Employee,
  level: number = 0,
  managerId: string | null = null
): OrgRow[] {
  // Count total reports recursively
  const totalReports = countReports(employee) - 1;

  const row: OrgRow = {
    id: employee.id,
    name: employee.name,
    title: employee.title,
    level,
    managerId,
    totalReports,
  };

  const rows: OrgRow[] = [row];

  // Recurse into direct reports
  for (const report of employee.directReports) {
    rows.push(
      ...flattenOrgChart(report, level + 1, employee.id)
    );
  }

  return rows;
}

function countReports(employee: Employee): number {
  let count = 1; // Count self
  for (const report of employee.directReports) {
    count += countReports(report);
  }
  return count;
}

// flattenOrgChart(ceo) produces a flat table:
// Level 0: CEO (totalReports: 150)
// Level 1:   VP Engineering (totalReports: 80)
// Level 2:     Director Platform (totalReports: 25)
// Level 2:     Director Product (totalReports: 50)`,
      complexity: 'Time: O(n) employees | Space: O(d) stack where d = org depth',
    },
    {
      title: 'JSON schema validation',
      description:
        'Recursively validate a nested object against a JSON-schema-like definition, reporting all validation errors with their paths.',
      code: `interface SchemaNode {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: string[];
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
}

interface ValidationError {
  path: string;
  message: string;
}

function validate(
  data: unknown,
  schema: SchemaNode,
  path: string = '$'
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Base cases: primitive type checks
  if (schema.type === 'string' && typeof data !== 'string') {
    return [{ path, message: \`Expected string, got \${typeof data}\` }];
  }
  if (schema.type === 'number' && typeof data !== 'number') {
    return [{ path, message: \`Expected number, got \${typeof data}\` }];
  }
  if (schema.type === 'boolean' && typeof data !== 'boolean') {
    return [{ path, message: \`Expected boolean, got \${typeof data}\` }];
  }

  // Recursive case: object with properties
  if (schema.type === 'object' && schema.properties) {
    if (typeof data !== 'object' || data === null) {
      return [{ path, message: 'Expected object' }];
    }
    const obj = data as Record<string, unknown>;

    for (const key of schema.required ?? []) {
      if (!(key in obj)) {
        errors.push({ path: \`\${path}.\${key}\`, message: 'Required field missing' });
      }
    }
    for (const [key, subSchema] of Object.entries(schema.properties)) {
      if (key in obj) {
        errors.push(...validate(obj[key], subSchema, \`\${path}.\${key}\`));
      }
    }
  }

  // Recursive case: array with item schema
  if (schema.type === 'array' && schema.items) {
    if (!Array.isArray(data)) {
      return [{ path, message: 'Expected array' }];
    }
    for (let i = 0; i < data.length; i++) {
      errors.push(...validate(data[i], schema.items, \`\${path}[\${i}]\`));
    }
  }

  return errors;
}`,
      complexity: 'Time: O(n) data nodes | Space: O(d) stack where d = nesting depth',
    },
  ],
};
