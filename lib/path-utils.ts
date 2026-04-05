/**
 * Formats a node's access path by appending its key to the parent path.
  * Uses bracket notation for array indices and keys with special characters,
 * dot notation for standard object keys.
 */
export function formatPath(key: string | number, parentPath: string): string {

  // for root node -> 
  if (key === '') return parentPath;

  // for arrays -> wrap key in square brackets
  // example: object[1]
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`;
  }

  // for string keys that are not valid JS identifiers -> wrap in square brackets and quotes
  // example: object["content-type"]
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return `${parentPath}["${key}"]`;
  }

  // for normal keys -> use dot notation
  // example: object.name
  return `${parentPath}.${key}`;
}