import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import TreeViewContext from "./TreeViewContext";
import TreeNode from "@/components/TreeView/TreeNode";
import { AppState, ReducerAction, type TreeNode as TreeNodeData } from "@/types";
import { ARRAY_PAGE_SIZE } from "@/lib/constants";
import styles from './TreeView.module.scss';

interface TreeViewProps {
  dispatch: Dispatch<ReducerAction>;
  tree: TreeNodeData | null;
  ui: AppState['ui'];
}

export default function TreeView({ tree, ui, dispatch }: TreeViewProps) {
  const [arrayItemLimits, setArrayItemLimits] = useState<Record<string, number>>({});
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!tree) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setArrayItemLimits({});

    setFocusedNodeId(tree.id);
    nodeRefs.current.get(tree.id)?.focus({ preventScroll: true });
  }, [tree]);

  useEffect(() => {
    if (focusedNodeId) {
      nodeRefs.current.get(focusedNodeId)?.focus({ preventScroll: true });
    }
  }, [focusedNodeId]);

  const showMoreArrayItems = (arrayId: string) => {
    setArrayItemLimits(currentLimits => ({
      ...currentLimits,
      [arrayId]: (currentLimits[arrayId] ?? ARRAY_PAGE_SIZE) + ARRAY_PAGE_SIZE,
    }));
  };

  const visibleNodes = useMemo(() => {
    if (!tree) return [];
    const result: TreeNodeData[] = [];

    // named function necessary for recursive traversal
    const traverse = (node: TreeNodeData) => {
      const isVisible = !ui.searchQuery
        || ui.matchIds.has(node.id)
        || ui.ancestorIds.has(node.id);

      if (!isVisible) {
        return;
      }

      result.push(node);

      if (node.kind !== 'primitive' && ui.expandedIds.has(node.id)) {
        const childrenToTraverse = node.kind === 'array' && !ui.searchQuery
          ? node.children.slice(0, arrayItemLimits[node.id] ?? ARRAY_PAGE_SIZE)
          : node.children;

        for (const child of childrenToTraverse) {
          traverse(child);
        }
      }
    };

    traverse(tree);
    return result;

  }, [tree, ui.searchQuery, ui.expandedIds, ui.matchIds, ui.ancestorIds, arrayItemLimits]);

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

  const hasNoSearchResults = ui.searchQuery !== '' && ui.matchIds.size === 0;

  const searchResultAnnouncement = ui.searchQuery === ''
    ? ''
    : `${ui.matchIds.size} result${ui.matchIds.size === 1 ? '' : 's'} found for "${ui.searchQuery}"`;

  return (
    <TreeViewContext.Provider
      value={{
        ui,
        dispatch,
        focusedNodeId,
        setFocusedNodeId,
        focusNext,
        focusPrev,
        focusParent,
        nodeRefs,
        arrayItemLimits,
        showMoreArrayItems,
      }}>
      <p className={styles['search-results']} aria-live="polite">
        {searchResultAnnouncement}
      </p>
      {hasNoSearchResults ? (
        <p className={styles['no-results']}>
          No results found for &ldquo;{ui.searchQuery}&rdquo;
        </p>
      ) : (
        <div className={styles['tree-view']} role="tree" aria-label="JSON node tree">
          <TreeNode node={tree} />
        </div>
      )}
    </TreeViewContext.Provider >
  );
}