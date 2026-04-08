import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import TreeNode from "@/components/TreeView/TreeNode";
import { AppState, ReducerAction, type TreeNode as TreeNodeData } from "@/types";
import styles from './TreeView.module.scss';

interface TreeViewProps {
  dispatch: Dispatch<ReducerAction>;
  tree: TreeNodeData | null;
  ui: AppState['ui'];
}

export default function TreeView({ tree, ui, dispatch }: TreeViewProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!tree) return;
    setFocusedNodeId(tree.id);
    nodeRefs.current.get(tree.id)?.focus({ preventScroll: true });
  }, [tree]);

  useEffect(() => {
    if (focusedNodeId) {
      nodeRefs.current.get(focusedNodeId)?.focus({ preventScroll: true });
    }
  }, [focusedNodeId]);

  const visibleNodes = useMemo(() => {
    if (!tree) return [];
    const result: TreeNodeData[] = [];

    // named function necessary for recursive traversal
    const traverse = (node: TreeNodeData) => {
      result.push(node);
      if (node.kind !== 'primitive' && ui.expandedIds.has(node.id)) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    traverse(tree);
    return result;

  }, [tree, ui.expandedIds]);

  const focusNext = (currentId: string) => {
    const index = visibleNodes.findIndex(n => n.id === currentId);
    const next = visibleNodes[index + 1];
    if (next) setFocusedNodeId(next.id);
  };

  const focusPrev = (currentId: string) => {
    const index = visibleNodes.findIndex(n => n.id === currentId);
    const prev = visibleNodes[index - 1];
    if (prev) setFocusedNodeId(prev.id);
  };

  const focusParent = (parentId: string | null) => {
    if (parentId) setFocusedNodeId(parentId);
  }

  if (!tree) return;

  return (
    <div className={styles['tree-view']} role="tree" aria-label="JSON node tree">
      <TreeNode
        node={tree}
        ui={ui}
        dispatch={dispatch}
        focusedNodeId={focusedNodeId}
        setFocusedNodeId={setFocusedNodeId}
        focusNext={focusNext}
        focusPrev={focusPrev}
        focusParent={focusParent}
        nodeRefs={nodeRefs}
      />
    </div>
  );
}