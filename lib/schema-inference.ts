import { needsQuotes } from "./path-utils";
import type { TreeNode } from "@/types";

export function createTypeScriptSchema(tree: TreeNode): string {
  const accumulator: string[] = [];
  const usedNames = new Map<string, number>();

  function inferTypeScript(treeNode: TreeNode, typeName: string): string {
    switch (treeNode.kind) {

      /** ==================================
       *          PRIMITIVE TYPE
       *  ==================================
       */
      case 'primitive': {
        return treeNode.valueType;
      }

      /** ==================================
       *            OBJECT TYPE
       *  ==================================
       */
      case 'object': {
        typeName = resolveName(typeName, usedNames);

        if (!treeNode.children.length) return 'Record<string, unknown>';

        const fields = treeNode.children.map(child => {
          const childTypeName = createTSTypeName(child.key.toString());
          const childTypeString = inferTypeScript(child, childTypeName);
          const fieldKey = needsQuotes(child.key.toString())
            ? `'${child.key}'` : child.key;
          return `  ${fieldKey}: ${childTypeString};`;
        });

        const declaration = `type ${typeName} = {\n${fields.join('\n')}\n}`;
        accumulator.unshift(declaration);
        return typeName;
      }

      /** ==================================
       *            ARRAY TYPE
       *  ==================================
       */
      case 'array': {
        let arrayType = '';

        // ======= EMPTY ARRAY ======== //
        if (!treeNode.children.length) {
          arrayType = `unknown[]`;

          // ===== ARRAY OF PRIMITIVES =======
        } else if (treeNode.children?.every(child => child.kind === 'primitive')) {
          const primitiveTypes = new Set<string>();
          for (let child of treeNode.children) {
            primitiveTypes.add(child.valueType);
          }
          if (primitiveTypes.size > 1) {
            arrayType = `(${[...primitiveTypes].join(' | ')})[]`;
          } else {
            arrayType = `${[...primitiveTypes].join(' | ')}[]`;
          }

          // ====== ARRAY OF OBJECTS ========
        } else if (treeNode.children?.every(child => child.kind === 'object')) {
          const itemTypeName = resolveName(`${typeName}Item`, usedNames);
          const fieldTypes = new Map<string, string>();
          const fieldCounts = new Map<string, number>();
          const totalItems = treeNode.children.length;

          for (const child of treeNode.children) {
            if (child.kind !== 'object') continue;
            for (const field of child.children) {
              const fieldKey = field.key.toString();
              if (!fieldTypes.has(fieldKey)) {
                fieldTypes.set(fieldKey, inferTypeScript(field, createTSTypeName(fieldKey)));
              }
              fieldCounts.set(fieldKey, (fieldCounts.get(fieldKey) ?? 0) + 1);
            }
          }

          const fields = [...fieldTypes.entries()].map(([key, typeString]) => {
            const isOptional = (fieldCounts.get(key) ?? 0) < totalItems;
            const formattedKey = needsQuotes(key) ? `'${key}'` : key;
            return `  ${formattedKey}${isOptional ? '?' : ''}: ${typeString};`;
          });

          accumulator.unshift(`type ${itemTypeName} = {\n${fields.join('\n')}\n}`);
          arrayType = `${itemTypeName}[]`;

          // ===== ARRAY OF ARRAYS =======
        } else if (treeNode.children?.every(child => child.kind === 'array')) {
          const firstChild = treeNode.children[0];
          if (!firstChild) {
            arrayType = `unknown[]`;
          } else {
            const innerType = inferTypeScript(firstChild, `${typeName}Item`);
            arrayType = `${innerType}[]`;
          }
        } else {
          arrayType = `unknown[]`;
        }
        return arrayType;
      }
    }
  }

  const rootType = inferTypeScript(tree, 'Root');
  if (tree.kind === 'array' || tree.kind === 'primitive' || (tree.kind === 'object' && accumulator.length === 0)) {
    accumulator.unshift(`type Root = ${rootType};`);
  }

  return accumulator.join('\n\n');
}

export function createZodSchema(tree: TreeNode): string {
  const accumulator: string[] = [];
  const usedNames = new Map<string, number>();

  function inferZod(treeNode: TreeNode, typeName: string): string {
    switch (treeNode.kind) {

      /** ==================================
       *          PRIMITIVE TYPE
       *  ==================================
       */
      case 'primitive': {
        return `z.${treeNode.valueType}()`;
      }

      /** ==================================
       *            OBJECT TYPE
       *  ==================================
       */
      case 'object': {
        typeName = resolveName(typeName, usedNames);

        if (!treeNode.children.length) return 'z.record(z.unknown())';

        const fields = treeNode.children.map(child => {
          const childTypeName = createZodTypeName(child.key.toString());
          const childTypeString = inferZod(child, childTypeName);
          const fieldKey = needsQuotes(child.key.toString())
            ? `'${child.key}'` : child.key;
          return `  ${fieldKey}: ${childTypeString},`
        });

        const declaration = `const ${typeName} = z.object({\n${fields.join('\n')}\n});`
        accumulator.unshift(declaration);
        return typeName;
      }

      /** ==================================
       *            ARRAY TYPE
       *  ==================================
       */
      case 'array': {
        let arrayType = '';

        // ======= EMPTY ARRAY ======== //
        if (!treeNode.children.length) {
          arrayType = `z.array(z.unknown())`;

          // ===== ARRAY OF PRIMITIVES ===== //
        } else if (treeNode.children?.every(child => child.kind === 'primitive')) {
          const primitiveTypes = new Set<string>();
          for (let child of treeNode.children) {
            primitiveTypes.add(child.valueType);
          }
          if (primitiveTypes.size > 1) {
            arrayType = `z.union([${[...primitiveTypes].map(t => `z.${t}()`).join(', ')}])`;
          } else {
            arrayType = `z.array(z.${[...primitiveTypes][0]}())`;
          }

          // ===== ARRAY OF OBJECTS ====== //
        } else if (treeNode.children?.every(child => child.kind === 'object')) {
          const itemTypeName = resolveName(`${typeName}Item`, usedNames);
          const fieldTypes = new Map<string, string>();
          const fieldCounts = new Map<string, number>();
          const totalItems = treeNode.children.length;

          for (const child of treeNode.children) {
            if (child.kind !== 'object') continue;
            for (const field of child.children) {
              const fieldKey = field.key.toString();
              if (!fieldTypes.has(fieldKey)) {
                fieldTypes.set(fieldKey, inferZod(field, createZodTypeName(fieldKey)));
              }
              fieldCounts.set(fieldKey, (fieldCounts.get(fieldKey) ?? 0) + 1);
            }
          }

          const fields = [...fieldTypes.entries()].map(([key, typeString]) => {
            const isOptional = (fieldCounts.get(key) ?? 0) < totalItems;
            const formattedKey = needsQuotes(key) ? `'${key}'` : key;
            return `  ${formattedKey}: ${typeString}${isOptional ? '.optional()' : ''},`;
          });

          accumulator.unshift(
            `const ${itemTypeName} = z.object({\n${fields.join('\n')}\n});`
          );
          arrayType = `z.array(${itemTypeName})`;

          // ===== ARRAY OF ARRAYS ====== //
        } else if (treeNode.children?.every(child => child.kind === 'array')) {
          const firstChild = treeNode.children[0];
          if (!firstChild) {
            arrayType = `z.array(z.unknown())`;
          } else {
            const innerType = inferZod(firstChild, typeName);
            arrayType = `z.array(${innerType})`;
          }

          // ===== DEFAULT CASE ===== //
        } else {
          arrayType = `z.array(z.unknown())`;
        }
        return arrayType;
      }
    }
  }

  const rootType = inferZod(tree, 'schema');
  if (tree.kind === 'array' || tree.kind === 'primitive' || (tree.kind === 'object' && accumulator.length === 0)) {
    accumulator.unshift(`export const schema = ${rootType};`);
  } else if (tree.kind === 'object' && accumulator[0]) {
    accumulator[0] = accumulator[0].replace('const schema', 'export const schema');
  }

  return accumulator.join('\n\n');
}

function createTSTypeName(key: string) {
  key = key[0]?.toUpperCase() + key.substring(1);
  key = key.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
  return key;
}

function createZodTypeName(key: string) {
  key = key[0]?.toLowerCase() + key.substring(1);
  key = key.replace(/[-_](.)/g, (_, char) => char.toUpperCase()) + `Schema`;
  return key;
}

function resolveName(candidate: string, usedNames: Map<string, number>): string {
  const count = usedNames.get(candidate);
  if (!count) {
    usedNames.set(candidate, 1);
    return candidate;
  }
  usedNames.set(candidate, count + 1);
  return `${candidate}${count + 1}`;
}