/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { MarkdownRenderer } from 'vitepress';

/**
 * Imports
 */

import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';
import { createRouteResolver } from '@components/rewrites.component';

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
 * Moves the absolute links of every page into the version of that page.
 *
 * @remarks
 * Every version publishes its pages under its own name, so a link such as `/guide` would leave the version.
 * A markdown-it core rule reads the version from the published path of the page,
 * and passes every link of the page through {@link versionLink}.
 * The rule runs while VitePress parses the page, before the dead link check reads the links,
 * so content written with root links keeps pointing into its own version.
 * A `markdown.config` of the user configuration still runs after the rule.
 *
 * @example
 * ```ts
 * parseVersionLinks();
 * // in archive/v1.x/guide.md, [Release](/release) renders as /v1.x/release
 * ```
 *
 * @see versionLink
 * @see https://github.com/viteplus/versions/issues/55
 *
 * @since 3.0.0
 */

export function parseVersionLinks(): void {
    const state = inject(StateModel);
    const resolve = createRouteResolver();
    const { versionsList, localesMap } = state;
    const locales = Object.keys(localesMap).filter(key => localesMap[key] !== 'root').map(key => key.replace(/^\/+|\/+$/g, ''));
    const { config, ...markdown } = state.vitepressConfig.markdown ?? {};

    state.vitepressConfig.markdown = {
        ...markdown,
        async config(md: MarkdownRenderer): Promise<void> {
            md.core.ruler.push('viteplus_version_links', ({ env, tokens }) => {
                const page: string | undefined = env?.relativePath;
                const version = page && resolve(page).split('/').slice(0, 2).find(segment => versionsList.includes(segment));
                if (!version) return;

                for (const token of tokens.flatMap(block => block.children ?? [])) {
                    const href = token.type === 'link_open' && token.attrGet('href');
                    if (href) token.attrSet('href', versionLink(href, version, versionsList, locales));
                }
            });

            await config?.(md);
        }
    };
}
