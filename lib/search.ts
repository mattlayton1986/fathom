import type { TreeNode } from '@/types';

export type SearchMatches = {
  matchIds: Set<string>;
  ancestorIds: Set<string>;
};

export function computeMatches(query: string, tree: TreeNode): SearchMatches {
  const matchIds = new Set<string>();
  const ancestorIds = new Set<string>();
  const normalizedQuery = query.toLowerCase();

  if (!normalizedQuery) {
    return { matchIds, ancestorIds };
  }

  const visit = (node: TreeNode, ancestors: string[]) => {
    const keyMatches = String(node.key)
      .toLowerCase()
      .includes(normalizedQuery);

    if (keyMatches) {
      matchIds.add(node.id);

      for (const ancestorId of ancestors) {
        ancestorIds.add(ancestorId);
      }
    }

    if (node.kind !== 'primitive') {
      const childAncestors = [...ancestors, node.id];

      for (const child of node.children) {
        visit(child, childAncestors);
      }
    }
  };

  visit(tree, []);

  return { matchIds, ancestorIds };
}