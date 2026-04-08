import { Dispatch, KeyboardEvent, MouseEvent, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import TypeBadge from "@/components/TypeBadge/TypeBadge";
import CollapsePreview from "@/components/CollapsePreview/CollapsePreview";
import { ROOT_NODE_TOKEN } from "@/lib/constants";
import type { AppState, ReducerAction, TreeNode as TreeNodeData } from "@/types";
import styles from './TreeNode.module.scss';

interface TreeNodeProps {
  node: TreeNodeData;
  ui: AppState['ui'];
  dispatch: Dispatch<ReducerAction>;
  focusedNodeId: string | null;
  setFocusedNodeId: Dispatch<SetStateAction<string | null>>
  focusNext: (currentId: string) => void;
  focusPrev: (currentId: string) => void;
  focusParent: (parentId: string | null) => void;
  nodeRefs: RefObject<Map<string, HTMLDivElement>>;
}

export default function TreeNode({
  node,
  ui,
  dispatch,
  focusedNodeId,
  setFocusedNodeId,
  focusNext,
  focusPrev,
  focusParent,
  nodeRefs
}: TreeNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isStringExpanded, setIsStringExpanded] = useState<boolean>(false);

  const isObjectArray = node.kind !== 'primitive';
  const isExpanded = ui.expandedIds.has(node.id);
  const rawValue = !isObjectArray && node.valueType === 'string' && String(node.value).length > 80 && String(node.value);
  const stringDisplayValue = rawValue && !isStringExpanded
    ? rawValue.slice(0, 80) + '...'
    : rawValue;

  const badgeType = isObjectArray ? node.kind : node.valueType;

  const children = isObjectArray
    ? node.children.map(child => (
      <TreeNode
        key={child.id}
        node={child}
        ui={ui}
        dispatch={dispatch}
        focusedNodeId={focusedNodeId}
        setFocusedNodeId={setFocusedNodeId}
        focusNext={focusNext}
        focusPrev={focusPrev}
        focusParent={focusParent}
        nodeRefs={nodeRefs}
      />
    ))
    : null;

  const caret = isObjectArray
    ? <span className={styles.caret} data-expanded={isExpanded} aria-hidden="true"></span>
    : null;

  useEffect(() => {
    if (nodeRef.current) {
      nodeRefs.current.set(node.id, nodeRef.current);
    }
    return () => {
      nodeRefs.current.delete(node.id);
    }
  }, [node.id]);

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

  return (
    <div
      ref={nodeRef}
      role="treeitem"
      aria-expanded={isObjectArray ? isExpanded : undefined}
      tabIndex={focusedNodeId === node.id ? 0 : -1}
      className={styles.node}
      onClick={handleNodeToggle}
      onKeyDown={handleKeyDown}
    >
      <div className={styles['node-content']}>
        {caret}
        <span className={styles['node-key']}>{node.depth === 0 ? ROOT_NODE_TOKEN : node.key}</span>
        {!isObjectArray && <span className={styles['node-value']}>{stringDisplayValue || String(node.value)}</span>}
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
      </div>
    </div>
  );
}