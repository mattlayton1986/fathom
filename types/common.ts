export type Result<T, E> =
  | { ok: true, value: T }
  | { ok: false, error: E };

export type ParseError = {
  message: string;
};

export type ReducerAction =
  | { type: 'PARSE_JSON', rawInput: string }
  | { type: 'CLEAR' };