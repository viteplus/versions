/**
 * Imports
 */

import { readdirSync } from 'fs';
import { deepMerge, getAllMarkdownFilesRelative } from '@components/object.component';

/**
 * Tests
 */

describe('deepMerge', () => {
    test('should merge two shallow objects', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };
        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    test('should overwrite properties from obj1 with obj2', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 5, c: 3 };
        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({ a: 1, b: 5, c: 3 });
    });

    test('should deeply merge nested objects', () => {
        const obj1 = { a: { x: 1, y: 2 } };
        const obj2 = { a: { y: 5, z: 9 } };
        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({ a: { x: 1, y: 5, z: 9 } });
    });

    test('should overwrite arrays instead of merging them', () => {
        const obj1 = { arr: [ 1, 2, 3 ] };
        const obj2 = { arr: [ 4, 5 ] };
        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({ arr: [ 4, 5 ] });
    });

    test('should keep obj1 and obj2 immutable', () => {
        const obj1 = { a: 1, nested: { x: 1 } };
        const obj2 = { b: 2, nested: { y: 2 } };

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({ a: 1, b: 2, nested: { x: 1, y: 2 } });
        expect(obj1).toEqual({ a: 1, nested: { x: 1 } });
        expect(obj2).toEqual({ b: 2, nested: { y: 2 } });
    });

    test('should handle empty objects', () => {
        const result = deepMerge({}, { a: 1 });
        expect(result).toEqual({ a: 1 });
    });

    test('should handle nested empty objects', () => {
        const obj1 = { a: {} };
        const obj2 = { a: { b: 2 } };
        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({ a: { b: 2 } });
    });
});

describe('getAllMarkdownFilesRelative', () => {
    const mockReaddirSync = xJet.mock(readdirSync);

    beforeEach(() => {
        mockReaddirSync.mockReset();
    });

    test('should return empty array when no markdown files exist', () => {
        mockReaddirSync.mockReturnValueOnce(<any>[{ name: 'file.txt', isFile: () => true, isDirectory: () => false }]);

        const result = getAllMarkdownFilesRelative('/root');
        expect(result).toEqual([]);
    });

    test('should return single markdown file in root', () => {
        mockReaddirSync.mockReturnValueOnce(<any>[{ name: 'file.md', isFile: () => true, isDirectory: () => false }]);

        const result = getAllMarkdownFilesRelative('/root');
        expect(result).toEqual([ 'file.md' ]);
    });

    test('should ignore non-markdown files', () => {
        mockReaddirSync.mockReturnValueOnce(<any>[
            { name: 'a.txt', isFile: () => true, isDirectory: () => false },
            { name: 'b.md', isFile: () => true, isDirectory: () => false }
        ]);

        const result = getAllMarkdownFilesRelative('/root');
        expect(result).toEqual([ 'b.md' ]);
    });

    test('should recurse into subdirectories', () => {
        mockReaddirSync
            .mockReturnValueOnce(<any>[{ name: 'nested', isFile: () => false, isDirectory: () => true }])
            .mockReturnValueOnce(<any>[{ name: 'file.md', isFile: () => true, isDirectory: () => false }]);

        const result = getAllMarkdownFilesRelative('/root');
        expect(result).toEqual([ 'nested/file.md' ]);
    });

    test('should not confuse directories ending with .md', () => {
        mockReaddirSync
            .mockReturnValueOnce(<any>[{ name: 'fake.md', isFile: () => false, isDirectory: () => true }])
            .mockReturnValueOnce(<any>[{ name: 'file.md', isFile: () => true, isDirectory: () => false }]);

        const result = getAllMarkdownFilesRelative('/root');
        expect(result).toEqual([ 'fake.md/file.md' ]);
    });
});
