/**
 * Imports
 */

import { inject } from '@remotex-labs/xinject';
import { createRouteResolver } from '@components/rewrites.component';
import { parseVersionLinks, versionLink } from '@components/links.component';

/**
 * Tests
 */

const versions = [ 'next', 'v2.x', 'v1.x' ];

function link(href: string): any {
    const attrs: Record<string, string> = { href };

    return {
        type: 'link_open',
        attrGet: (name: string) => attrs[name] ?? null,
        attrSet: (name: string, value: string) => (attrs[name] = value)
    };
}

describe('versionLink', () => {
    const move = (href: string): string => versionLink(href, 'next', versions, [ 'de' ]);

    test.each`
        href                        | expected
        ${ '/guide' }               | ${ '/next/guide' }
        ${ '/' }                    | ${ '/next/' }
        ${ '/guide#setup' }         | ${ '/next/guide#setup' }
        ${ '/guide?a=1' }           | ${ '/next/guide?a=1' }
        ${ '/guide.md' }            | ${ '/next/guide.md' }
        ${ '/guide.html' }          | ${ '/next/guide.html' }
        ${ '/components/' }         | ${ '/next/components/' }
        ${ '/de/guide' }            | ${ '/de/next/guide' }
        ${ '/de' }                  | ${ '/de/next' }
    `('should move $href into the version as $expected', ({ href, expected }: any) => {
        expect(move(href)).toBe(expected);
    });

    test.each`
        href
        ${ '/v1.x/guide' }
        ${ '/v1.x' }
        ${ '/de/v1.x/guide' }
        ${ 'guide' }
        ${ './guide' }
        ${ '#setup' }
        ${ 'https://example.com/guide' }
        ${ '//example.com/guide' }
        ${ '/files/report.pdf' }
        ${ '/logo.png#top' }
    `('should leave $href unchanged', ({ href }: any) => {
        expect(move(href)).toBe(href);
    });
});

describe('parseVersionLinks', () => {
    let state: any;
    let rule: (core: any) => void;
    const md: any = { core: { ruler: { push: (name: string, fn: any) => (rule = fn) } } };

    function render(relativePath: string | undefined, href: string): string {
        const token = link(href);
        rule({ env: { relativePath }, tokens: [{ children: [ token ] }, { children: null }] });

        return token.attrGet('href');
    }

    beforeEach(async () => {
        xJet.restoreAllMocks();

        state = { latest: 'v2.x', versionsList: versions, localesMap: { '/': 'root', '/de/': 'de' }, vitepressConfig: {} };
        xJet.mock(inject).mockReturnValue(state);
        xJet.mock(createRouteResolver).mockReturnValue((id: string) => id.replace(/^src\//, 'next/'));

        parseVersionLinks();
        await state.vitepressConfig.markdown.config(md);
    });

    test.each`
        page                    | href             | expected
        ${ 'v1.x/index.md' }    | ${ '/guide' }    | ${ '/v1.x/guide' }
        ${ 'de/v1.x/index.md' } | ${ '/guide' }    | ${ '/v1.x/guide' }
        ${ 'src/guide.md' }     | ${ '/release' }  | ${ '/next/release' }
        ${ 'v1.x/index.md' }    | ${ 'https://a' } | ${ 'https://a' }
        ${ 'src/release.md' }   | ${ '/v2.x/x' }   | ${ '/v2.x/x' }
        ${ 'guide.md' }         | ${ '/guide' }    | ${ '/guide' }
        ${ 'legacy/index.md' }  | ${ '/guide' }    | ${ '/guide' }
        ${ undefined }          | ${ '/guide' }    | ${ '/guide' }
    `('should render $href on $page as $expected', ({ page, href, expected }: any) => {
        expect(render(page, href)).toBe(expected);
    });

    test('should keep the markdown options of the user and run their config after the rule', async () => {
        const calls: Array<string> = [];
        state.vitepressConfig.markdown = { lineNumbers: true, config: async () => { calls.push('user'); } };

        parseVersionLinks();
        await state.vitepressConfig.markdown.config({ core: { ruler: { push: () => calls.push('rule') } } });

        expect(state.vitepressConfig.markdown.lineNumbers).toBe(true);
        expect(calls).toEqual([ 'rule', 'user' ]);
    });
});
