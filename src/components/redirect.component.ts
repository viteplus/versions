/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { HeadConfig } from 'vitepress';

/**
 * Imports
 */

import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';

/**
 * Builds the pattern that matches a path naming the current version.
 *
 * @param base - The base path of the site, with a leading and a trailing slash
 * @param current - The label of the version that the site serves at its root
 * @param locales - The URL prefixes of the non-root locales, without their slashes
 * @returns A pattern whose first group is the part of the path to keep in front of the version
 *
 * @remarks
 * The version segment is matched right after the base, or after a locale when one leads the path,
 * which is where the default `rewritesHook` puts it.
 * Replacing a match with `$1` gives the unversioned path.
 *
 * Every `/` is escaped, so the pattern can sit in a `<script>` tag without closing it.
 *
 * @example
 * ```ts
 * const pattern = currentVersionPattern('/docs/', 'v2.0.x', [ 'de' ]);
 * '/docs/de/v2.0.x/guide/'.replace(pattern, '$1'); // '/docs/de/guide/'
 * ```
 *
 * @see https://github.com/viteplus/versions/issues/43
 * @since 2.2.0
 */

export function currentVersionPattern(base: string, current: string, locales: Array<string>): RegExp {
    const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    const locale = locales.length ? `(?:(?:${ locales.map(escape).join('|') })\\/)?` : '';

    return new RegExp(`^(${ escape(base) }${ locale })${ escape(current) }(?:\\/|$)`);
}

/**
 * Adds the current version redirect to the head of every page.
 *
 * @remarks
 * The site serves the current version at its root, so `/v2.0.x/guide/` names no page.
 * A one-line script replaces the location with `/guide/`, keeping the query string and the hash,
 * and does nothing on any other path.
 * A built site renders it into every page, so it runs on the `404.html` that the host answers with,
 * and the dev server adds it in the browser, so it runs there too.
 * Once `v2.0.x` is archived, the archive serves the path itself and the script no longer matches it.
 *
 * Nothing is added when an archived version carries the same label as the current one,
 * since every path under that label is then a real archived page.
 * The `head` entries of the user configuration come first and are kept.
 *
 * @example
 * ```ts
 * parseCurrentVersionRedirect();
 * state.vitepressConfig.head; // [ ...userHead, [ 'script', {}, 'var p=location.pathname.replace(...' ] ]
 * ```
 *
 * @see currentVersionPattern
 * @since 2.2.0
 */

export function parseCurrentVersionRedirect(): void {
    const state = inject(StateModel);
    const { current } = state.versionsConfig;
    if (!current || state.versionsList.includes(current)) return;

    const base = `/${ state.vitepressConfig.base ?? '' }/`.replace(/\/+/g, '/');
    const locales = Object.entries(state.localesMap)
        .filter(([ , key ]) => key !== 'root')
        .map(([ prefix ]) => prefix.replace(/^\/+|\/+$/g, ''));

    const pattern = currentVersionPattern(base, current, locales);
    const script: HeadConfig = [
        'script', {},
        `var p=location.pathname.replace(${ pattern },'$1');` +
        'p!==location.pathname&&location.replace(p+location.search+location.hash)'
    ];

    state.vitepressConfig.head = [ ...state.vitepressConfig.head ?? [], script ];
}
