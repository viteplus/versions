/**
 * Imports
 */

import { inject } from '@remotex-labs/xinject';
import { readFileSync, writeFileSync } from 'fs';
import { parseLatestEntry } from '@components/latest.component';

/**
 * Tests
 */

describe('parseLatestEntry', () => {
    let state: any;
    const userPlugin = { name: 'user' };
    const siteConfig = { outDir: '/out' };
    const plugin = (): any => state.vitepressConfig.vite.plugins.at(-1);

    beforeEach(() => {
        xJet.restoreAllMocks();

        state = {
            latest: 'v2.0.x',
            localesMap: { '/': 'root', de: 'de' },
            vitepressConfig: { base: '/docs/', vite: { plugins: [ userPlugin ] } }
        };

        xJet.mock(inject).mockReturnValue(state);
        xJet.mock(readFileSync).mockReturnValue(<any> '<head></head>');
        xJet.mock(writeFileSync).mockImplementation(() => undefined);
    });

    test.each`
        originalUrl                | url
        ${ '/docs/' }              | ${ '/docs/v2.0.x/' }
        ${ '/docs/index.html?a' }  | ${ '/docs/v2.0.x/' }
        ${ '/docs/de' }            | ${ '/docs/de/v2.0.x/' }
    `('should point the dev page of the root $originalUrl at $url', ({ originalUrl, url }: any) => {
        parseLatestEntry();

        expect(state.vitepressConfig.vite.plugins[0]).toBe(userPlugin);
        expect(plugin().transformIndexHtml('<head>', { originalUrl })).toContain(`"${ url }"`);
    });

    test('should leave a dev page below the root untouched', () => {
        parseLatestEntry();

        expect(plugin().transformIndexHtml('<head>', { originalUrl: '/docs/v1.0.x/guide' })).toBe('<head>');
    });

    test('should copy the latest home page to every root with its versioned address, then run the user hook', async () => {
        const userBuildEnd = xJet.fn();
        state.vitepressConfig.buildEnd = userBuildEnd;

        parseLatestEntry();
        await state.vitepressConfig.buildEnd(siteConfig);

        expect(readFileSync).toHaveBeenCalledWith('/out/de/v2.0.x/index.html', 'utf8');
        expect(writeFileSync).toHaveBeenNthCalledWith(1, '/out/index.html', expect.stringContaining('"/docs/v2.0.x/"'), { flag: 'wx' });
        expect(writeFileSync).toHaveBeenNthCalledWith(2, '/out/de/index.html', expect.stringContaining('"/docs/de/v2.0.x/"'), { flag: 'wx' });
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
