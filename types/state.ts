import type { TreeNode } from "./tree";
import type { ParseError } from "./common";

export type TreeUIState = {
  activeTab: 'raw' | 'typescript' | 'zod';
  expandedIds: Set<string>;
  searchQuery: string;
  matchingIds: Set<string>;
};

export type AppState = {
  rawInput: string;
  parseError: ParseError | null;
  tree: TreeNode | null;
  ui: TreeUIState;
};