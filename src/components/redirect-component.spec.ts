/**
 * Imports
 */

import { inject } from '@remotex-labs/xinject';
import { currentVersionPattern, parseCurrentVersionRedirect } from '@components/redirect.component';

/**
 * Tests
 */

function runScript(script: string, pathname: string, search = '', hash = ''): string | undefined {
    let target: string | undefined;
    const location = { pathname, search, hash, replace: (url: string) => (target = url) };
    new Function('location', script)(location);

    return target;
}

describe('currentVersionPattern', () => {
    test.each`
        base            | pathname                         | expected
        ${ '/' }        | ${ '/v2.0.x/guide/' }            | ${ '/guide/' }
        ${ '/' }        | ${ '/v2.0.x/guide/intro.html' }  | ${ '/guide/intro.html' }
        ${ '/' }        | ${ '/v2.0.x/' }                  | ${ '/' }
        ${ '/' }        | ${ '/v2.0.x' }                   | ${ '/' }
        ${ '/' }        | ${ '/de/v2.0.x/guide/' }         | ${ '/de/guide/' }
        ${ '/docs/' }   | ${ '/docs/v2.0.x/guide/' }       | ${ '/docs/guide/' }
        ${ '/docs/' }   | ${ '/docs/de/v2.0.x/' }          | ${ '/docs/de/' }
    `('should turn $pathname under $base into $expected', ({ base, pathname, expected }: any) => {
        const pattern = currentVersionPattern(base, 'v2.0.x', [ 'de' ]);

        expect(pathname.replace(pattern, '$1')).toBe(expected);
    });

    test.each`
        pathname
        ${ '/guide/' }
        ${ '/v1.0.x/guide/' }
        ${ '/guide/v2.0.x/' }
        ${ '/fr/v2.0.x/guide/' }
        ${ '/v2.0.xyz/guide/' }
        ${ '/v2a0bx/guide/' }
    `('should not match $pathname', ({ pathname }: any) => {
        expect(currentVersionPattern('/', 'v2.0.x', [ 'de' ]).test(pathname)).toBe(false);
    });

    test('should not match a path outside the base', () => {
        expect(currentVersionPattern('/docs/', 'v2.0.x', []).test('/v2.0.x/guide/')).toBe(false);
    });

    test('should escape every slash so the pattern cannot close a script tag', () => {
        expect(String(currentVersionPattern('/', '</script>', []))).not.toContain('</');
    });
});

describe('parseCurrentVersionRedirect', () => {
    let state: any;

    beforeEach(() => {
        xJet.restoreAllMocks();

        state = {
            versionsList: [ 'v1.0.x' ],
            versionsConfig: { current: 'v2.0.x' },
            localesMap: { '/': 'root', de: 'de' },
            vitepressConfig: { base: '/docs' }
        };

        xJet.mock(inject).mockReturnValue(state);
    });

    test('should add a script that moves the reader to the unversioned page', () => {
        parseCurrentVersionRedirect();
        const [ tag, , script ] = state.vitepressConfig.head[0];

        expect(tag).toBe('script');
        expect(runScript(script, '/docs/de/v2.0.x/guide/', '?a=1', '#setup')).toBe('/docs/de/guide/?a=1#setup');
        expect(runScript(script, '/docs/guide/')).toBeUndefined();
    });

    test('should append the script after the user head entries without changing them', () => {
        const userHead = [[ 'meta', { name: 'theme-color', content: '#fff' }]];
        state.vitepressConfig.head = userHead;

        parseCurrentVersionRedirect();

        expect(state.vitepressConfig.head).toHaveLength(2);
        expect(state.vitepressConfig.head[0]).toBe(userHead[0]);
        expect(userHead).toHaveLength(1);
    });

    test('should normalize a missing base to the root', () => {
        delete state.vitepressConfig.base;

        parseCurrentVersionRedirect();
        const script = state.vitepressConfig.head[0][2];

        expect(runScript(script, '/v2.0.x/guide/')).toBe('/guide/');
    });

    test('should add nothing when an archived version shares the current label', () => {
        state.versionsList.push('v2.0.x');

        parseCurrentVersionRedirect();

        expect(state.vitepressConfig.head).toBeUndefined();
    });
});
