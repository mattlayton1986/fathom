export type JsonPrimitive = string | number | boolean | null;

type JsonNodeBase = {
  id: string;
  path: string;
  key: string | number;
  depth: number;
};

type CompositeNodeBase = {
  children: TreeNode[];
  childCount: number;
}

export type PrimitiveNode = JsonNodeBase & {
  kind: 'primitive';
  valueType: 'string' | 'number' | 'boolean' | 'null';
  value: JsonPrimitive;
};

export type ObjectNode = JsonNodeBase & CompositeNodeBase & {
  kind: 'object';
};

export type ArrayNode = JsonNodeBase & CompositeNodeBase & {
  kind: 'array';
};

export type TreeNode = PrimitiveNode | ObjectNode | ArrayNode;