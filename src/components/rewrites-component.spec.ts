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

describe('parseRoutesComponent', () => {
    let mockInject: MockState<unknown, [ token: any, ...args: unknown[] ]>;

    beforeEach(() => {
        xJet.resetAllMocks();
        mockInject = xJet.mock(inject);
    });

    test('should correctly populate vitepressConfig.rewrites for root files', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(version, locale, file)
        );

        const mockState: any = {
            localesMap: { en: 'en', fr: 'de' },
            fileMap: { '': [ 'en/file1.md', 'de/file2.md' ] },
            sources: 'src',
            archive: 'archive',
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        expect(mockState.vitepressConfig.rewrites).toEqual({
            'src/en/file1.md': 'en/file1.md',
            'src/de/file2.md': 'de/file2.md'
        });
    });

    test('should correctly handle archived folders', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(version, locale, file)
        );

        const mockState: any = {
            localesMap: { en: 'en' },
            fileMap: { 'v1.0': [ 'en/file.md' ] },
            sources: 'src',
            archive: 'archive',
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        expect(mockState.vitepressConfig.rewrites).toEqual({
            'archive/v1.0/en/file.md': 'v1.0/en/file.md'
        });
    });

    test('should handle files with no locale prefix', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(version, locale, file)
        );

        const mockState: any = {
            localesMap: { en: 'en' },
            fileMap: { '': [ 'file.md' ] },
            sources: 'src',
            archive: 'archive',
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        parseRoutesComponent();

        expect(mockState.vitepressConfig.rewrites).toEqual({
            'src/file.md': 'file.md'
        });
    });
});
