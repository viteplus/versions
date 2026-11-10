/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Ref } from 'vue';
import type { Router, SiteData } from 'vitepress';
import type { VersioningPluginInterface } from './version-switcher.component';

/**
 * The parts of a route, see {@link splitRoute}.
 *
 * @since 3.0.0
 */

export interface RoutePartsInterface {
    /**
     * The locale prefix, empty for the root locale.
     *
     * @since 3.0.0
     */

    locale: string;

    /**
     * The version name, empty when the route names none.
     *
     * @since 3.0.0
     */

    version: string;

    /**
     * The page inside the locale and version, without `.md` and without a trailing `index`.
     *
     * @since 3.0.0
     */

    page: string;
}

/**
 * Turns the path of an address into the route of the page it names.
 *
 * @param pathname - The path of the address, without the site base, query, or hash
 * @returns The route in the form of {@link VersioningPluginInterface.routes}, such as `de/v1.x/guide.md`
 *
 * @remarks
 * A folder address names its `index.md`, and `.html` is read as `.md`, so clean and plain URLs give the same route.
 *
 * @example
 * ```ts
 * pathToRoute('/de/v1.x/');           // 'de/v1.x/index.md'
 * pathToRoute('/v1.x/guide.html');    // 'v1.x/guide.md'
 * pathToRoute('/v1.x/guide');         // 'v1.x/guide.md'
 * ```
 *
 * @since 3.0.0
 */

export function pathToRoute(pathname: string): string {
    const path = decodeURI(pathname).replace(/^\/+/, '');
    if (!path || path.endsWith('/')) return `${ path }index.md`;

    return `${ path.replace(/\.html$/, '') }.md`;
}

/**
 * Turns a route back into the path of its address.
 *
 * @param route - A route such as `de/v1.x/index.md`
 * @param cleanUrls - Whether the site serves pages without `.html`
 * @returns The path of the address, starting with a slash and without the site base
 *
 * @example
 * ```ts
 * routeToPath('de/v1.x/index.md', false); // '/de/v1.x/'
 * routeToPath('v1.x/guide.md', false);    // '/v1.x/guide.html'
 * routeToPath('v1.x/guide.md', true);     // '/v1.x/guide'
 * ```
 *
 * @since 3.0.0
 */

export function routeToPath(route: string, cleanUrls: boolean): string {
    return `/${ route.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, cleanUrls ? '' : '.html') }`;
}

/**
 * Splits a route into its locale, its version, and the page inside them.
 *
 * @param route - A route such as `de/v1.x/guide.md`
 * @param versioning - The versioning data that names the versions and the locale prefixes
 * @returns The parts of the route, with an empty `locale` for the root locale and an empty `version` when it names none
 *
 * @remarks
 * The page is written without `.md` and without a trailing `index`, so `guide.md` and `guide/index.md`,
 * which VitePress serves for the same address, give the same page.
 *
 * @example
 * ```ts
 * splitRoute('de/v1.x/guide/index.md', versioning); // { locale: 'de', version: 'v1.x', page: 'guide' }
 * splitRoute('v1.x/index.md', versioning);          // { locale: '', version: 'v1.x', page: '' }
 * ```
 *
 * @since 3.0.0
 */

export function splitRoute(route: string, versioning: VersioningPluginInterface): RoutePartsInterface {
    const segments = route.split('/');
    const locale = segments.length > 1 && (versioning.locales ?? []).includes(segments[0]) ? segments.shift()! : '';
    const version = versioning.versions.includes(segments[0]) ? segments.shift()! : '';
    const page = segments.join('/').replace(/(^|\/)index\.md$/, '').replace(/\.md$/, '');

    return { locale, version, page };
}

/**
 * Finds the page to open when the reader switches version or language onto a page that does not exist there.
 *
 * @param from - The route of the page the reader is on
 * @param to - The route the reader asked for
 * @param versioning - The versioning data that the plugin publishes in `themeConfig.versioning`
 * @returns The route to open instead, or `undefined` to let the navigation through
 *
 * @remarks
 * Only a switch is caught: `to` has to be the page of `from` with another version, another locale, or both.
 * Any other address that no version publishes, typed or linked, keeps its not-found page.
 *
 * - Switching version opens the home page of the new version in the locale, then in the root locale.
 * - Switching language opens the home page of the version in the new language,
 *   then the home page of the {@link VersioningPluginInterface.latestVersion | latest} version in it.
 *
 * When none of them exists either, the navigation goes through and shows the not-found page.
 *
 * @example
 * ```ts
 * // de has no guide in v2.x, and no pages at all in v1.x
 * resolveSwitchRoute('v2.x/guide.md', 'de/v2.x/guide.md', versioning); // 'de/v2.x/index.md'
 * resolveSwitchRoute('v1.x/hooks.md', 'de/v1.x/hooks.md', versioning); // 'de/v2.x/index.md'
 * resolveSwitchRoute('v2.x/guide.md', 'v2.x/missing.md', versioning);  // undefined, not a switch
 * ```
 *
 * @since 3.0.0
 */

export function resolveSwitchRoute(from: string, to: string, versioning: VersioningPluginInterface): string | undefined {
    const published = new Set(Object.values(versioning.routes ?? {}).flat());
    const find = (candidate: string): string | undefined =>
        [ candidate, candidate.replace(/\.md$/, '/index.md') ].find(form => published.has(form));

    if (find(to)) return;

    const source = splitRoute(from, versioning);
    const target = splitRoute(to, versioning);
    if (!target.version || source.page !== target.page) return;
    if (source.locale === target.locale && source.version === target.version) return;

    const home = (...parts: Array<string>): string => [ ...parts.filter(Boolean), 'index.md' ].join('/');
    const candidates = source.locale === target.locale
        ? [ home(target.locale, target.version), home(target.version) ]
        : [ home(target.locale, target.version), home(target.locale, versioning.latestVersion) ];

    for (const candidate of candidates) {
        const found = find(candidate);
        if (found) return found;
    }
}

/**
 * Catches a switch of version or language onto a page that does not exist there, and opens the nearest page instead.
 *
 * @param router - The VitePress router, from the `enhanceApp` context
 * @param siteData - The site data, from the `enhanceApp` context
 *
 * @remarks
 * The version switcher already links to a page that exists, but VitePress's language menu links every page
 * to the same page in each language, translated or not. The fallback hooks into `router.onBeforeRouteChange`,
 * after any hook that the theme set before it, and hands such a switch to {@link resolveSwitchRoute},
 * keeping the query and the hash. Every other navigation, the first load included, goes through untouched,
 * so an address that does not exist still shows the not-found page.
 *
 * @example
 * ```ts
 * // .vitepress/theme/index.ts
 * import { installVersionFallback } from '@viteplus/versions/fallback';
 *
 * export default {
 *     extends: DefaultTheme,
 *     enhanceApp({ app, router, siteData }) {
 *         app.component('VersionSwitcher', VersionSwitcher);
 *         installVersionFallback(router, siteData);
 *     }
 * };
 * ```
 *
 * @see resolveSwitchRoute
 * @since 3.0.0
 */

export function installVersionFallback(router: Router, siteData: Ref<SiteData>): void {
    const previous = router.onBeforeRouteChange;

    router.onBeforeRouteChange = async (to: string): Promise<void | boolean> => {
        if (await previous?.(to) === false) return false;

        const { base, cleanUrls, themeConfig } = siteData.value;
        const versioning: VersioningPluginInterface | undefined = themeConfig?.versioning;
        const from = router.route.data?.relativePath;
        if (typeof window === 'undefined' || !versioning || !from) return;

        const url = new URL(to, window.location.href);
        if (!url.pathname.startsWith(base)) return;

        const target = resolveSwitchRoute(from, pathToRoute(url.pathname.slice(base.length)), versioning);
        if (!target) return;

        await router.go(`${ base.replace(/\/$/, '') }${ routeToPath(target, !!cleanUrls) }${ url.search }${ url.hash }`);

        return false;
    };
}
