import { generateId } from "./id-generator";
import type {
  JsonNodeBase,
  ParseError,
  Result,
  TreeNode
} from "@/types";
import { formatPath } from "./path-utils";
import { ROOT_NODE_TOKEN } from "./constants";

export default function buildTree(input: string): Result<TreeNode, ParseError> {
  let lexed: unknown;
  try {
    lexed = JSON.parse(input);
  } catch (error) {
    return {
      ok: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
      }
    };
  }

  const parsedTree = parse(lexed, '', ROOT_NODE_TOKEN, 0);

  return {
    ok: true,
    value: parsedTree,
  };
}

function parse(
  data: unknown,
  key: string | number,
  parentPath: string,
  depth: number,
): TreeNode {

  const path = formatPath(key, parentPath);

  const nodeBase: JsonNodeBase = {
    id: generateId(path),
    key,
    path,
    depth,
  }

  switch (typeof data) {
    case 'number':
      return {
        ...nodeBase,
        kind: 'primitive',
        valueType: 'number',
        value: data,
      };
    case 'string':
      return {
        ...nodeBase,
        kind: 'primitive',
        valueType: 'string',
        value: data,
      };
    case 'boolean':
      return {
        ...nodeBase,
        kind: 'primitive',
        valueType: 'boolean',
        value: data,
      };
    case 'object':
      if (Array.isArray(data)) {
        return {
          ...nodeBase,
          kind: 'array',
          children: data.map((child, index) => parse(child, index, path, depth + 1)),
          childCount: data.length,
        }
      } else if (data === null) {
        return {
          ...nodeBase,
          kind: 'primitive',
          valueType: 'null',
          value: data,
        };
      } else {
        return {
          ...nodeBase,
          kind: 'object',
          children: Object.entries(data as Record<string, unknown>)
            .map(([key, value]) => parse(value, key, path, depth + 1)),
          childCount: Object.keys(data).length,
        }
      }
    default:
      // should never happen, since JSON.parse already throws on invalid input data
      throw new Error(`Unexpected data type: ${typeof data}`);
  }
}