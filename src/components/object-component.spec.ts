/**
 * Imports
 */

import { assignMissingDeep } from '@components/object.component';

/**
 * Tests
 */

describe('assignMissingDeep', () => {
    test('fills missing top-level properties', () => {
        const target = { a: 1 };
        const source = { a: 10, b: 2 };
        const result = assignMissingDeep(target, source);

        expect(result).toEqual({ a: 1, b: 2 });
        expect(result).toBe(target); // same reference
    });

    test('recursively fills missing nested properties', () => {
        const target = { a: { x: 1 } };
        const source = { a: { x: 99, y: 2 }, b: 3 };
        const result = assignMissingDeep(target, source);

        expect(result).toEqual({ a: { x: 1, y: 2 }, b: 3 });
    });

    test('does not overwrite defined properties (even if null or 0)', () => {
        const target = { a: null, b: 0, c: false };
        const source = { a: 1, b: 2, c: true };
        const result = assignMissingDeep(target, source);

        expect(result).toEqual({ a: null, b: 0, c: false });
    });

    test('handles arrays as objects (recursively fills missing indices)', () => {
        const target = { arr: [ 1 ] };
        const source = { arr: [ 1, 2, 3 ] };
        const result = assignMissingDeep(target, source);

        expect(result.arr).toEqual([ 1, 2, 3 ]);
    });

    test('supports empty objects gracefully', () => {
        expect(assignMissingDeep({}, {})).toEqual({});
        expect(assignMissingDeep({}, { x: 1 })).toEqual({ x: 1 });
        expect(assignMissingDeep({ x: 1 }, {})).toEqual({ x: 1 });
    });
});
