/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { join } from 'path/posix';
import { inject } from '@symlinks/services/inject.service';
import { parseRoutesComponent, rewritesHook } from '@components/rewrites.component';

/**
 * Tests
 */

describe('rewritesHook', () => {
    test('should join locale, version, and source into a normalized path', () => {
        const result = rewritesHook('guide/intro.md', 'v2.0.0', 'en');
        expect(result).toBe('en/v2.0.0/guide/intro.md');
    });

    test('should handle empty version', () => {
        const result = rewritesHook('guide/intro.md', '', 'en');
        expect(result).toBe('en/guide/intro.md');
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
        const result = rewritesHook('index.md', 'v4.0.0', 'fr');
        expect(result).toBe('fr/v4.0.0/index.md');
    });

    test('should handle empty locale', () => {
        const result = rewritesHook('index.md', 'v1.0.0', '');
        expect(result).toBe('v1.0.0/index.md');
    });
});

describe('parseRoutesComponent', () => {
    let mockInject: MockState<any>;

    beforeEach(() => {
        xJet.resetAllMocks();
        mockInject = xJet.mock(inject);
    });

    test('should create a function-based rewrites configuration', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            localesMap: { en: 'en', fr: 'fr' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        expect(typeof mockState.vitepressConfig.rewrites).toBe('function');
    });

    test('should handle src/ files with locale prefix', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            localesMap: { en: 'en', fr: 'fr' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;
        const result = rewriteFn('src/en/guide/intro.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('guide/intro.md', '', 'en');
        expect(result).toBe('en/guide/intro.md');
    });

    test('should handle src/ files with root locale', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            localesMap: { en: 'root' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;
        const result = rewriteFn('src/en/index.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('index.md', '', '');
        expect(result).toBe('index.md');
    });

    test('should handle src/ files without locale prefix', () => {
        const mockState: any = {
            localesMap: { en: 'en' },
            versionsConfig: { hooks: { rewritesHook: xJet.fn() } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;
        const result = rewriteFn('src/file.md');

        expect(result).toBe('file.md');
    });

    test('should handle archive/ files with version and locale', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            localesMap: { en: 'en' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;
        const result = rewriteFn('archive/v1.0.0/en/guide/intro.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('guide/intro.md', 'v1.0.0', 'en');
        expect(result).toBe('en/v1.0.0/guide/intro.md');
    });

    test('should handle archive/ files with root locale', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            localesMap: { en: 'root' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;
        const result = rewriteFn('archive/v2.0.0/en/index.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('index.md', 'v2.0.0', '');
        expect(result).toBe('v2.0.0/index.md');
    });

    test('should handle files that do not match src/ or archive/ patterns', () => {
        const mockState: any = {
            localesMap: { en: 'en' },
            versionsConfig: { hooks: { rewritesHook: xJet.fn() } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;
        const result = rewriteFn('other/path/file.md');

        expect(result).toBe('other/path/file.md');
    });

    test('should handle multiple rewrites with different paths', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            localesMap: { en: 'en', fr: 'fr' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;

        const result1 = rewriteFn('src/en/file1.md');
        const result2 = rewriteFn('src/fr/file2.md');
        const result3 = rewriteFn('archive/v1.0.0/en/file3.md');

        expect(result1).toBe('en/file1.md');
        expect(result2).toBe('fr/file2.md');
        expect(result3).toBe('en/v1.0.0/file3.md');
        expect(mockRewritesHook).toHaveBeenCalledTimes(3);
    });

    test('should handle deeply nested archive paths', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            localesMap: { en: 'en' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        const rewriteFn = mockState.vitepressConfig.rewrites;
        const result = rewriteFn('archive/v1.0.0/en/docs/api/reference.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('docs/api/reference.md', 'v1.0.0', 'en');
        expect(result).toBe('en/v1.0.0/docs/api/reference.md');
    });
});
