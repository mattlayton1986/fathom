import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useTreeViewContext } from "./TreeViewContext";
import HighlightedText from './HighlightedText';
import TypeBadge from "@/components/TypeBadge/TypeBadge";
import CollapsePreview from "@/components/CollapsePreview/CollapsePreview";
import NodeKey from "@/components/TreeView/NodeKey";
import { ARRAY_PAGE_SIZE, ROOT_NODE_TOKEN } from "@/lib/constants";
import { countGraphemes, sliceGraphemes } from '@/lib/string-utils';
import type { TreeNode as TreeNodeData } from "@/types";
import styles from './TreeNode.module.scss';

interface TreeNodeProps {
  node: TreeNodeData;
}

export default function TreeNode({ node }: TreeNodeProps) {
  const [isStringExpanded, setIsStringExpanded] = useState<boolean>(false);
  const {
    ui,
    dispatch,
    focusedNodeId,
    focusNext,
    focusPrev,
    focusParent,
    nodeRefs,
    arrayItemLimits,
    showMoreArrayItems,
  } = useTreeViewContext();
  const nodeRef = useRef<HTMLDivElement>(null);

  const isObjectArray = node.kind !== 'primitive';
  const isExpanded = ui.expandedIds.has(node.id);
  const isSearchActive = ui.searchQuery !== '';
  const isVisible = !isSearchActive
    || ui.matchIds.has(node.id)
    || ui.ancestorIds.has(node.id);
  const stringValue = !isObjectArray && node.valueType === 'string'
    ? String(node.value)
    : null;
  const rawValue = stringValue !== null && countGraphemes(stringValue) > 80
    ? stringValue
    : null;

  const normalizedSearchQuery = ui.searchQuery.toLowerCase();
  const firstMatchIndex = rawValue && isSearchActive
    ? rawValue.toLowerCase().indexOf(normalizedSearchQuery)
    : -1;

  const firstMatchGraphemeIndex = rawValue && firstMatchIndex >= 0
    ? countGraphemes(rawValue.slice(0, firstMatchIndex))
    : -1;
  const matchedGraphemeCount = rawValue && firstMatchIndex >= 0
    ? countGraphemes(
      rawValue.slice(firstMatchIndex, firstMatchIndex + normalizedSearchQuery.length)
    )
    : 0;
  const rawValueGraphemeCount = rawValue
    ? countGraphemes(rawValue)
    : 0;
  const excerptStart = Math.max(0, firstMatchGraphemeIndex - 30);
  const excerptEnd = Math.min(
    rawValueGraphemeCount,
    firstMatchGraphemeIndex + matchedGraphemeCount + 50
  );

  const stringDisplayValue = rawValue && !isStringExpanded
    ? firstMatchGraphemeIndex >= 80
      ? `...${sliceGraphemes(rawValue, excerptStart, excerptEnd)}${excerptEnd < rawValueGraphemeCount
        ? '...'
        : ''
      }`
      : `${sliceGraphemes(rawValue, 0, 80)}...`
    : rawValue;

  const badgeType = isObjectArray ? node.kind : node.valueType;

  const arrayItemLimit = arrayItemLimits[node.id] ?? ARRAY_PAGE_SIZE;
  const remainingArrayItemCount = node.kind === 'array'
    ? node.children.length - arrayItemLimit
    : 0;
  const hasMoreArrayItems = !isSearchActive && remainingArrayItemCount > 0;

  const childrenToDisplay = node.kind === 'array' && !isSearchActive
    ? node.children.slice(0, arrayItemLimit)
    : node.kind !== 'primitive'
      ? node.children
      : [];

  const children = childrenToDisplay.map(child => (
    <TreeNode key={child.id} node={child} />
  ));

  const caret = isObjectArray
    ? <span className={styles.caret} data-expanded={isExpanded} aria-hidden="true"></span>
    : null;

  useEffect(() => {
    const map = nodeRefs.current;

    if (!isVisible || !nodeRef.current) {
      map.delete(node.id);
      return;
    }

    map.set(node.id, nodeRef.current);

    return () => {
      map.delete(node.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, node.id]);

  const handleNodeToggle = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    dispatch({
      type: 'TOGGLE_NODE',
      nodeId: node.id,
    });
  };

  const handleStringToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsStringExpanded(prev => !prev);
  };

  const handleShowMoreArrayItems = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    showMoreArrayItems(node.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const handled = ['Enter', ' ', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
    if (handled.includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (isObjectArray) dispatch({ type: 'TOGGLE_NODE', nodeId: node.id });
        break;
      case 'ArrowDown':
        focusNext(node.id);
        break;
      case 'ArrowUp':
        focusPrev(node.id);
        break;
      case 'ArrowRight':
        if (isObjectArray && !isExpanded) dispatch({ type: 'TOGGLE_NODE', nodeId: node.id });
        else if (isObjectArray && isExpanded) focusNext(node.id);
        break;
      case 'ArrowLeft':
        if (isObjectArray && isExpanded) dispatch({ type: 'TOGGLE_NODE', nodeId: node.id });
        else focusParent(node.parentId);
        break;
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={nodeRef}
      role="treeitem"
      aria-expanded={isObjectArray ? isExpanded : undefined}
      aria-selected={false}
      tabIndex={focusedNodeId === node.id ? 0 : -1}
      className={styles.node}
      onClick={handleNodeToggle}
      onKeyDown={handleKeyDown}
    >
      <div className={styles['node-content']}>
        {caret}
        <NodeKey
          path={node.path}
          label={node.depth === 0 ? ROOT_NODE_TOKEN : node.key}
          searchQuery={ui.searchQuery}
          isMatch={ui.matchIds.has(node.id)}
        />
        {!isObjectArray && (
          <span className={styles['node-value']}>
            <HighlightedText
              text={stringDisplayValue || String(node.value)}
              searchQuery={ui.searchQuery}
              isMatch={ui.matchIds.has(node.id)}
            />
          </span>
        )}
        {
          rawValue && (
            <button
              type="button"
              className={styles['string-toggle']}
              onClick={handleStringToggle}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {isStringExpanded ? 'show less' : 'show more'}
            </button>
          )}
        <TypeBadge type={badgeType} />
        {!isExpanded && isObjectArray && <CollapsePreview node={node} />}
      </div>
      <div className={styles['node-children']}>
        {isExpanded && children}
        {isExpanded && hasMoreArrayItems && (
          <button
            type="button"
            className={styles['array-pagination']}
            onClick={handleShowMoreArrayItems}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {remainingArrayItemCount > ARRAY_PAGE_SIZE
              ? `Show next ${ARRAY_PAGE_SIZE} items`
              : `Show remaining ${remainingArrayItemCount} items`}
          </button>
        )}
      </div>
    </div>
  );
}