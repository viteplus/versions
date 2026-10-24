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
 * Points an absolute page link at the URL that its version is served under.
 *
 * @param href - The link as the markdown source writes it
 * @param version - The name of the version that holds the page, or an empty string for the latest version
 * @param latest - The name of the latest version, which is served at the root
 * @param versions - The names of every published version
 * @param locales - The URL prefixes of the non-root locales, without their slashes
 * @returns The link with its version segment fixed, or the link unchanged
 *
 * @remarks
 * A link that names the latest version loses that segment, since the latest version is served at the root.
 * A link that names no version gains `version` after its leading locale, so it stays inside the version of the page.
 * A link is left unchanged when it is not absolute, when it names another version,
 * or when its last segment carries an extension other than `.md` or `.html`, which marks a public file.
 *
 * @example
 * ```ts
 * versionLink('/guide#setup', 'next', 'v2.x', versions, [ 'de' ]);   // '/next/guide#setup'
 * versionLink('/de/guide', 'next', 'v2.x', versions, [ 'de' ]);      // '/de/next/guide'
 * versionLink('/de/v2.x/guide', 'next', 'v2.x', versions, [ 'de' ]); // '/de/guide'
 * versionLink('/v1.x/guide', 'next', 'v2.x', versions, [ 'de' ]);    // '/v1.x/guide'
 * versionLink('/files/a.pdf', 'next', 'v2.x', versions, [ 'de' ]);   // '/files/a.pdf'
 * ```
 *
 * @since 3.0.0
 */

export function versionLink(href: string, version: string, latest: string, versions: Array<string>, locales: Array<string>): string {
    if (!href.startsWith('/') || href.startsWith('//')) return href;

    const pathname = href.replace(/[?#].*$/, '');
    const segments = pathname.split('/');
    const index = versions.includes(segments[1]) || !locales.includes(segments[1]) ? 1 : 2;
    const prefix = segments.slice(0, index).join('/');

    if (segments[index] === latest) {
        const rest = href.slice(prefix.length + latest.length + 1);

        return `${ prefix }${ rest.startsWith('/') ? '' : '/' }${ rest }`;
    }

    if (!version || versions.includes(segments[index]) || /\.(?!(md|html)$)[^./]+$/.test(pathname)) return href;

    return `${ prefix }/${ version }${ href.slice(prefix.length) }`;
}

/**
 * Moves the absolute links of every page into the version of that page.
 *
 * @remarks
 * Every version except the latest one publishes its pages under its own name,
 * so a link such as `/guide` in one of its pages would point at the latest version instead.
 * A markdown-it core rule reads the version from the published path of the page,
 * and passes every link of the page through {@link versionLink}.
 * The rule also points a link that names the latest version at the root, where that version is served,
 * so a link such as `/v2.x/release` keeps working while v2.x is the latest one.
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
    const { latest, versionsList, localesMap } = state;
    const locales = Object.keys(localesMap).filter(key => localesMap[key] !== 'root').map(key => key.replace(/^\/+|\/+$/g, ''));
    const { config, ...markdown } = state.vitepressConfig.markdown ?? {};

    state.vitepressConfig.markdown = {
        ...markdown,
        async config(md: MarkdownRenderer): Promise<void> {
            md.core.ruler.push('viteplus_version_links', ({ env, tokens }) => {
                const page: string = env?.relativePath ?? '';
                const version = resolve(page).split('/').slice(0, 2).find(segment => versionsList.includes(segment)) ?? '';

                for (const token of tokens.flatMap(block => block.children ?? [])) {
                    const href = token.type === 'link_open' && token.attrGet('href');
                    if (href) token.attrSet('href', versionLink(href, version, latest, versionsList, locales));
                }
            });

            await config?.(md);
        }
    };
}
