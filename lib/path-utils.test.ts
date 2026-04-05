import { describe, expect, it } from 'vitest';
import { formatPath } from './path-utils';

describe("formatPath", () => {
  describe("root node", () => {
    it("should return parent path unchanged for root node", () => {
      expect(formatPath('', '$')).toBe('$');
    });
  });

  describe("array notation", () => {
    it("should produce array index brackets", () => {
      expect(formatPath(5, '$')).toBe('$[5]');
    });

    it("should produce index brackets for index 0", () => {
      expect(formatPath(0, '$')).toBe('$[0]');
    });

    it("should stack bracket notation for nested array access", () => {
      expect(formatPath(0, '$[1]')).toBe('$[1][0]');
    });
  });

  describe("invalid JavaScript identifier keys", () => {
    it("should wrap hyphenated object keys in quotes and bracket notation", () => {
      expect(formatPath('content-type', '$')).toBe('$["content-type"]')
    });

    it("should wrap spaced object keys in quotes and bracket notation", () => {
      expect(formatPath('content type', '$')).toBe('$["content type"]');
    });

    it("should wrap number-initial keys in quotes and bracket notation", () => {
      expect(formatPath('1star', '$')).toBe('$["1star"]');
    });
  });

  describe("standard object dot notation", () => {
    it("should produce dot notation from root", () => {
      expect(formatPath('name', '$')).toBe('$.name');
    });

    it("should produce dot notation for deeply nested objects", () => {
      expect(formatPath('latitude', '$.organization.headquarters.coordinates'))
        .toBe('$.organization.headquarters.coordinates.latitude');
    });
  });

  describe("mixed notations", () => {
    it("should produce mixed notations", () => {
      expect(formatPath('content-type', '$.organization.integrations[0]'))
        .toBe('$.organization.integrations[0]["content-type"]');
    });
  });
});
