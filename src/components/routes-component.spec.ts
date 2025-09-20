/**
 * Import will remove at compile time
 */

import type { ConfigInterface, RewritesOptionsInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { posix } from 'path';
import { readdirSync, existsSync } from 'fs';
import { collectFilesRecursively, generateVersionedUrls, versionRoutes } from '@components/routes.component';

/**
 * Tests
 */

beforeEach(() => {
    xJet.clearAllMocks();
});

describe('collectFilesRecursively', () => {
    const mockReaddirSync = xJet.mock(readdirSync);

    test('recursively collects all files skipping locales', () => {
        mockReaddirSync
            .mockReturnValueOnce([
                { name: 'en', isDirectory: () => true },
                { name: 'folder', isDirectory: () => true },
                { name: 'file1.md', isDirectory: () => false }
            ] as any)
            .mockReturnValueOnce([{ name: 'file2.md', isDirectory: () => false }] as any);

        const result = collectFilesRecursively('/root', [ 'en' ]);

        expect(result).toEqual([
            posix.join('/root', 'folder', 'file2.md'),
            posix.join('/root', 'file1.md')
        ]);
    });

    test('returns empty array if directory is empty', () => {
        mockReaddirSync.mockReturnValueOnce([]);
        expect(collectFilesRecursively('/empty', [])).toEqual([]);
    });
});

describe('generateVersionedUrls', () => {
    const mockExistsSync = xJet.mock(existsSync);
    const mockReaddirSync = xJet.mock(readdirSync);

    const rewrites: RewritesOptionsInterface = {
        localePrefix: 'locale',
        rewriteProcessor: (src, ver) => `/docs/${ ver }${ src }`,
        localeRewriteProcessor: (src, ver, locale) => `/docs/${ ver }/${ locale }${ src }`
    };

    beforeEach(() => {
        xJet.clearAllMocks();
    });

    test.todo('generates urls for each version and file', () => {
        mockReaddirSync.mockReturnValueOnce([{ name: 'file.md', isDirectory: () => false }] as any);

        const result = generateVersionedUrls(rewrites, '/docs', [ '1.0.0' ]);

        expect(Object.keys(result)).toContain('versions/1.0.0/file.md');
        expect(result['versions/1.0.0/file.md']).toBe('/docs/1.0.0/versions/1.0.0/file.md');
    });

    test.todo('handles locales and strips localePrefix', () => {
        mockReaddirSync
            .mockReturnValueOnce([{ name: 'file.md', isDirectory: () => false }] as any)
            .mockReturnValueOnce([{ name: 'file-locale.md', isDirectory: () => false }] as any);

        mockExistsSync.mockReturnValue(true);
        const result = generateVersionedUrls(
            rewrites,
            '/docs',
            [ '1.0.0' ],
            [ 'en' ]
        );

        const localeKey = 'versions/1.0.0/locale/en/file-locale.md';
        expect(result[localeKey]).toBe('/docs/1.0.0/en/versions/1.0.0/locale/en/file-locale.md');
    });

    test('returns empty object if rewrites is false', () => {
        const result = generateVersionedUrls(false, '/docs', [ '1.0.0' ]);
        expect(result).toEqual({});
    });
});

describe('versionRoutes', () => {
    test('merges generated URLs into config.rewrites', () => {
        const config: ConfigInterface = {
            rewrites: {},
            versioning: {
                rewrites: {
                    localePrefix: 'locale',
                    rewriteProcessor: (src: string, v: string) => `/${ v }${ src }`
                }
            },
            locales: { en: {} }
        } as any;

        const spy = xJet.mock(generateVersionedUrls)
            .mockReturnValue({ 'versions/1.0.0/file.md': '/1.0.0/versions/1.0.0/file.md' });

        versionRoutes(config, [ '1.0.0' ], '/docs');

        expect(config.rewrites).toMatchObject({
            'versions/1.0.0/file.md': '/1.0.0/versions/1.0.0/file.md'
        });

        spy.mockRestore();
    });
});
