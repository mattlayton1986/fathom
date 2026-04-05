import { describe, expect, it } from 'vitest';
import buildTree from './parser';
import type { ArrayNode, ObjectNode, ParseError, PrimitiveNode, Result, TreeNode } from '@/types';

describe("parser", () => {
  function expectObjectType(result: Result<TreeNode, ParseError>): ObjectNode | undefined {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe('object');
    return result.value as ObjectNode;
  }

  function expectArrayType(result: Result<TreeNode, ParseError>): ArrayNode | undefined {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe('array');
    return result.value as ArrayNode;
  }

  describe("failure case", () => {
    it("should return a ParseError for invalid JSON", () => {
      const invalidJson = '{"name: "Alice"}';
      const result = buildTree(invalidJson);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBeTypeOf('string');
      }
    });
  });

  describe('primitive data types', () => {
    function expectPrimitiveNode(json: string, valueType: string, value: unknown) {
      const result = buildTree(json);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.kind).toBe('primitive');
      const node = result.value as PrimitiveNode;

      expect(node.valueType).toBe(valueType);
      expect(node.value).toBe(value);
    }

    it('should create a node for string primitive', () => {
      expectPrimitiveNode('"alice"', 'string', 'alice');
    });

    it('should create a node for number primitive', () => {
      expectPrimitiveNode('10', 'number', 10);
    });

    it('should create a node for boolean primitive', () => {
      expectPrimitiveNode('true', 'boolean', true);
    });

    it('should create a node for null primitive', () => {
      expectPrimitiveNode('null', 'null', null);
    });
  });

  describe("object data type", () => {
    const testObj = {
      name: "Alice",
      address: {
        city: "San Francisco",
        coordinates: {
          lat: 37.7749
        }
      },
      tags: {}
    };

    it("should create empty object nodes with no children", () => {
      const result = buildTree(JSON.stringify(testObj.tags));

      const node = expectObjectType(result);
      if (!node) return;

      expect(node.childCount).toBe(0);
      expect(node.children).toEqual([]);
    });

    it("should assign correct paths to child nodes", () => {
      const result = buildTree(JSON.stringify(testObj));

      const node = expectObjectType(result);
      if (!node) return;

      const addressNode = node.children.find(child => child.key === 'address');

      expect(addressNode).toBeDefined();
      if (!addressNode) return;
      expect(addressNode.path).toBe('$.address');
    });

    it("should create deeply nested objects", () => {
      const result = buildTree(JSON.stringify(testObj));

      const node = expectObjectType(result);
      if (!node) return;

      const addressNode = node.children.find(child => child.key === 'address') as ObjectNode;
      expect(addressNode).toBeDefined();
      if (!addressNode) return;

      const coordinatesNode = addressNode.children.find(child => child.key === 'coordinates') as ObjectNode;
      expect(coordinatesNode).toBeDefined();
      if (!coordinatesNode) return;

      const latNode = coordinatesNode.children.find(child => child.key === 'lat') as PrimitiveNode;
      expect(latNode).toBeDefined();
      if (!latNode) return;

      expect(latNode.depth).toBe(3);
      expect(latNode.path).toBe('$.address.coordinates.lat')
    });
  });

  describe("array data type", () => {
    const testArr = {
      empty: [],
      flat: [1, 2, 3],
      mixed: [1, "hello", true, null],
      objects: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" }
      ]
    };

    it("should create empty arrays with no children", () => {
      const result = buildTree(JSON.stringify(testArr.empty));

      const node = expectArrayType(result);
      if (!node) return;

      expect(node.childCount).toBe(0);
      expect(node.children).toEqual([]);
    });

    it("should create flat array node with correct children", () => {
      const result = buildTree(JSON.stringify(testArr));

      const node = expectObjectType(result);
      if (!node) return;

      const flatNode = node.children.find(child => child.key === 'flat') as ArrayNode;

      expect(flatNode).toBeDefined();
      if (!flatNode) return;
      expect(flatNode.path).toBe('$.flat');

      const arrayItem = flatNode.children[1] as PrimitiveNode;

      expect(arrayItem).toBeDefined();
      if (!arrayItem) return;
      expect(arrayItem.path).toBe('$.flat[1]');
      expect(arrayItem.key).toBe(1);
    });

    it("should create mixed-type arrays", () => {
      const result = buildTree(JSON.stringify(testArr.mixed));

      const node = expectArrayType(result);
      if (!node) return;

      const numberNode = node.children[0] as PrimitiveNode;
      expect(numberNode).toBeDefined();
      if (!numberNode) return;

      const stringNode = node.children[1] as PrimitiveNode;
      expect(stringNode).toBeDefined();
      if (!stringNode) return;

      const booleanNode = node.children[2] as PrimitiveNode;
      expect(booleanNode).toBeDefined();
      if (!booleanNode) return;

      const nullNode = node.children[3] as PrimitiveNode;
      expect(nullNode).toBeDefined();
      if (!nullNode) return;

      expect(numberNode.valueType).toBe('number');
      expect(stringNode.valueType).toBe('string');
      expect(booleanNode.valueType).toBe('boolean');
      expect(nullNode.valueType).toBe('null');
    });

    it("should create arrays of objects", () => {
      const result = buildTree(JSON.stringify(testArr));
      const node = expectObjectType(result);
      if (!node) return;

      const objectsArray = node.children.find(child => child.key === 'objects') as ArrayNode;

      expect(objectsArray).toBeDefined();
      if (!objectsArray) return;

      const firstChild = objectsArray.children[0];
      expect(firstChild).toBeDefined();
      if (!firstChild) return;

      expect(firstChild.path).toBe('$.objects[0]');
      expect(firstChild.kind).toBe('object');
    });
  });
});