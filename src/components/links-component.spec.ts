/**
 * Imports
 */

import { inject } from '@remotex-labs/xinject';
import { parseVersionLinks, versionFrontmatterLinks, versionLink } from '@components/links.component';

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

describe('versionFrontmatterLinks', () => {
    test('should move every link of a home page into the version, and leave every other key alone', () => {
        const frontmatter = {
            layout: 'home',
            hero: {
                image: { src: '/logo.png' },
                actions: [
                    { theme: 'brand', text: 'Get Started', link: '/guide' },
                    { theme: 'alt', text: 'Configuration', link: '/configuration/file' },
                    { theme: 'alt', text: 'GitHub', link: 'https://github.com/a/b' }
                ]
            },
            features: [{ title: 'Hooks', link: '/de/hooks' }, { title: 'Plain' }],
            next: { text: 'Old', link: '/v1.x/old' }
        };

        versionFrontmatterLinks(frontmatter, 'v2.x', versions, [ 'de' ]);

        expect(frontmatter).toEqual({
            layout: 'home',
            hero: {
                image: { src: '/logo.png' },
                actions: [
                    { theme: 'brand', text: 'Get Started', link: '/v2.x/guide' },
                    { theme: 'alt', text: 'Configuration', link: '/v2.x/configuration/file' },
                    { theme: 'alt', text: 'GitHub', link: 'https://github.com/a/b' }
                ]
            },
            features: [{ title: 'Hooks', link: '/de/v2.x/hooks' }, { title: 'Plain' }],
            next: { text: 'Old', link: '/v1.x/old' }
        });
    });

    test.each`
        value
        ${ undefined }
        ${ null }
        ${ 'link' }
        ${ { link: 5 } }
    `('should leave $value as it is', ({ value }: any) => {
        const copy = structuredClone(value);
        versionFrontmatterLinks(value, 'v2.x', versions, []);

        expect(value).toEqual(copy);
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

        state = { latest: 'v2.x', versionsList: versions, localeSegments: [ 'de' ], vitepressConfig: {} };
        xJet.mock(inject).mockReturnValue(state);

        parseVersionLinks();
        await state.vitepressConfig.markdown.config(md);
    });

    test.each`
        page                    | href             | expected
        ${ 'v1.x/index.md' }    | ${ '/guide' }    | ${ '/v1.x/guide' }
        ${ 'de/v1.x/index.md' } | ${ '/guide' }    | ${ '/v1.x/guide' }
        ${ 'next/guide.md' }    | ${ '/release' }  | ${ '/next/release' }
        ${ 'de/next/guide.md' } | ${ '/de/x' }     | ${ '/de/next/x' }
        ${ 'v1.x/index.md' }    | ${ 'https://a' } | ${ 'https://a' }
        ${ 'next/release.md' }  | ${ '/v2.x/x' }   | ${ '/v2.x/x' }
        ${ 'src/guide.md' }     | ${ '/guide' }    | ${ '/guide' }
        ${ 'guide.md' }         | ${ '/guide' }    | ${ '/guide' }
        ${ 'legacy/index.md' }  | ${ '/guide' }    | ${ '/guide' }
        ${ undefined }          | ${ '/guide' }    | ${ '/guide' }
    `('should render $href on $page as $expected', ({ page, href, expected }: any) => {
        expect(render(page, href)).toBe(expected);
    });

    test.each`
        page                    | expected
        ${ 'v1.x/index.md' }    | ${ '/v1.x/guide' }
        ${ 'de/v1.x/index.md' } | ${ '/v1.x/guide' }
        ${ 'index.md' }         | ${ '/guide' }
    `('should move the frontmatter links of $page to $expected', async ({ page, expected }: any) => {
        const pageData: any = { relativePath: page, frontmatter: { hero: { actions: [{ link: '/guide' }] } } };
        await state.vitepressConfig.transformPageData(pageData, {});

        expect(pageData.frontmatter.hero.actions[0].link).toBe(expected);
    });

    test('should run the transformPageData of the user after it, with the versioned links, and hand back its result', async () => {
        const user = xJet.fn((pageData: any) => ({ title: pageData.frontmatter.next.link }));
        state.vitepressConfig = { transformPageData: user };
        parseVersionLinks();

        const pageData: any = { relativePath: 'v1.x/guide.md', frontmatter: { next: { link: '/release' } } };
        const context = { siteConfig: {} };

        await expect(state.vitepressConfig.transformPageData(pageData, context)).resolves.toEqual({ title: '/v1.x/release' });
        expect(user).toHaveBeenCalledWith(pageData, context);
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
