import { useEffect, useReducer } from 'react';
import buildTree from '@/lib/parser';
import { getInitialExpandedIds } from '@/lib/tree-utils';
import type { AppState, ReducerAction } from '@/types';

const STORAGE_KEY_RAW_INPUT = 'fathom:rawInput';

const initialState: AppState = {
  rawInput: '',
  parseError: null,
  tree: null,
  ui: {
    activeTab: 'raw',
    expandedIds: new Set<string>(),
    searchQuery: '',
    matchingIds: new Set<string>(),
    copiedId: null
  }
};

function reducer(
  state: AppState,
  action: ReducerAction
) {
  switch (action.type) {
    case 'PARSE_JSON': {
      const result = buildTree(action.rawInput);
      // TODO: remove
      console.log(result);
      if (result.ok) {
        return {
          ...state,
          rawInput: action.rawInput,
          parseError: null,
          tree: result.value,
          ui: {
            ...state.ui,
            expandedIds: getInitialExpandedIds(result.value),
          }
        };
      }
      return {
        ...state,
        rawInput: action.rawInput,
        parseError: result.error,
        tree: null
      };
    }
    case 'CLEAR': {
      localStorage.removeItem(STORAGE_KEY_RAW_INPUT);
      const { rawInput, parseError, tree, ui: { expandedIds, matchingIds } } = initialState;
      return {
        ...state,
        rawInput,
        parseError,
        tree,
        ui: {
          ...state.ui,
          expandedIds,
          matchingIds,
        }
      }
    }
    case 'TOGGLE_NODE': {
      const { nodeId } = action;
      // create copy to not operate on state object
      const expandedIds = new Set(state.ui.expandedIds);
      expandedIds.has(nodeId) 
        ? expandedIds.delete(nodeId) 
        : expandedIds.add(nodeId);

      return {
        ...state,
        ui: {
          ...state.ui,
          expandedIds
        }
      }
    }
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const rawInput = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_RAW_INPUT)
      : null;

    return rawInput
      ? { ...initialState, rawInput }
      : initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RAW_INPUT, state.rawInput)
  }, [state.rawInput]);

  return [state, dispatch] as const;
}