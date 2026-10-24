/**
 * Imports
 */

import { copyFileSync, existsSync } from 'fs';
import { inject } from '@remotex-labs/xinject';
import { latestScript, parseLatestEntry } from '@components/latest.component';

/**
 * Tests
 */

function runScript(script: string, pathname: string, search = '', hash = ''): string | undefined {
    let target: string | undefined;
    const events: Array<any> = [];
    const history: any = { state: null, replaceState: (state: any, title: string, url: string) => (history.state = state, target = url) };
    class PopStateEvent { constructor(readonly type: string, readonly init: any) {} }

    new Function('location', 'history', 'dispatchEvent', 'PopStateEvent', script)(
        { pathname, search, hash }, history, (event: any) => events.push(event), PopStateEvent
    );

    // the router ignores a popstate event whose state is null
    expect(events.map(event => [ event.type, event.init.state !== null ])).toEqual(target ? [[ 'popstate', true ]] : []);

    return target;
}

describe('latestScript', () => {
    const versions = [ 'v2.0.x', 'v1.0.x' ];

    test.each`
        base            | pathname                 | expected
        ${ '/' }        | ${ '/' }                 | ${ '/v2.0.x/' }
        ${ '/' }        | ${ '/index.html' }       | ${ '/v2.0.x/index.html' }
        ${ '/' }        | ${ '/guide/' }           | ${ '/v2.0.x/guide/' }
        ${ '/' }        | ${ '/de/' }              | ${ '/de/v2.0.x/' }
        ${ '/' }        | ${ '/de' }               | ${ '/de/v2.0.x/' }
        ${ '/' }        | ${ '/de/guide/' }        | ${ '/de/v2.0.x/guide/' }
        ${ '/docs/' }   | ${ '/docs/' }            | ${ '/docs/v2.0.x/' }
        ${ '/docs/' }   | ${ '/docs/de/guide/' }   | ${ '/docs/de/v2.0.x/guide/' }
    `('should move $pathname under $base to $expected', ({ base, pathname, expected }: any) => {
        expect(runScript(latestScript(base, 'v2.0.x', versions, [ 'de' ]), pathname)).toBe(expected);
    });

    test.each`
        pathname
        ${ '/v2.0.x/guide/' }
        ${ '/v1.0.x/' }
        ${ '/v1.0.x' }
        ${ '/de/v1.0.x/guide/' }
        ${ '/v2.0.x/missing.html' }
    `('should leave $pathname, which names a version, alone', ({ pathname }: any) => {
        expect(runScript(latestScript('/', 'v2.0.x', versions, [ 'de' ]), pathname)).toBeUndefined();
    });

    test('should leave a path outside the base alone', () => {
        expect(runScript(latestScript('/docs/', 'v2.0.x', versions, []), '/guide/')).toBeUndefined();
    });

    test('should keep the query string and the hash', () => {
        expect(runScript(latestScript('/', 'v2.0.x', versions, []), '/guide/', '?a=1', '#setup')).toBe('/v2.0.x/guide/?a=1#setup');
    });

    test('should escape every value so the script cannot close its tag', () => {
        expect(latestScript('/</script>/', '</script>', [ '</script>' ], [ '</script>' ])).not.toContain('</');
    });
});

describe('parseLatestEntry', () => {
    let state: any;

    beforeEach(() => {
        xJet.restoreAllMocks();

        state = {
            latest: 'v2.0.x',
            versionsList: [ 'v2.0.x', 'v1.0.x' ],
            localesMap: { '/': 'root', de: 'de' },
            vitepressConfig: { base: '/docs' }
        };

        xJet.mock(inject).mockReturnValue(state);
    });

    test('should add the script after the user head entries', () => {
        const userHead = [[ 'meta', { name: 'theme-color', content: '#fff' }]];
        state.vitepressConfig.head = userHead;

        parseLatestEntry();
        const [ tag, , script ] = state.vitepressConfig.head[1];

        expect(state.vitepressConfig.head[0]).toBe(userHead[0]);
        expect(tag).toBe('script');
        expect(runScript(script, '/docs/de/guide/')).toBe('/docs/de/v2.0.x/guide/');
    });

    test('should copy the latest home page to the root of the site and of every locale, then run the user hook', async () => {
        const userBuildEnd = xJet.fn();
        state.vitepressConfig.buildEnd = userBuildEnd;
        xJet.mock(existsSync).mockImplementation((path: any) => String(path).includes('v2.0.x'));
        xJet.mock(copyFileSync).mockImplementation(() => undefined);

        parseLatestEntry();
        await state.vitepressConfig.buildEnd({ outDir: '/out' });

        expect(copyFileSync).toHaveBeenNthCalledWith(1, '/out/v2.0.x/index.html', '/out/index.html');
        expect(copyFileSync).toHaveBeenNthCalledWith(2, '/out/de/v2.0.x/index.html', '/out/de/index.html');
        expect(userBuildEnd).toHaveBeenCalledWith({ outDir: '/out' });
    });

    test('should keep a root page that the site already publishes', async () => {
        xJet.mock(existsSync).mockReturnValue(true);
        xJet.mock(copyFileSync).mockImplementation(() => undefined);

        parseLatestEntry();
        await state.vitepressConfig.buildEnd({ outDir: '/out' });

        expect(copyFileSync).not.toHaveBeenCalled();
    });
});
