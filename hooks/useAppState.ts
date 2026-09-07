import { useEffect, useReducer } from 'react';
import buildTree from '@/lib/parser';
import { computeMatches } from '@/lib/search';
import { getInitialExpandedIds } from '@/lib/tree-utils';
import type { AppState, ReducerAction } from '@/types';

const STORAGE_KEY_RAW_INPUT = 'fathom:rawInput';

function createInitialState(): AppState {
  return {
    rawInput: '',
    parseError: null,
    tree: null,
    ui: {
      activeTab: 'raw',
      expandedIds: new Set<string>(),
      expandedIdsBeforeSearch: null,
      searchQuery: '',
      matchIds: new Set<string>(),
      ancestorIds: new Set<string>(),
    }
  }
};

function reducer(
  state: AppState,
  action: ReducerAction
) {
  switch (action.type) {
    case 'PARSE_JSON': {
      const result = buildTree(action.rawInput);
      const initialUi = createInitialState().ui;

      if (result.ok) {
        return {
          ...state,
          rawInput: action.rawInput,
          parseError: null,
          tree: result.value,
          ui: {
            ...state.ui,
            expandedIds: getInitialExpandedIds(result.value),
            expandedIdsBeforeSearch: initialUi.expandedIdsBeforeSearch,
            searchQuery: initialUi.searchQuery,
            matchIds: initialUi.matchIds,
            ancestorIds: initialUi.ancestorIds,
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

      const initialState = createInitialState();

      return {
        ...state,
        rawInput: initialState.rawInput,
        parseError: initialState.parseError,
        tree: initialState.tree,
        ui: {
          ...state.ui,
          expandedIds: initialState.ui.expandedIds,
          expandedIdsBeforeSearch: initialState.ui.expandedIdsBeforeSearch,
          searchQuery: initialState.ui.searchQuery,
          matchIds: initialState.ui.matchIds,
          ancestorIds: initialState.ui.ancestorIds,
        }
      }
    }
    case 'TOGGLE_NODE': {
      const { nodeId } = action;
      // create copy to not operate on state object
      const expandedIds = new Set(state.ui.expandedIds);

      if (expandedIds.has(nodeId)) {
        expandedIds.delete(nodeId);
      } else {
        expandedIds.add(nodeId);
      }

      return {
        ...state,
        ui: {
          ...state.ui,
          expandedIds
        }
      }
    }
    case 'SET_SEARCH': {
      const { query } = action;

      if (!query) {
        const initialUi = createInitialState().ui;
        const expandedIds = new Set(
          state.ui.expandedIdsBeforeSearch ?? state.ui.expandedIds
        );

        return {
          ...state,
          ui: {
            ...state.ui,
            searchQuery: initialUi.searchQuery,
            expandedIds,
            expandedIdsBeforeSearch: initialUi.expandedIdsBeforeSearch,
            matchIds: initialUi.matchIds,
            ancestorIds: initialUi.ancestorIds,
          }
        }
      }

      if (!state.tree) {
        return state;
      }

      const { matchIds, ancestorIds } = computeMatches(query, state.tree);

      const expandedIdsBeforeSearch = state.ui.expandedIdsBeforeSearch ?? new Set(state.ui.expandedIds);

      const expandedIds = new Set(expandedIdsBeforeSearch);

      for (const ancestorId of ancestorIds) {
        expandedIds.add(ancestorId);
      }

      return {
        ...state,
        ui: {
          ...state.ui,
          searchQuery: query,
          expandedIds,
          expandedIdsBeforeSearch,
          matchIds,
          ancestorIds,
        }
      }
    }
    case 'SET_ACTIVE_TAB': {
      return {
        ...state,
        ui: {
          ...state.ui,
          activeTab: action.activeTab
        }
      }
    }
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const initialState = createInitialState();

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