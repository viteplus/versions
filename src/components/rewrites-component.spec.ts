/**
 * Imports
 */

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
    let state: any;

    beforeEach(() => {
        xJet.restoreAllMocks();

        state = {
            latest: 'v1.0.x',
            localesMap: { en: 'root', de: 'de' },
            versionDirs: { 'v2.0.x': 'src', 'v1.0.x': 'archive/v1.0.x', 'v0.x': 'legacy/v0' },
            versionsConfig: { hooks: { rewritesHook } }
        };

        xJet.mock(inject).mockReturnValue(state);
    });

    test.each`
        id                                      | expected
        ${ 'src/guide/intro.md' }               | ${ 'v2.0.x/guide/intro.md' }
        ${ 'src/en/index.md' }                  | ${ 'v2.0.x/index.md' }
        ${ 'src/de/index.md' }                  | ${ 'de/v2.0.x/index.md' }
        ${ 'archive/v1.0.x/docs/api/ref.md' }   | ${ 'v1.0.x/docs/api/ref.md' }
        ${ 'archive/v1.0.x/de/index.md' }       | ${ 'de/v1.0.x/index.md' }
        ${ 'legacy/v0/de/index.md' }            | ${ 'de/v0.x/index.md' }
        ${ 'legacy/v00/index.md' }              | ${ 'legacy/v00/index.md' }
        ${ 'srcs/index.md' }                    | ${ 'srcs/index.md' }
        ${ 'public/logo.png' }                  | ${ 'public/logo.png' }
    `('should publish $id as $expected', ({ id, expected }: any) => {
        expect(createRouteResolver()(id)).toBe(expected);
    });

    test('should hand the source, version, and locale to the rewrites hook', () => {
        state.versionsConfig.hooks.rewritesHook = xJet.fn(() => 'custom');

        expect(createRouteResolver()('legacy/v0/de/guide.md')).toBe('custom');
        expect(state.versionsConfig.hooks.rewritesHook).toHaveBeenCalledWith('guide.md', 'v0.x', 'de');
    });
});

describe('parseVersionRoutes', () => {
    beforeEach(() => {
        xJet.restoreAllMocks();

        xJet.mock(inject).mockReturnValue(<any> {
            root: '/docs',
            localesMap: {},
            versionDirs: { 'v2.0.x': 'src', 'v1.0.x': 'archive/v1.0.x' },
            versionsConfig: { hooks: { rewritesHook } }
        });
    });

    test('should read every version from its folder and prefix its routes with its name', () => {
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> [ 'index.md', 'guide/index.md' ]);

        const routes = parseVersionRoutes(createRouteResolver());

        expect(getAllMarkdownFilesRelative).toHaveBeenNthCalledWith(1, '/docs/src');
        expect(getAllMarkdownFilesRelative).toHaveBeenNthCalledWith(2, '/docs/archive/v1.0.x');
        expect(routes).toEqual({
            'v2.0.x': [ 'v2.0.x/index.md', 'v2.0.x/guide/index.md' ],
            'v1.0.x': [ 'v1.0.x/index.md', 'v1.0.x/guide/index.md' ]
        });
    });

    test('should list a version with no markdown files as an empty array', () => {
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> []);

        expect(parseVersionRoutes(createRouteResolver())).toEqual({ 'v2.0.x': [], 'v1.0.x': [] });
    });
});

describe('parseRoutesComponent', () => {
    let state: any;

    beforeEach(() => {
        xJet.restoreAllMocks();

        state = {
            root: '/docs',
            localesMap: {},
            routesMap: {},
            versionDirs: { 'v2.0.x': 'src', 'v1.0.x': 'archive/v1.0.x' },
            versionsConfig: { hooks: { rewritesHook } },
            vitepressConfig: {}
        };

        xJet.mock(inject).mockReturnValue(state);
        xJet.mock(getAllMarkdownFilesRelative).mockReturnValue(<any> [ 'index.md' ]);
    });

    test('should give vitepress the resolver and fill the routes map with what it returns', () => {
        parseRoutesComponent();

        expect(state.vitepressConfig.rewrites('archive/v1.0.x/index.md')).toBe('v1.0.x/index.md');
        expect(state.routesMap).toEqual({ 'v2.0.x': [ 'v2.0.x/index.md' ], 'v1.0.x': [ 'v1.0.x/index.md' ] });
    });
});
