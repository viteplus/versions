/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { HeadConfig, SiteConfig } from 'vitepress';

/**
 * Imports
 */

import { join } from 'path';
import { copyFileSync, existsSync } from 'fs';
import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';

/**
 * Builds the script that moves an address without a version to the latest version, without reloading the page.
 *
 * @param base - The base path of the site, with a leading and a trailing slash
 * @param latest - The name of the latest version
 * @param versions - The names of every published version
 * @param locales - The URL prefixes of the non-root locales, without their slashes
 * @returns The source of a script that rewrites the address when the path names no version
 *
 * @remarks
 * The version sits in the first segment after the base, or in the second one when a locale leads the path.
 * When that segment names no version, the script inserts `latest` there with `history.replaceState`,
 * keeping the query string and the hash, and dispatches `popstate`.
 * On a built site the script runs before the app starts, so the router starts on the rewritten address.
 * On the dev server the app already runs, and the router answers the event.
 * A path that already names a version is left alone, even when the page is missing.
 *
 * Every value is written as JSON with `<` escaped, so the script can sit in a `<script>` tag without closing it.
 *
 * @example
 * ```ts
 * const script = latestScript('/docs/', 'v2.0.x', [ 'v2.0.x', 'v1.0.x' ], [ 'de' ]);
 * // '/docs/'             -> '/docs/v2.0.x/'
 * // '/docs/de/guide/'    -> '/docs/de/v2.0.x/guide/'
 * // '/docs/v1.0.x/'      -> unchanged
 * ```
 *
 * @see https://github.com/viteplus/versions/issues/55
 * @since 3.0.0
 */

export function latestScript(base: string, latest: string, versions: Array<string>, locales: Array<string>): string {
    const json = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');

    return `var b=${ json(base) },p=location.pathname;` +
        `if(p.indexOf(b)===0){var s=p.slice(b.length).split('/'),i=${ json(locales) }.indexOf(s[0])<0?0:1;` +
        `if(${ json(versions) }.indexOf(s[i])<0){if(s.length===i)s.push('');s.splice(i,0,${ json(latest) });` +
        'history.replaceState(history.state||{},\'\',b+s.join(\'/\')+location.search+location.hash);' +
        'dispatchEvent(new PopStateEvent(\'popstate\',{state:history.state}))}}';
}

/**
 * Opens the latest version at the root of the site, with its versioned address in the address bar.
 *
 * @remarks
 * Every version publishes its pages under its own name, so the root holds no page of its own.
 * When the build ends, the home page of {@link StateModel.latest} is copied to the root of the site
 * and to the root of every locale, without replacing a file that is already there,
 * so any static server answers `/`.
 * The script from {@link latestScript} in the head of every page then moves the address to `/v2.0.x/`,
 * the page that the copy holds, so the app starts on it without a reload.
 * On a host that answers a missing page with `404.html`, the script moves `/guide/` to `/v2.0.x/guide/` the same way.
 *
 * The `head` entries and the `buildEnd` hook of the user configuration are kept, and that hook runs last.
 *
 * @example
 * ```ts
 * parseLatestEntry();
 * // after the build, opening / shows /v2.0.x/ in the address bar
 * ```
 *
 * @see latestScript
 * @see https://github.com/viteplus/versions/issues/55
 *
 * @since 3.0.0
 */

export function parseLatestEntry(): void {
    const state = inject(StateModel);
    const { latest, versionsList, localesMap } = state;
    const { buildEnd, head = [], base = '' } = state.vitepressConfig;
    const locales = Object.keys(localesMap).filter(key => localesMap[key] !== 'root').map(key => key.replace(/^\/+|\/+$/g, ''));
    const script: HeadConfig = [ 'script', {}, latestScript(`/${ base }/`.replace(/\/+/g, '/'), latest, versionsList, locales) ];

    state.vitepressConfig.head = [ ...head, script ];
    state.vitepressConfig.buildEnd = async (siteConfig: SiteConfig): Promise<void> => {
        for (const locale of [ '', ...locales ]) {
            const home = join(siteConfig.outDir, locale, latest, 'index.html');
            const root = join(siteConfig.outDir, locale, 'index.html');
            if (existsSync(home) && !existsSync(root)) copyFileSync(home, root);
        }

        await buildEnd?.(siteConfig);
    };
}
