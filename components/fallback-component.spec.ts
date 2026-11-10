/**
 * Imports
 */

import { URL as NodeURL } from 'url';
import { installVersionFallback, pathToRoute, resolveSwitchRoute, routeToPath, splitRoute } from './fallback.component';

/**
 * Tests
 */

const versioning = {
    versions: [ 'next', 'v2.x', 'v1.x' ],
    latestVersion: 'v2.x',
    locales: [ 'de' ],
    routes: {
        next: [ 'next/index.md', 'next/guide.md', 'de/next/index.md', 'de/next/guide.md' ],
        'v2.x': [ 'v2.x/index.md', 'v2.x/guide.md', 'v2.x/config/index.md', 'de/v2.x/index.md' ],
        'v1.x': [ 'v1.x/index.md', 'v1.x/hooks.md' ]
    }
};

describe('pathToRoute', () => {
    test.each`
        pathname                  | route
        ${ '/' }                  | ${ 'index.md' }
        ${ '/de/v1.x/' }          | ${ 'de/v1.x/index.md' }
        ${ '/v1.x/guide.html' }   | ${ 'v1.x/guide.md' }
        ${ '/v1.x/guide' }        | ${ 'v1.x/guide.md' }
        ${ '/v1.x/f%C3%BCr' }     | ${ 'v1.x/für.md' }
    `('should read $pathname as $route', ({ pathname, route }: any) => {
        expect(pathToRoute(pathname)).toBe(route);
    });
});

describe('routeToPath', () => {
    test.each`
        route                  | cleanUrls    | path
        ${ 'de/v1.x/index.md' } | ${ false }  | ${ '/de/v1.x/' }
        ${ 'v1.x/guide.md' }    | ${ false }  | ${ '/v1.x/guide.html' }
        ${ 'v1.x/guide.md' }    | ${ true }   | ${ '/v1.x/guide' }
        ${ 'index.md' }         | ${ false }  | ${ '/' }
    `('should write $route as $path', ({ route, cleanUrls, path }: any) => {
        expect(routeToPath(route, cleanUrls)).toBe(path);
    });
});

describe('splitRoute', () => {
    test.each`
        route                        | parts
        ${ 'de/v1.x/guide/index.md' } | ${ { locale: 'de', version: 'v1.x', page: 'guide' } }
        ${ 'v1.x/guide.md' }          | ${ { locale: '', version: 'v1.x', page: 'guide' } }
        ${ 'v1.x/index.md' }          | ${ { locale: '', version: 'v1.x', page: '' } }
        ${ 'guide.md' }               | ${ { locale: '', version: '', page: 'guide' } }
    `('should split $route', ({ route, parts }: any) => {
        expect(splitRoute(route, versioning)).toEqual(parts);
    });
});

describe('resolveSwitchRoute', () => {
    test.each`
        case                                                         | from                 | to                       | expected
        ${ 'a page that exists' }                                    | ${ 'v2.x/guide.md' } | ${ 'v1.x/hooks.md' }     | ${ undefined }
        ${ 'a missing page that is no switch' }                      | ${ 'v2.x/guide.md' } | ${ 'v2.x/missing.md' }   | ${ undefined }
        ${ 'a missing page in another version that is another page' } | ${ 'v2.x/guide.md' } | ${ 'v1.x/missing.md' }   | ${ undefined }
        ${ 'an old link that names no version' }                     | ${ 'v2.x/guide.md' } | ${ 'guide.md' }          | ${ undefined }
        ${ 'a version switch, to the home of the locale' }           | ${ 'de/next/guide.md' } | ${ 'de/v2.x/guide.md' } | ${ 'de/v2.x/index.md' }
        ${ 'a version switch, to the root home without the locale' } | ${ 'de/v2.x/index.md' } | ${ 'de/v1.x/index.md' } | ${ 'v1.x/index.md' }
        ${ 'a version switch onto a folder page' }                   | ${ 'v2.x/config/index.md' } | ${ 'v1.x/config.md' } | ${ 'v1.x/index.md' }
        ${ 'a language switch, to the home of the version' }         | ${ 'v2.x/guide.md' } | ${ 'de/v2.x/guide.md' }  | ${ 'de/v2.x/index.md' }
        ${ 'a language switch, to the latest home in the language' } | ${ 'v1.x/hooks.md' } | ${ 'de/v1.x/hooks.md' }  | ${ 'de/v2.x/index.md' }
    `('should send $case to $expected', ({ from, to, expected }: any) => {
        expect(resolveSwitchRoute(from, to, versioning)).toBe(expected);
    });

    test('should let a switch through when no home exists either', () => {
        const bare = { ...versioning, routes: { 'v1.x': [ 'v1.x/hooks.md' ] } };

        expect(resolveSwitchRoute('v1.x/hooks.md', 'de/v1.x/hooks.md', bare)).toBeUndefined();
    });
});

describe('installVersionFallback', () => {
    let router: any;
    const siteData: any = { value: { base: '/docs/', cleanUrls: false, themeConfig: { versioning } } };

    beforeEach(() => {
        xJet.restoreAllMocks();

        // the test sandbox has no global URL, which every browser and Node provide
        (<any> globalThis).URL ??= NodeURL;
        (<any> globalThis).window = { location: { href: 'https://a.com/docs/' } };
        router = { go: xJet.fn(async () => undefined), route: { data: { relativePath: 'v1.x/hooks.md' } } };
    });

    afterEach(() => {
        delete (<any> globalThis).window;
    });

    test('should move a language switch onto a missing page through the router, keeping the query and hash', async () => {
        installVersionFallback(router, siteData);

        await expect(router.onBeforeRouteChange('/docs/de/v1.x/hooks.html?q=1#top')).resolves.toBe(false);
        expect(router.go).toHaveBeenCalledWith('/docs/de/v2.x/?q=1#top');
    });

    const passing = [
        [ 'a page that exists', '/docs/v2.x/guide.html' ],
        [ 'a missing page that is no switch', '/docs/v1.x/missing.html' ],
        [ 'an old link that names no version', '/docs/guide.html' ],
        [ 'an address outside the site base', '/other/de/v1.x/hooks.html' ]
    ];

    for (const [ name, to ] of passing) {
        test(`should let ${ name } through`, async () => {
            installVersionFallback(router, siteData);

            await expect(router.onBeforeRouteChange(to)).resolves.toBeUndefined();
            expect(router.go).not.toHaveBeenCalled();
        });
    }

    test('should let the first load through, which has no page to switch from', async () => {
        router.route.data = undefined;
        installVersionFallback(router, siteData);

        await expect(router.onBeforeRouteChange('/docs/de/v1.x/hooks.html')).resolves.toBeUndefined();
    });

    test('should run the hook that the theme set before it, and stop when that hook cancels', async () => {
        router.onBeforeRouteChange = xJet.fn(() => false);
        installVersionFallback(router, siteData);

        await expect(router.onBeforeRouteChange('/docs/de/v1.x/hooks.html')).resolves.toBe(false);
        expect(router.go).not.toHaveBeenCalled();
    });
});
