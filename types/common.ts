export type Result<T, E> =
  | { ok: true, value: T }
  | { ok: false, error: E };

export type ParseError = {
  message: string;
  position?: { line: number; column: number }
};