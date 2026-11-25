/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { MarkdownRenderer, PageData, TransformPageContext } from 'vitepress';

/**
 * Imports
 */

import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';

/**
 * Moves an absolute page link into a version.
 *
 * @param href - The link as the markdown source writes it
 * @param version - The name of the version that the link should point into
 * @param versions - The names of every published version
 * @param locales - The URL prefixes of the non-root locales, without their slashes
 * @returns The link with `version` inserted after its leading locale, or the link unchanged
 *
 * @remarks
 * A link is left unchanged when it is not absolute, when it already names a version,
 * or when its last segment carries an extension other than `.md` or `.html`, which marks a public file.
 *
 * @example
 * ```ts
 * versionLink('/guide#setup', 'v2.x', versions, [ 'de' ]); // '/v2.x/guide#setup'
 * versionLink('/de/guide', 'v2.x', versions, [ 'de' ]);    // '/de/v2.x/guide'
 * versionLink('/v1.x/guide', 'v2.x', versions, [ 'de' ]);  // '/v1.x/guide'
 * versionLink('/files/a.pdf', 'v2.x', versions, [ 'de' ]); // '/files/a.pdf'
 * ```
 *
 * @since 3.0.0
 */

export function versionLink(href: string, version: string, versions: Array<string>, locales: Array<string>): string {
    if (!href.startsWith('/') || href.startsWith('//')) return href;

    const pathname = href.replace(/[?#].*$/, '');
    const segments = pathname.split('/');
    const index = versions.includes(segments[1]) || !locales.includes(segments[1]) ? 1 : 2;
    if (versions.includes(segments[index]) || /\.(?!(md|html)$)[^./]+$/.test(pathname)) return href;

    const prefix = segments.slice(0, index).join('/');

    return `${ prefix }/${ version }${ href.slice(prefix.length) }`;
}

/**
 * Moves every `link` in the frontmatter of a page into a version.
 *
 * @param value - The frontmatter, or any value inside it, changed in place
 * @param version - The name of the version that the links should point into
 * @param versions - The names of every published version
 * @param locales - The URL prefixes of the non-root locales, without their slashes
 *
 * @remarks
 * The home layout reads its buttons and cards from the frontmatter, such as `hero.actions[].link` and
 * `features[].link`, and a page reads `prev` and `next` from it. Markdown-it never sees these links,
 * so every string under a key named `link`, at any depth, runs through {@link versionLink}.
 * Every other key, such as `hero.image.src`, is left alone.
 *
 * @example
 * ```ts
 * const frontmatter = { hero: { actions: [{ text: 'Get Started', link: '/guide' }] } };
 * versionFrontmatterLinks(frontmatter, 'v2.x', versions, []);
 * frontmatter.hero.actions[0].link; // '/v2.x/guide'
 * ```
 *
 * @see versionLink
 * @see https://github.com/viteplus/versions/issues/61
 *
 * @since 3.1.0
 */

export function versionFrontmatterLinks(value: unknown, version: string, versions: Array<string>, locales: Array<string>): void {
    if (!value || typeof value !== 'object') return;

    const record = <Record<string, unknown>> value;
    for (const [ key, item ] of Object.entries(record)) {
        if (key === 'link' && typeof item === 'string') record[key] = versionLink(item, version, versions, locales);
        else versionFrontmatterLinks(item, version, versions, locales);
    }
}

/**
 * Moves the absolute links of every page into the version of that page.
 *
 * @remarks
 * Every version publishes its pages under its own name, so a link such as `/guide` would leave the version.
 * A markdown-it core rule reads the version from the published path of the page,
 * which VitePress hands to markdown-it as `env.relativePath` once `rewrites` has run,
 * and passes every link of the page through {@link versionLink}.
 * The rule runs while VitePress parses the page, before the dead link check reads the links,
 * so content written with root links keeps pointing into its own version.
 * A `markdown.config` of the user configuration still runs after the rule.
 *
 * Links in the frontmatter, such as the buttons of a home page, go through {@link versionFrontmatterLinks}
 * in `transformPageData`, which reads the version from the published `relativePath` the same way.
 * A `transformPageData` of the user configuration runs after it and sees the versioned links.
 *
 * @example
 * ```ts
 * parseVersionLinks();
 * // in archive/v1.x/guide.md, [Release](/release) renders as /v1.x/release
 * // and a hero action with link: /guide in archive/v1.x/index.md opens /v1.x/guide
 * ```
 *
 * @see versionLink
 * @see https://github.com/viteplus/versions/issues/55
 *
 * @since 3.0.0
 */

export function parseVersionLinks(): void {
    const state = inject(StateModel);
    const { versionsList, localeSegments } = state;
    const { config, ...markdown } = state.vitepressConfig.markdown ?? {};
    const { transformPageData } = state.vitepressConfig;
    const versionOf = (page?: string): string | undefined =>
        page?.split('/').slice(0, 2).find(segment => versionsList.includes(segment));

    state.vitepressConfig.transformPageData = async (pageData: PageData, context: TransformPageContext): Promise<Partial<PageData> | void> => {
        const version = versionOf(pageData.relativePath);
        if (version) versionFrontmatterLinks(pageData.frontmatter, version, versionsList, localeSegments);

        return transformPageData?.(pageData, context);
    };

    state.vitepressConfig.markdown = {
        ...markdown,
        async config(md: MarkdownRenderer): Promise<void> {
            md.core.ruler.push('viteplus_version_links', ({ env, tokens }) => {
                const version = versionOf(env?.relativePath);
                if (!version) return;

                for (const token of tokens.flatMap(block => block.children ?? [])) {
                    const href = token.type === 'link_open' && token.attrGet('href');
                    if (href) token.attrSet('href', versionLink(href, version, versionsList, localeSegments));
                }
            });

            await config?.(md);
        }
    };
}
