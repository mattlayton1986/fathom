import { describe, expect, it } from 'vitest';
import dedent from 'dedent';
import buildTree from './parser';
import { createTypeScriptSchema, createZodSchema } from './schema-inference';

describe('TypeScript schema generation', () => {
  describe('primitive roots', () => {
    it('should produce a number type', () => {
      const number = '42';
      const result = buildTree(number);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(`type Root = number;`);
      }
    });

    it('should produce a string type', () => {
      const string = '"test string"';
      const result = buildTree(string);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(`type Root = string;`);
      }
    });

    it('should produce a boolean type', () => {
      const boolean = 'true';
      const result = buildTree(boolean);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(`type Root = boolean;`);
      }
    });

    it('should produce a null type', () => {
      const nullValue = 'null';
      const result = buildTree(nullValue);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(`type Root = null;`);
      }
    });
  });

  describe('objects', () => {
    it('should create flat object types', () => {
      const flatObject = '{"name": "Matt", "age": 40}';
      const result = buildTree(flatObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = {
            name: string;
            age: number;
          }
        `);
      }
    });

    it('should create nested object types', () => {
      const nestedObject = '{"user": {"name": "Matt", "age": 40}}';
      const result = buildTree(nestedObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = {
            user: User;
          }

          type User = {
            name: string;
            age: number;
          }
        `);
      }
    });

    it('should create objects containing keys with special characters', () => {
      const specCharObj = '{"content-type": "text/plain"}';
      const result = buildTree(specCharObj);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = {
            'content-type': string;
          }
        `);
      }
    });

    it('should create null object keys', () => {
      const nullObject = '{"name": null}';
      const result = buildTree(nullObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = {
            name: null;
          }
        `);
      }
    });
  });

  describe('arrays', () => {
    it('should create single-type primitive arrays', () => {
      const array = '["a", "b", "c"]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = string[];
        `);
      }
    });

    it('should create mixed-type primitive arrays', () => {
      const array = '[1, "a", null]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = (number | string | null)[];
        `);
      }
    });

    it('should create arrays of flat objects', () => {
      const array = '[{"name": "Matt"}, {"name": "Lucas"}]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = RootItem[];
          
          type RootItem = {
            name: string;
          }
        `);
      }
    });

    it('should create arrays of objects with optional keys', () => {
      const array = '[{"name": "Matt", "age": 40}, {"name": "Lucas"}]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = RootItem[];

          type RootItem = {
            name: string;
            age?: number;
          }
        `);
      }
    });

    it('should create arrays of arrays', () => {
      const array = '[[1, 2], [3, 4]]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = number[][];
        `);
      }
    });
  });

  describe('edge cases', () => {
    it('should create empty object types', () => {
      const emptyObject = '{}';
      const result = buildTree(emptyObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = Record<string, unknown>;
        `);
      }
    });

    it('should create empty array types', () => {
      const array = '[]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = unknown[];
        `);
      }
    });

    it('should handle interface naming collision', () => {
      const collisionObject = '{"user": {"id": 1}, "User": {"id": 2}}';
      const result = buildTree(collisionObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createTypeScriptSchema(result.value);
        expect(schema).toEqual(dedent`
          type Root = {
            user: User;
            User: User2;
          }
          
          type User2 = {
            id: number;
          }

          type User = {
            id: number;
          }
        `);
      }
    });
  });
});

describe('Zod schema generation', () => {
  describe('primitive roots', () => {
    it('should produce a number type', () => {
      const number = '42';
      const result = buildTree(number);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(`export const schema = z.number();`);
      }
    });

    it('should produce a string type', () => {
      const string = '"test string"';
      const result = buildTree(string);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(`export const schema = z.string();`);
      }
    });

    it('should produce a boolean type', () => {
      const boolean = 'true';
      const result = buildTree(boolean);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(`export const schema = z.boolean();`);
      }
    });

    it('should produce a null type', () => {
      const nullValue = 'null';
      const result = buildTree(nullValue);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(`export const schema = z.null();`);
      }
    });
  });

  describe('objects', () => {
    it('should create flat object types', () => {
      const flatObject = '{"name": "Matt", "age": 40}';
      const result = buildTree(flatObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.object({
            name: z.string(),
            age: z.number(),
          });
        `);
      }
    });

    it('should create nested object types', () => {
      const nestedObject = '{"user": {"name": "Matt", "age": 40}}';
      const result = buildTree(nestedObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.object({
            user: userSchema,
          });

          const userSchema = z.object({
            name: z.string(),
            age: z.number(),
          });
        `);
      }
    });

    it('should create objects containing keys with special characters', () => {
      const specCharObj = '{"content-type": "text/plain"}';
      const result = buildTree(specCharObj);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.object({
            'content-type': z.string(),
          });
        `);
      }
    });

    it('should create null object keys', () => {
      const nullObject = '{"name": null}';
      const result = buildTree(nullObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.object({
            name: z.null(),
          });
        `);
      }
    });
  });

  describe('arrays', () => {
    it('should create single-type primitive arrays', () => {
      const array = '["a", "b", "c"]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.array(z.string());
        `);
      }
    });

    it('should create mixed-type primitive arrays', () => {
      const array = '[1, "a", null]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
            export const schema = z.union([z.number(), z.string(), z.null()]);
          `);
      }
    });

    it('should create arrays of flat objects', () => {
      const array = '[{"name": "Matt"}, {"name": "Lucas"}]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
            export const schema = z.array(schemaItem);

            const schemaItem = z.object({
              name: z.string(),
            });
          `);
      }
    });

    it('should create arrays of objects with optional keys', () => {
      const array = '[{"name": "Matt", "age": 40}, {"name": "Lucas"}]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.array(schemaItem);

          const schemaItem = z.object({
            name: z.string(),
            age: z.number().optional(),
          });
        `);
      }
    });

    it('should create arrays of arrays', () => {
      const array = '[[1, 2], [3, 4]]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.array(z.array(z.number()));
        `);
      }
    });
  });

  describe('edge cases', () => {
    it('should create empty object types', () => {
      const emptyObject = '{}';
      const result = buildTree(emptyObject);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.record(z.unknown());
        `);
      }
    });

    it('should create empty array types', () => {
      const array = '[]';
      const result = buildTree(array);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schema = createZodSchema(result.value);
        expect(schema).toEqual(dedent`
          export const schema = z.array(z.unknown());
        `);
      }
    });

      it('should handle interface naming collision', () => {
        const collisionObject = '{"user": {"id": 1}, "User": {"id": 2}}';
        const result = buildTree(collisionObject);
        expect(result.ok).toBe(true);
        if (result.ok) {
          const schema = createZodSchema(result.value);
          expect(schema).toEqual(dedent`
            export const schema = z.object({
              user: userSchema,
              User: userSchema2,
            });

            const userSchema2 = z.object({
              id: z.number(),
            });

            const userSchema = z.object({
              id: z.number(),
            });
          `);
        }
      });
  });
});