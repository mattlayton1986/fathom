import { useEffect, useReducer } from 'react';
import buildTree from '@/lib/parser';
import type { AppState, ReducerAction } from '@/types';

const STORAGE_KEY_RAW_INPUT = 'fathom:rawInput';

const initialState: Omit<AppState, 'ui'> = {
  rawInput: '',
  parseError: null,
  tree: null,
};

function reducer(
  state: Omit<AppState, 'ui'>,
  action: ReducerAction
) {
  switch (action.type) {
    case 'PARSE_JSON': {
      const result = buildTree(action.rawInput);
      // TODO: remove
      console.log(result);
      return result.ok
        ? { ...state, rawInput: action.rawInput, parseError: null, tree: result.value }
        : { ...state, rawInput: action.rawInput, parseError: result.error, tree: null };
    }
    case 'CLEAR':
      localStorage.removeItem(STORAGE_KEY_RAW_INPUT);
      return {
        ...state,
        rawInput: '',
        parseError: null,
        tree: null,
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