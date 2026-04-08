import { createContext, Dispatch, RefObject, SetStateAction, useContext } from 'react';
import type { AppState, ReducerAction } from '@/types';

type TreeViewContextValue = {
  ui: AppState['ui'];
  dispatch: Dispatch<ReducerAction>;
  focusedNodeId: string | null;
  setFocusedNodeId: Dispatch<SetStateAction<string | null>>;
  focusNext: (currentId: string) => void;
  focusPrev: (currentId: string) => void;
  focusParent: (parentId: string | null) => void;
  nodeRefs: RefObject<Map<string, HTMLDivElement>>;
}

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

export function useTreeViewContext(): TreeViewContextValue {
  const ctx = useContext(TreeViewContext);
  if (ctx === null) {
    throw new Error('useTreeViewContext must be used within a TreeViewContext.Provider');
  }
  return ctx;
}

export default TreeViewContext;