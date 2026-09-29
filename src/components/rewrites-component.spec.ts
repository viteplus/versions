/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { MockState } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { join } from 'path/posix';
import { inject } from '@remotex-labs/xinject';
import { getAllMarkdownFilesRelative } from '@components/object.component';
import { createRouteResolver, parseRoutesComponent, parseVersionRoutes, rewritesHook } from '@components/rewrites.component';

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

describe('createRouteResolver', () => {
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
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'en', fr: 'fr' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        expect(typeof createRouteResolver()).toBe('function');
    });

    test('should handle src/ files with locale prefix', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'en', fr: 'fr' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();
        const result = rewriteFn('src/en/guide/intro.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('guide/intro.md', '', 'en');
        expect(result).toBe('en/guide/intro.md');
    });

    test('should handle src/ files with root locale', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'root' },
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();
        const result = rewriteFn('src/en/index.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('index.md', '', '');
        expect(result).toBe('index.md');
    });

    test('should handle src/ files without locale prefix', () => {
        const mockState: any = {
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'en' },
            versionsConfig: { hooks: { rewritesHook: xJet.fn() } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();
        const result = rewriteFn('src/file.md');

        expect(result).toBe('file.md');
    });

    test('should handle archive/ files with version and locale', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'en' },
            versionsList: [ 'v1.0.0', 'v2.0.0' ],
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();
        const result = rewriteFn('archive/v1.0.0/en/guide/intro.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('guide/intro.md', 'v1.0.0', 'en');
        expect(result).toBe('en/v1.0.0/guide/intro.md');
    });

    test('should handle archive/ files with root locale', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'root' },
            versionsList: [ 'v1.0.0', 'v2.0.0' ],
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();
        const result = rewriteFn('archive/v2.0.0/en/index.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('index.md', 'v2.0.0', '');
        expect(result).toBe('v2.0.0/index.md');
    });

    test('should handle files that do not match src/ or archive/ patterns', () => {
        const mockState: any = {
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'en' },
            versionsConfig: { hooks: { rewritesHook: xJet.fn() } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();
        const result = rewriteFn('other/path/file.md');

        expect(result).toBe('other/path/file.md');
    });

    test('should handle multiple rewrites with different paths', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'en', fr: 'fr' },
            versionsList: [ 'v1.0.0', 'v2.0.0' ],
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();

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
            sources: 'src',
            archive: 'archive',
            localesMap: { en: 'en' },
            versionsList: [ 'v1.0.0', 'v2.0.0' ],
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();
        const result = rewriteFn('archive/v1.0.0/en/docs/api/reference.md');

        expect(mockRewritesHook).toHaveBeenCalledWith('docs/api/reference.md', 'v1.0.0', 'en');
        expect(result).toBe('en/v1.0.0/docs/api/reference.md');
    });

    test('should honor custom sources and archive directory names', () => {
        const mockRewritesHook = xJet.fn(
            (file: string, version: string, locale: string) => join(locale, version, file)
        );

        const mockState: any = {
            sources: 'latest',
            archive: 'versions',
            localesMap: { en: 'root' },
            versionsList: [ 'v1.0.0' ],
            versionsConfig: { hooks: { rewritesHook: mockRewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        const rewriteFn = createRouteResolver();

        expect(rewriteFn('latest/en/index.md')).toBe('index.md');
        expect(rewriteFn('latest/guide/intro.md')).toBe('guide/intro.md');
        expect(rewriteFn('versions/v1.0.0/en/index.md')).toBe('v1.0.0/index.md');
        expect(rewriteFn('src/en/index.md')).toBe('src/en/index.md');
    });
});

describe('parseVersionRoutes', () => {
    let mockInject: MockState<any>;
    let mockState: any;

    beforeEach(() => {
        xJet.resetAllMocks();

        mockInject = xJet.mock(inject);
        mockState = {
            sources: 'src',
            archive: 'archive',
            sourcesPath: '/docs/src',
            archivePath: '/docs/archive',
            localesMap: {},
            routesMap: {},
            versionsList: [ 'v1.0.x' ],
            versionsConfig: { current: 'v2.0.x', hooks: { rewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
    });

    test('should key the current version by its configured label', () => {
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> [ 'index.md', 'guide/index.md' ]);

        const routes = parseVersionRoutes(createRouteResolver());

        expect(routes['v2.0.x']).toEqual([ 'index.md', 'guide/index.md' ]);
    });

    test('should prefix an archived version route with its version folder', () => {
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> [ 'release.md' ]);

        const routes = parseVersionRoutes(createRouteResolver());

        expect(routes['v1.0.x']).toEqual([ 'v1.0.x/release.md' ]);
    });

    test('should read the current version from sources and each archived version from its own folder', () => {
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> []);

        parseVersionRoutes(createRouteResolver());

        expect(getAllMarkdownFilesRelative).toHaveBeenCalledTimes(2);
        expect(getAllMarkdownFilesRelative).toHaveBeenNthCalledWith(1, '/docs/src');
        expect(getAllMarkdownFilesRelative).toHaveBeenNthCalledWith(2, '/docs/archive/v1.0.x');
    });

    test('should list a version with no markdown files as an empty array', () => {
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> []);

        const routes = parseVersionRoutes(createRouteResolver());

        expect(routes).toEqual({ 'v2.0.x': [], 'v1.0.x': [] });
    });
});

describe('parseRoutesComponent', () => {
    let mockInject: MockState<any>;
    let mockState: any;

    beforeEach(() => {
        xJet.resetAllMocks();

        mockInject = xJet.mock(inject);
        mockState = {
            sources: 'src',
            archive: 'archive',
            sourcesPath: '/docs/src',
            archivePath: '/docs/archive',
            localesMap: {},
            routesMap: {},
            versionsList: [ 'v1.0.x' ],
            versionsConfig: { current: 'v2.0.x', hooks: { rewritesHook } },
            vitepressConfig: {}
        };

        mockInject.mockReturnValue(mockState);
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> [ 'index.md' ]);
    });

    test('should give vitepress a function-based rewrites configuration', () => {
        parseRoutesComponent();

        expect(typeof mockState.vitepressConfig.rewrites).toBe('function');
        expect(mockState.vitepressConfig.rewrites('archive/v1.0.x/index.md')).toBe('v1.0.x/index.md');
    });

    test('should fill the routes map of the state', () => {
        parseRoutesComponent();

        expect(mockState.routesMap).toEqual({ 'v2.0.x': [ 'index.md' ], 'v1.0.x': [ 'v1.0.x/index.md' ] });
    });

    test('should list a route that the rewrites function returns for the same file', () => {
        parseRoutesComponent();

        const rewritten = mockState.vitepressConfig.rewrites('archive/v1.0.x/index.md');

        expect(mockState.routesMap['v1.0.x']).toContain(rewritten);
    });
});
