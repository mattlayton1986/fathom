import { TreeNode } from "@/types";

export function getInitialExpandedIds(result: TreeNode) {
  const rootChildren = result.kind !== 'primitive'
    ? result.children.map(child => child.id)
    : [];

  return new Set([result.id, ...rootChildren]);
}