# Fathom — Product Specification

**Version:** 1.0  
**Stack:** Next.js 14+ (App Router) · TypeScript (strict) · CSS Modules · Client-side only

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature Requirements (MVP)](#2-feature-requirements-mvp)
3. [Data Model](#3-data-model)
4. [Component Architecture](#4-component-architecture)
5. [Data Flow](#5-data-flow)
6. [Schema Inference Design](#6-schema-inference-design)
7. [Design System](#7-design-system)
8. [Edge Cases & Error States](#8-edge-cases--error-states)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Security](#10-security)
11. [Stretch Features (v2)](#11-stretch-features-v2)
12. [Decisions & Constraints](#12-decisions--constraints)

---

## 1. Project Overview

Fathom is a client-side developer tool for inspecting and understanding JSON API responses. A developer pastes a raw JSON payload and immediately gets an interactive, explorable tree view with type annotations, access path copying, search and filter, and automatic schema inference in both TypeScript and Zod formats.

The tool runs entirely in the browser with no backend, no authentication, and no external data transmission. The last parsed input is persisted to localStorage so it survives page refreshes. Fathom is also installable as a PWA for offline use.

### Core Value
Raw JSON responses from APIs are difficult to read at a glance. Fathom makes the structure, types, and access paths of any JSON payload immediately visible and navigable without requiring any tooling setup.

---

## 2. Feature Requirements (MVP)

### 2.1 JSON Input

| Requirement | Detail |
|---|---|
| Input surface | Large `<textarea>` with monospace font |
| Parse trigger | Explicit "Parse" button |
| Validation feedback | Inline error showing line and column of parse failure |
| Initial state | Pre-populated with representative sample JSON |
| Max size warning | Non-blocking warning at >200KB |
| Max size hard limit | Parsing blocked with a message at >1MB |
| Clear button | Resets input, tree, and schema output |
| Persistence | Last raw input written to localStorage; rehydrated on load |

### 2.2 Layout

The UI is a two-column split on desktop, stacked vertically on mobile.

**Left panel (~40%):** A tabbed interface with three tabs — Raw, TypeScript, and Zod. The Raw tab contains the textarea and Parse button. The TypeScript and Zod tabs each display their respective schema output in a `<pre><code>` block with their own independent Copy button, statically wired to that tab's output.

**Right panel (~60%):** The tree canvas. A floating search bar overlays the top of the canvas (static position, translucent background, does not scroll with the tree). The tree renders beneath it and is the dominant visual element of the UI.

A three-way theme toggle (Light / Dark / System) is accessible from the top-level chrome. System is the default. The selected preference is persisted to localStorage.

### 2.3 Tree View

| Requirement | Detail |
|---|---|
| Rendering | Recursive; each node renders its children |
| Expand/collapse | Objects and arrays are collapsible; primitives are leaves |
| Default state | Depth 0 and depth 1 expanded; deeper levels collapsed |
| Collapse preview | When collapsed: `{ 3 keys }` or `[ 12 items ]` |
| Type badges | Inline badge on every node indicating its type |
| Long string truncation | Strings >80 chars truncated with `…` and a "show more" toggle |
| Large array handling | Arrays >50 items show first 50, then paginate in chunks of 50 |

### 2.4 Access Path Copy

| Requirement | Detail |
|---|---|
| Trigger | Click anywhere on a node's key/label row |
| Path format | Dot notation for object keys, bracket notation for array indices |
| Quoted keys | Keys with non-identifier characters use bracket+quote notation: `data["content-type"]` |
| Feedback | Transient "Copied!" tooltip on the clicked node, auto-dismissed after 1.5s |
| Clipboard API | `navigator.clipboard.writeText` with `document.execCommand` fallback |

### 2.5 Search and Filter

| Requirement | Detail |
|---|---|
| Search scope | Matches against key names and stringified values |
| Behavior | Filters tree to matching nodes and their ancestors; auto-expands collapsed branches containing matches |
| Highlighting | Matching substring highlighted within results |
| Empty state | "No results for [query]" message |
| Debounce | 150ms on input |
| Clear | × button resets filter |

### 2.6 Schema Inference

Both schemas are generated at parse time and available immediately when switching tabs. Each tab has its own Copy button.

**TypeScript tab**
- Generates valid `interface` declarations, nested as needed
- Merges object shapes across array items; marks keys optional (`?`) if absent from some items
- Handles `null` values as `T | null`

**Zod tab**
- Generates `z.object({...})` declarations matching the TypeScript shape
- Uses `z.union([z.string(), z.null()])` for nullable fields
- Wraps root in `export const schema = ...`

---

## 3. Data Model

### 3.1 Parsed Tree Node

```typescript
type JsonPrimitive = string | number | boolean | null;

type JsonNodeBase = {
  id: string;           // Stable unique ID for React keys and accessibility
  path: string;         // Full dot-notation access path from root
  key: string | number; // The key or index pointing to this node in its parent
  depth: number;        // 0 = root
};

type PrimitiveNode = JsonNodeBase & {
  kind: 'primitive';
  valueType: 'string' | 'number' | 'boolean' | 'null';
  value: JsonPrimitive;
};

type ObjectNode = JsonNodeBase & {
  kind: 'object';
  children: TreeNode[];
  childCount: number;
};

type ArrayNode = JsonNodeBase & {
  kind: 'array';
  children: TreeNode[];
  childCount: number;
};

type TreeNode = PrimitiveNode | ObjectNode | ArrayNode;
```

`path`, `depth`, and `childCount` are pre-computed at parse time. Access path copy is O(1). Collapse previews require no child traversal. `id` is generated once per parse and stable for the lifetime of that parse result.

### 3.2 UI State

UI state is kept strictly separate from the parsed tree. The tree is immutable once parsed; UI state changes continuously.

```typescript
type TreeUIState = {
  expandedIds: Set<string>;
  searchQuery: string;
  matchingIds: Set<string>; // Computed from searchQuery; includes ancestor ids
  copiedId: string | null;
  schemaMode: 'typescript' | 'zod';
};
```

### 3.3 Application State

```typescript
type AppState = {
  rawInput: string;
  parseError: ParseError | null;
  tree: TreeNode | null;
  ui: TreeUIState;
};

type ParseError = {
  message: string;
  position?: { line: number; column: number };
};
```

---

## 4. Component Architecture

```
app/
└── page.tsx                    # Root page; owns AppState via useReducer

components/
├── JsonInput/
│   ├── JsonInput.tsx
│   └── JsonInput.module.css
│
├── TreeView/
│   ├── TreeView.tsx            # Receives root TreeNode + UIState
│   ├── TreeNode.tsx            # Recursive; renders one node and its children
│   ├── TypeBadge.tsx           # Type label badge, purely presentational
│   ├── CollapsePreview.tsx     # "{ 3 keys }" / "[ 12 items ]" summary
│   └── TreeView.module.css
│
├── SearchBar/
│   ├── SearchBar.tsx           # Floating over the tree canvas
│   └── SearchBar.module.css
│
├── SchemaOutput/
│   ├── SchemaOutput.tsx        # Renders inside TS or Zod tab; includes Copy button
│   └── SchemaOutput.module.css
│
├── TabPanel/
│   ├── TabPanel.tsx            # Left panel tab switcher: Raw / TypeScript / Zod
│   └── TabPanel.module.css
│
└── ThemeToggle/
    ├── ThemeToggle.tsx         # Three-way: Light / Dark / System
    └── ThemeToggle.module.css

lib/
├── parser.ts                   # JSON string → Result<TreeNode, ParseError>
├── search.ts                   # (query, tree) → Set<string> of matching ids
├── schema-inference.ts         # TreeNode → TypeScript string | Zod string
├── path-utils.ts               # Access path formatting; quoted-key detection
└── id-generator.ts             # Deterministic ID generation from path

hooks/
├── useAppState.ts              # useReducer wrapper; all state transitions
├── useCopyToClipboard.ts       # { copy(text), copiedId } with auto-clear timeout
├── useTheme.ts                 # Reads/writes theme preference; applies data-theme
└── useDebounce.ts              # Generic debounce hook
```

### Key Design Decisions

**`useReducer` for application state.** All state transitions are explicit and handled through named actions: `PARSE_JSON`, `TOGGLE_NODE`, `SET_SEARCH`, `SET_SCHEMA_MODE`, `CLEAR`. This makes state transitions predictable and the logic unit-testable independently of components.

**Pure functions in `lib/`.** `parser.ts`, `search.ts`, and `schema-inference.ts` have no React dependencies and can be unit-tested without mounting any components.

**`TreeNode.tsx` is recursive.** It renders itself for children, terminating at `PrimitiveNode`. React handles this cleanly for realistic JSON depths.

**No global state library.** The tree is passed as props. A Context scoped to `TreeView` is available as an escape hatch if deep prop-passing becomes a problem, but should not be introduced preemptively.

**localStorage sync via `useEffect`.** The reducer stays pure. A `useEffect` watches `state.rawInput` and writes to localStorage. Rehydration happens once on initialization before the first render.

---

## 5. Data Flow

### 5.1 Parse Flow

```
User clicks Parse
      ↓
dispatch({ type: 'PARSE_JSON', payload: rawString })
      ↓
reducer calls parseJson(rawString) from lib/parser.ts
  → success: state.tree = TreeNode, state.parseError = null
  → failure: state.tree = null, state.parseError = ParseError
      ↓
TreeView and SchemaOutput receive new tree prop and re-render
useEffect writes rawInput to localStorage
```

### 5.2 Expand/Collapse Flow

```
User clicks toggle on ObjectNode or ArrayNode
      ↓
dispatch({ type: 'TOGGLE_NODE', payload: nodeId })
      ↓
reducer toggles nodeId in expandedIds Set (immutable update)
      ↓
Affected TreeNode re-renders
```

### 5.3 Search Flow

```
User types in SearchBar (150ms debounce)
      ↓
dispatch({ type: 'SET_SEARCH', payload: query })
      ↓
reducer calls computeMatches(query, tree) from lib/search.ts
  → returns Set<id> of matching nodes and all their ancestors
      ↓
state.matchingIds updated
      ↓
Non-matching nodes hidden; collapsed branches containing matches auto-expand
Matching substrings highlighted
```

### 5.4 Copy Path Flow

```
User clicks a node row
      ↓
useCopyToClipboard.copy(node.path)
  → writes to clipboard
  → sets copiedId = node.id, clears after 1.5s
      ↓
dispatch({ type: 'SET_COPIED', payload: node.id })
      ↓
Specific TreeNode renders "Copied!" tooltip
```

### 5.5 Schema Generation Flow

```
tree → lib/schema-inference.ts → inferTypeScript(tree) | inferZod(tree)
      ↓
Returns string; SchemaOutput renders in <pre><code>
Recomputed via useMemo when tree changes
```

---

## 6. Schema Inference Design

### 6.1 Type Mapping

| JSON value | TypeScript | Zod |
|---|---|---|
| `"string"` | `string` | `z.string()` |
| `42` | `number` | `z.number()` |
| `true` / `false` | `boolean` | `z.boolean()` |
| `null` | `null` | `z.null()` |
| `{}` | `Record<string, unknown>` | `z.record(z.unknown())` |
| `[]` | `unknown[]` | `z.array(z.unknown())` |

Arrays of primitives produce union types across all observed item types: `(string | number)[]`.

### 6.2 Array Item Shape Merging

When an array contains objects, all unique keys are collected across all items. For each key:
- Determine the union of types observed across all items
- Mark the key optional (`?`) if absent from any item
- Produce a union type if multiple types are observed for the same key

### 6.3 Null Handling

Fields observed as `null` in some items and a concrete type in others produce `T | null`. Fields that are always null across all observed items produce `null`.

### 6.4 Interface Naming

The root interface is named `Root`. Nested object types are named from their key in PascalCase. Naming collisions get a numeric suffix: `User`, `User2`.

### 6.5 Recursion

Nested objects produce nested interface declarations. This applies recursively to any depth.

---

## 7. Design System

### 7.1 Theming

Theme is controlled via a `data-theme` attribute on `<html>`. Three modes: `light`, `dark`, and `system` (default). System mode defers to `prefers-color-scheme`. The selected preference is persisted to localStorage.

```css
@media (prefers-color-scheme: dark) {
  :root { /* dark tokens */ }
}
[data-theme="light"] { /* light tokens */ }
[data-theme="dark"]  { /* dark tokens */ }
```

### 7.2 Design Tokens

All tokens are defined as CSS custom properties in `app/globals.css`.

#### Dark Mode

```css
[data-theme="dark"] {
  /* Depth scale — furthest back to most in front */
  --color-page:        #060c14;
  --color-canvas:      #0d1c2e;
  --color-panel:       #152b44;
  --color-input:       #1e3a5c;
  --color-raised:      #274970;
  --color-border:      #1a3350;

  /* Text — on Panel */
  --color-text-primary:   #ddeeff;  /* ~12.4:1 */
  --color-text-secondary: #9dbdd8;  /* ~7.2:1  */
  --color-text-muted:     #6e96b4;  /* ~5.1:1  */

  /* Accent */
  --color-accent:          #00c9a7;
  --color-accent-hover:    #00a88a;

  /* Type badges — background / foreground pairs */
  --badge-string-bg:   #003d36;
  --badge-string-fg:   #00e8c6;

  --badge-number-bg:   #3d2600;
  --badge-number-fg:   #ffb340;

  --badge-boolean-bg:  #2a1050;
  --badge-boolean-fg:  #c084fc;

  --badge-null-bg:     #37062a;
  --badge-null-fg:     #ff60cc;

  --badge-object-bg:   #0a2848;
  --badge-object-fg:   #60b0ff;

  --badge-array-bg:    #3d1212;
  --badge-array-fg:    #ff8080;
}
```

#### Light Mode

```css
[data-theme="light"] {
  /* Depth scale — furthest back to most in front */
  --color-page:        #ddeaf7;
  --color-canvas:      #e8f2fb;
  --color-panel:       #f2f8fd;
  --color-input:       #ffffff;
  --color-raised:      #f8fcff;
  --color-border:      #b8cfe0;

  /* Text — on Panel */
  --color-text-primary:   #0a1828;  /* ~15.0:1 */
  --color-text-secondary: #1e4262;  /* ~9.0:1  */
  --color-text-muted:     #3d6080;  /* ~5.5:1  */

  /* Accent */
  --color-accent:          #007a64;
  --color-accent-hover:    #005a4a;

  /* Type badges */
  --badge-string-bg:   #c0f0e4;
  --badge-string-fg:   #00503d;

  --badge-number-bg:   #fde8c0;
  --badge-number-fg:   #7a3a00;

  --badge-boolean-bg:  #e8d8ff;
  --badge-boolean-fg:  #4a1878;

  --badge-null-bg:     #fce4f4;
  --badge-null-fg:     #700858;

  --badge-object-bg:   #c8dcf8;
  --badge-object-fg:   #0a2860;

  --badge-array-bg:    #fdd0d0;
  --badge-array-fg:    #7a1010;
}
```

#### Shared Tokens

```css
:root {
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Typography */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-ui:   system-ui, sans-serif;
  --font-size-xs:   11px;
  --font-size-sm:   13px;
  --font-size-base: 14px;

  /* Tree */
  --tree-indent: 20px;
}
```

### 7.3 Tree Indentation

Depth is passed as a CSS custom property rather than computed inline:

```tsx
<div
  className={styles.node}
  style={{ '--depth': node.depth } as React.CSSProperties}
>
```

```css
.node {
  padding-inline-start: calc(var(--depth) * var(--tree-indent));
}
```

### 7.4 Tree Guide Lines

Vertical guide lines connecting parent nodes to children are rendered via `::before` pseudo-elements. No JavaScript involvement.

### 7.5 Motion

Expand/collapse transitions use CSS. All motion respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .nodeChildren { transition: none; }
}
```

---

## 8. Edge Cases & Error States

| Case | Handling |
|---|---|
| Empty input | Neutral state, no error |
| Whitespace-only input | Treated as empty |
| Invalid JSON | Parse error with line/column extracted from error message |
| Primitive at root (`"hello"`, `42`, `true`) | Valid — renders as a single leaf node |
| Empty object `{}` | Expandable node with "0 keys" preview |
| Empty array `[]` | Expandable node with "0 items" preview |
| Mixed-type array (`[1, "a", null, {}]`) | Each item renders with its own type badge |
| Deeply nested JSON | Collapsed by default beyond depth 1; no special handling needed |
| Very long keys (>60 chars) | Truncated with `text-overflow: ellipsis`; full key in tooltip |
| Unicode in keys or values | Handled natively by `JSON.parse` |
| Keys with special characters | Access path uses bracket notation: `headers["content-type"]` |
| Array with >50 items | First 50 shown; "Show next 50" loads in chunks |
| Schema inference on large object | `useMemo`; recomputes only when tree changes |
| Clipboard API unavailable | `execCommand` fallback; error message if both fail |

---

## 9. Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Keyboard navigation | Expand/collapse on Enter/Space; arrow keys navigate siblings |
| ARIA roles | `role="tree"` on tree root; `role="treeitem"` on nodes; `aria-expanded` on expandable nodes |
| Type badges | `aria-label` on each badge; type communicated independently of color |
| Search results | `aria-live="polite"` region announces result count |
| Focus management | After parse, focus moves to tree root |
| Reduced motion | `@media (prefers-reduced-motion)` disables transitions |
| Color contrast | All text meets WCAG AA (4.5:1 minimum for normal text) across both themes |

---

## 10. Security
Security is a first-class concern, not an afterthought. Fathom has a small attack surface — no backend, no API keys, no database — but the following requirements must be implemented.

**XSS Prevention**

React JSX escaping covers standard rendering cases and must be relied upon throughout
dangerouslySetInnerHTML is never used for user-provided content under any circumstances
Any case where raw HTML must be inserted (e.g. search match highlighting) must be sanitized with DOMPurify before rendering
Content Security Policy headers must be configured in next.config.ts as a second line of defense

**localStorage Integrity**

Data rehydrated from localStorage on startup is treated as untrusted input — never assumed to be valid or safe
Rehydrated raw input passes through the same parser and validation path as freshly pasted input; no shortcuts

**Dependency Security**

npm audit runs on a schedule via GitHub Actions
CI build fails on high-severity vulnerabilities

**PWA and Service Worker Scope**

The service worker must be scoped correctly and configured to cache static assets only
No user-provided data is ever cached by the service worker

**Transport Security**

HTTPS enforced in production; Strict-Transport-Security headers set
Must be verified before the app goes live at its production URL

---

## 11. Stretch Features (v2)

### Compare Mode
Split-pane input accepts two JSON payloads. A structural diff algorithm produces a `DiffTree` where each node is annotated as `added`, `removed`, `changed`, or `unchanged`. The tree renders with color-coded diff annotations and collapsible unchanged sections.

### AI Integration
An "Analyze" action sends a summary of the parsed tree (not the raw JSON) to the Claude API. The response infers the likely API source, describes each field's probable purpose, and suggests improved property names. Output is displayed as an annotated overlay alongside the tree. Large payloads are sampled before sending; a disclaimer is shown before any data leaves the browser.

---

## 12. Decisions & Constraints

| Topic | Decision |
|---|---|
| Parse trigger | Button click; debounced-on-input is a post-MVP enhancement |
| Collapsed state on re-parse | Reset to default expansion (depth 0 and 1 open) |
| Search behavior | Auto-expands collapsed branches that contain matches |
| Schema inference for primitive arrays | Yes; produces union types across observed item types |
| localStorage persistence | Raw input persisted via `useEffect`; rehydrated on initialization |
| Offline support | PWA manifest included |
| Tree rendering | Static indented tree; drag-and-drop or force-graph layout is out of scope |
| Syntax highlighting in textarea | Post-MVP; requires a full editor component (e.g. CodeMirror) |
| Backend | None; entirely client-side |
| Database | None |
| Authentication | None |
