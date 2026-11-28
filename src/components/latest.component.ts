/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { SiteConfig } from 'vitepress';

/**
 * Imports
 */

import { join } from 'path';
import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';
import { readFileSync, writeFileSync } from 'fs';

/**
 * The data that {@link openLatestPage} reads in the browser.
 *
 * @since 3.1.0
 */

export interface LatestPageDataInterface {
    /**
     * The site base, with a slash at both ends, such as `/docs/`.
     *
     * @since 3.1.0
     */

    base: string;

    /**
     * The name of the stable version, see {@link StateModel.latest}.
     *
     * @since 3.1.0
     */

    latest: string;

    /**
     * Whether the site serves pages without `.html`.
     *
     * @since 3.1.0
     */

    cleanUrls: boolean;

    /**
     * The URL prefixes of every locale other than the root one.
     *
     * @since 3.1.0
     */

    locales: Array<string>;

    /**
     * The names of every published version.
     *
     * @since 3.1.0
     */

    versions: Array<string>;

    /**
     * The routes that the latest version publishes, such as `de/v2.x/guide.md`.
     *
     * @since 3.1.0
     */

    routes: Array<string>;

    /**
     * Whether to open the page with a new request, set on `404.html`.
     *
     * @remarks
     * On the first load of a built site VitePress keeps the markup it was served with and loads only the lean chunk of
     * the page, without its content. `404.html` holds the not-found markup, so changing its address in place would
     * show the page with an empty body.
     *
     * @since 3.1.1
     */

    reload: boolean;
}

/**
 * Moves an address that names no version onto the same page of the latest version, before the app starts.
 *
 * @param data - The site data the move needs, see {@link LatestPageDataInterface}
 *
 * @remarks
 * Runs in the browser, inlined into a page by {@link latestScript}, so it reads `location` and changes the address
 * with `history.replaceState`, which VitePress's router then reads on its first load.
 * With {@link LatestPageDataInterface.reload | reload} set, it hides the page and opens the address with
 * `location.replace` instead, so the not-found page never shows.
 * `/guide`, `/guide/` and `/guide.html` become the address of `guide.md` or `guide/index.md` in the latest version,
 * and `/de/guide` its German page. The query and the hash are kept.
 * An address that already names a version, lies outside the base, or has no page in the latest version stays as it is,
 * so it still shows the not-found page.
 *
 * It keeps to one function body with no named helpers, since it is inlined from its source text.
 *
 * @example
 * ```ts
 * // at /docs/guide?a#b, where v2.x publishes v2.x/guide/index.md
 * openLatestPage({ base: '/docs/', latest: 'v2.x', cleanUrls: false, locales: [], versions, routes, reload: false });
 * location.href; // .../docs/v2.x/guide/?a#b
 * ```
 *
 * @see https://github.com/viteplus/versions/issues/61
 * @since 3.1.0
 */

export function openLatestPage(data: LatestPageDataInterface): void {
    const pathname = location.pathname === data.base.slice(0, -1) ? data.base : location.pathname;
    if (pathname.indexOf(data.base) !== 0) return;

    const segments = decodeURI(pathname.slice(data.base.length)).split('/');
    const locale = data.locales.indexOf(segments[0]) > -1 ? `${ segments.shift() }/` : '';
    if (data.versions.indexOf(segments[0]) > -1) return;

    const page = segments.join('/').replace(/\.html$/, '').replace(/\/$/, '').replace(/(^|\/)index$/, '');
    const prefix = `${ locale }${ data.latest }/`;
    const candidates = page ? [ `${ prefix }${ page }.md`, `${ prefix }${ page }/index.md` ] : [ `${ prefix }index.md` ];
    const route = candidates.find(candidate => data.routes.indexOf(candidate) > -1);
    if (!route) return;

    const path = route.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, data.cleanUrls ? '' : '.html');
    const url = `${ encodeURI(data.base + path) }${ location.search }${ location.hash }`;
    if (!data.reload) return history.replaceState(history.state, '', url);

    document.documentElement.style.visibility = 'hidden';
    location.replace(url);
}

/**
 * Builds the inline script that runs {@link openLatestPage} with the data of this site.
 *
 * @param reload - Whether the script opens the page with a new request, see {@link LatestPageDataInterface.reload}
 * @returns A `<script>` tag to place at the start of `<head>`
 *
 * @remarks
 * Only the routes of the latest version ride along, since no other version is a target.
 * Every `<` in the data is escaped, so a route can never close the script tag.
 *
 * @example
 * ```ts
 * latestScript();
 * // '<script>(function openLatestPage(data) { ... })({"base":"/docs/","latest":"v2.x",...})</script>'
 * ```
 *
 * @since 3.1.0
 */

export function latestScript(reload: boolean = false): string {
    const { latest, localeSegments, versionsList, routesMap, vitepressConfig } = inject(StateModel);
    const { base = '/', cleanUrls = false } = vitepressConfig;
    const trimmed = base.replace(/^\/+|\/+$/g, '');
    const data: LatestPageDataInterface = {
        base: trimmed ? `/${ trimmed }/` : '/',
        latest,
        cleanUrls,
        locales: localeSegments,
        versions: versionsList,
        routes: routesMap[latest] ?? [],
        reload
    };

    const json = JSON.stringify(data).replace(/</g, '\\u003c');

    return `<script>(${ openLatestPage.toString() })(${ json })</script>`;
}

/**
 * Opens the latest version at every address that names no version, without a second copy of its pages.
 *
 * @remarks
 * - The root of the site and of every locale serves the home page of {@link StateModel.latest},
 *   copied there when the build ends unless a page is already there.
 * - Any other address that names no version, such as `/guide`, has no page on disk, so the host serves `404.html`.
 *
 * Both pages carry the script from {@link latestScript}, which moves the address to the same page of the latest version
 * before the app starts, and only the root home page is copied. `404.html` opens it with a new request,
 * see {@link LatestPageDataInterface.reload}.
 * The dev server adds the script to every page it serves, where it does nothing at an address that names a version.
 * The `vite` plugins and the `buildEnd` hook of the user configuration are kept, and that hook runs last.
 *
 * @example
 * ```ts
 * parseLatestEntry();
 * // opening / shows the home page of v2.0.x, with /v2.0.x/ in the address bar
 * // opening /guide shows the guide of v2.0.x, with /v2.0.x/guide.html in the address bar
 * ```
 *
 * @see https://github.com/viteplus/versions/issues/55
 * @see https://github.com/viteplus/versions/issues/61
 *
 * @since 3.0.0
 */

export function parseLatestEntry(): void {
    const { latest, localeSegments, vitepressConfig } = inject(StateModel);
    const { buildEnd, vite = {} } = vitepressConfig;
    const script = latestScript();
    const withScript = (html: string, tag: string = script): string => html.replace('<head>', `<head>${ tag }`);

    const plugin = {
        name: 'viteplus-versions:latest',
        transformIndexHtml: (html: string): string => withScript(html)
    };

    vitepressConfig.vite = { ...vite, plugins: [ ...vite.plugins ?? [], plugin ] };

    vitepressConfig.buildEnd = async (siteConfig: SiteConfig): Promise<void> => {
        const write = (from: string, to: string, flag: 'w' | 'wx', tag?: string): void => {
            try {
                // 'wx' fails when a page already sits at the root, in one step and without a race
                writeFileSync(to, withScript(readFileSync(from, 'utf8'), tag), { flag });
            } catch (error) {
                if (![ 'ENOENT', 'EEXIST' ].includes(<string> (<NodeJS.ErrnoException> error).code)) throw error;
            }
        };

        for (const locale of [ '', ...localeSegments ]) {
            write(join(siteConfig.outDir, locale, latest, 'index.html'), join(siteConfig.outDir, locale, 'index.html'), 'wx');
        }

        const notFound = join(siteConfig.outDir, '404.html');
        write(notFound, notFound, 'w', latestScript(true));

        await buildEnd?.(siteConfig);
    };
}
