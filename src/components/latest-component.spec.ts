/**
 * Imports
 */

import { URL as NodeURL } from 'url';
import { inject } from '@remotex-labs/xinject';
import { readFileSync, writeFileSync } from 'fs';
import { latestScript, openLatestPage, parseLatestEntry } from '@components/latest.component';

/**
 * Tests
 */

const routes = [
    'v2.0.x/index.md', 'v2.0.x/guide.md', 'v2.0.x/config/index.md', 'v2.0.x/für.md',
    'de/v2.0.x/index.md', 'de/v2.0.x/guide/index.md', 'de/v2.0.x/api.md'
];
const data = { base: '/docs/', latest: 'v2.0.x', cleanUrls: false, locales: [ 'de' ], versions: [ 'next', 'v2.0.x', 'v1.0.x' ], routes, reload: false };

describe('openLatestPage', () => {
    let replace: any;
    let replaceState: any;

    const open = (href: string, overrides: object = {}): void => {
        const url = new NodeURL(href, 'https://a.com');
        (<any> globalThis).location = { pathname: url.pathname, search: url.search, hash: url.hash, replace };
        openLatestPage({ ...data, ...overrides });
    };

    beforeEach(() => {
        xJet.restoreAllMocks();

        replace = xJet.fn();
        replaceState = xJet.fn();
        (<any> globalThis).history = { state: null, replaceState };
    });

    afterEach(() => {
        delete (<any> globalThis).location;
        delete (<any> globalThis).history;
        delete (<any> globalThis).document;
    });

    test.each`
        href                         | url
        ${ '/docs/' }                | ${ '/docs/v2.0.x/' }
        ${ '/docs' }                 | ${ '/docs/v2.0.x/' }
        ${ '/docs/index.html?a#b' }  | ${ '/docs/v2.0.x/?a#b' }
        ${ '/docs/guide' }           | ${ '/docs/v2.0.x/guide.html' }
        ${ '/docs/guide/' }          | ${ '/docs/v2.0.x/guide.html' }
        ${ '/docs/guide.html#top' }  | ${ '/docs/v2.0.x/guide.html#top' }
        ${ '/docs/config' }          | ${ '/docs/v2.0.x/config/' }
        ${ '/docs/de' }              | ${ '/docs/de/v2.0.x/' }
        ${ '/docs/de/' }             | ${ '/docs/de/v2.0.x/' }
        ${ '/docs/de/guide' }        | ${ '/docs/de/v2.0.x/guide/' }
        ${ '/docs/de/guide/?a#b' }   | ${ '/docs/de/v2.0.x/guide/?a#b' }
        ${ '/docs/de/api.html' }     | ${ '/docs/de/v2.0.x/api.html' }
        ${ '/docs/f%C3%BCr' }        | ${ '/docs/v2.0.x/f%C3%BCr.html' }
    `('should move $href onto $url', ({ href, url }: any) => {
        open(href);

        expect(replaceState).toHaveBeenCalledWith(null, '', url);
    });

    test('should hide the page and open the address with a new request when reload is set', () => {
        (<any> globalThis).document = { documentElement: { style: {} } };
        open('/docs/guide?a#b', { reload: true });

        expect(replace).toHaveBeenCalledWith('/docs/v2.0.x/guide.html?a#b');
        expect(replaceState).not.toHaveBeenCalled();
        expect((<any> globalThis).document.documentElement.style.visibility).toBe('hidden');
    });

    test('should write a clean address when the site serves clean URLs', () => {
        open('/docs/guide.html', { cleanUrls: true });

        expect(replaceState).toHaveBeenCalledWith(null, '', '/docs/v2.0.x/guide');
    });

    test.each`
        case                                      | href
        ${ 'an address that names a version' }    | ${ '/docs/v1.0.x/guide' }
        ${ 'a missing page of a named version' }  | ${ '/docs/de/next/missing' }
        ${ 'a page the latest version lacks' }    | ${ '/docs/missing' }
        ${ 'a page the locale lacks' }            | ${ '/docs/de/config' }
        ${ 'a locale address naming a version' }  | ${ '/docs/de/v1.0.x/guide' }
        ${ 'a locale that is not configured' }    | ${ '/docs/fr/guide' }
        ${ 'an address outside the base' }        | ${ '/other/guide' }
    `('should leave $case untouched', ({ href }: any) => {
        open(href);

        expect(replaceState).not.toHaveBeenCalled();
    });

    test('should run from its source text, as the inline script does', () => {
        (<any> globalThis).location = { pathname: '/docs/guide', search: '', hash: '' };
        new Function(`(${ openLatestPage.toString() })(${ JSON.stringify(data) })`)();

        expect(replaceState).toHaveBeenCalledWith(null, '', '/docs/v2.0.x/guide.html');
    });
});

describe('latestScript', () => {
    test.each`
        base           | expected
        ${ '/docs/' }  | ${ '"base":"/docs/"' }
        ${ 'docs' }    | ${ '"base":"/docs/"' }
        ${ '/' }       | ${ '"base":"/"' }
        ${ undefined } | ${ '"base":"/"' }
    `('should hand the base $base as $expected', ({ base, expected }: any) => {
        xJet.mock(inject).mockReturnValue(<any> {
            latest: 'v2.0.x',
            localeSegments: [],
            versionsList: [ 'v2.0.x' ],
            routesMap: { 'v2.0.x': [ '</script>.md' ] },
            vitepressConfig: { base }
        });

        const script = latestScript();

        expect(script).toContain(expected);
        expect(script).toContain('\\u003c/script>.md');
        expect(script.match(/<\/script>/g)).toHaveLength(1);
    });
});

describe('parseLatestEntry', () => {
    let state: any;
    const userPlugin = { name: 'user' };
    const siteConfig = { outDir: '/out' };
    const plugin = (): any => state.vitepressConfig.vite.plugins.at(-1);

    beforeEach(() => {
        xJet.restoreAllMocks();

        state = {
            latest: 'v2.0.x',
            localeSegments: [ 'de' ],
            versionsList: [ 'v2.0.x' ],
            routesMap: { 'v2.0.x': routes },
            vitepressConfig: { base: '/docs/', vite: { plugins: [ userPlugin ] } }
        };

        xJet.mock(inject).mockReturnValue(state);
        xJet.mock(readFileSync).mockReturnValue(<any> '<head></head>');
        xJet.mock(writeFileSync).mockImplementation(() => undefined);
    });

    test('should add the script to every page the dev server serves, after the user plugins', () => {
        parseLatestEntry();

        expect(state.vitepressConfig.vite.plugins[0]).toBe(userPlugin);
        expect(plugin().transformIndexHtml('<head>')).toContain('<head><script>(');
        expect(plugin().transformIndexHtml('<head>')).toContain('"latest":"v2.0.x"');
    });

    test('should copy the latest home page to every root, add the script to 404.html, then run the user hook', async () => {
        const userBuildEnd = xJet.fn();
        state.vitepressConfig.buildEnd = userBuildEnd;

        parseLatestEntry();
        await state.vitepressConfig.buildEnd(siteConfig);

        expect(readFileSync).toHaveBeenCalledWith('/out/de/v2.0.x/index.html', 'utf8');
        expect(writeFileSync).toHaveBeenNthCalledWith(1, '/out/index.html', expect.stringContaining('<head><script>'), { flag: 'wx' });
        expect(writeFileSync).toHaveBeenNthCalledWith(2, '/out/de/index.html', expect.stringContaining('<head><script>'), { flag: 'wx' });
        expect(writeFileSync).toHaveBeenNthCalledWith(1, '/out/index.html', expect.stringContaining('"reload":false'), { flag: 'wx' });
        expect(writeFileSync).toHaveBeenNthCalledWith(3, '/out/404.html', expect.stringContaining('"reload":true'), { flag: 'w' });
        expect(userBuildEnd).toHaveBeenCalledWith(siteConfig);
    });

    test('should skip a root that already holds a page, and a locale without a latest home page', async () => {
        xJet.mock(writeFileSync).mockImplementation((path: any) => {
            const code = path === '/out/index.html' ? 'EEXIST' : 'ENOENT';
            throw Object.assign(new Error(code), { code });
        });

        parseLatestEntry();

        await expect(state.vitepressConfig.buildEnd(siteConfig)).resolves.toBeUndefined();
    });

    test('should report any other error', async () => {
        xJet.mock(writeFileSync).mockImplementation(() => {
            throw Object.assign(new Error('denied'), { code: 'EACCES' });
        });

        parseLatestEntry();

        await expect(state.vitepressConfig.buildEnd(siteConfig)).rejects.toThrow('denied');
    });
});
