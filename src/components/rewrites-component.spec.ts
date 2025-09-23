/**
 * Imports
 */

import { rewritesHook } from '@components/rewrites.component';

/**
 * Tests
 */

describe('rewritesHook', () => {
    test('should join version, locale, and source into a normalized path', () => {
        const result = rewritesHook('guide/intro.md', 'v2.0.0', 'en');
        expect(result).toBe('en/v2.0.0/guide/intro.md');
    });

    test('should handle empty source', () => {
        const result = rewritesHook('', 'v1.0.0', 'en');
        expect(result).toBe('en/v1.0.0');
    });

    test('should handle nested source paths', () => {
        const result = rewritesHook('docs/tutorial/setup.md', 'v3.1.0', 'de');
        expect(result).toBe('de/v3.1.0/docs/tutorial/setup.md');
    });

    test('should work with different locale codes', () => {
        const result = rewritesHook('index.md', 'v4.0.0', 'de');
        expect(result).toBe('de/v4.0.0/index.md');
    });
});
