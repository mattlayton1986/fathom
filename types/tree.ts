export type JsonNodeBase = {
  id: string;
  path: string;
  key: string | number;
  depth: number;
  parentId: string | null;
};

export type CompositeNodeBase = {
  children: TreeNode[];
  childCount: number;
}

export type JsonPrimitive = string | number | boolean | null;

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