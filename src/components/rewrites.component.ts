/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { RouteResolverType } from '@interfaces/function.interface';
import type { PathSegmentsInterface } from '@components/interfaces/sidebar-component.interface';

/**
 * imports
 */

import { join } from 'path/posix';
import { join as joinPath } from 'path';
import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';
import { getAllMarkdownFilesRelative } from '@components/object.component';

/**
 * Rewrites a documentation source path using version and locale.
 *
 * @remarks
 * This implementation joins the `version`, `locale`, and original `source`
 * into a normalized POSIX-style path. It is commonly used to generate
 * consistent URLs or filesystem paths for versioned and localized docs.
 *
 * @param source - The original file path or content identifier.
 * @param version - The version string of the documentation (e.g., `"1.2.0"`).
 * @param locale - The locale code (e.g., `"en"`, `"de"`).
 *
 * @returns The rewritten path string in the format `version/locale/source`.
 *
 * @example
 * ```ts
 * rewritesHook("guide/intro.md", "v2.0.0", "en");
 * // → "en/v2.0.0/guide/intro.md"
 * ```
 *
 * @since 2.0.0
 */

export function rewritesHook(source: string, version: string, locale: string): string {
    return join(locale, version, source);
}

/**
 * Extracts locale and version information from URL path segments.
 *
 * @param segments - Array of URL path segments to parse (will be modified by shifting elements).
 * @param localesList - List of valid locale identifiers for matching.
 * @param versionsList - List of valid version identifiers for matching.
 * @returns An object containing extracted language and version {@link PathSegmentsInterface}.
 *
 * @remarks
 * This function parses URL path segments to identify and extract locale and version
 * information, supporting both version-first and locale-first URL structures. The
 * function operates on the segment array destructively, removing matched elements
 * via {@link Array.shift}.
 *
 * **Parsing logic**:
 * 1. If the first segment matches a version → extract it as `version`.
 * 2. If the first segment matches a locale → extract it as `lang`.
 * 3. Return both extracted values (empty strings if not found).
 *
 * **URL patterns supported**:
 * - `/v2.0/guide/` → `{ lang: '', version: 'v2.0' }`
 * - `/fr/v2.0/guide/` → `{ lang: 'fr', version: 'v2.0' }`
 * - `/fr/guide/` → `{ lang: 'fr', version: '' }`
 * - `/guide/` → `{ lang: '', version: '' }`
 *
 * The segment array is mutated during extraction, with matched segments removed
 * from the beginning. This allows the following processing to work with the remaining
 * path components.
 *
 * @example
 * ```ts
 * const localesList = ['en', 'fr', 'de'];
 * const versionsList = ['v1.0', 'v2.0', 'latest'];
 *
 * // Version-first pattern
 * const segments1 = ['v2.0', 'guide', 'intro'];
 * const result1 = extractLocale(segments1, localesList, versionsList);
 * console.log(result1); // { lang: '', version: 'v2.0' }
 * console.log(segments1); // ['guide', 'intro']
 *
 * // Locale-first pattern
 * const segments2 = ['fr', 'v2.0', 'api', 'reference'];
 * const result2 = extractLocale(segments2, localesList, versionsList);
 * console.log(result2); // { lang: 'fr', version: 'v2.0' }
 * console.log(segments2); // ['api', 'reference']
 *
 * // No locale or version
 * const segments3 = ['docs', 'getting-started'];
 * const result3 = extractLocale(segments3, localesList, versionsList);
 * console.log(result3); // { lang: '', version: '' }
 * console.log(segments3); // ['docs', 'getting-started']
 *
 * // Use case: URL parsing for routing
 * const url = '/de/latest/guide/installation';
 * const segments = url.split('/').filter(Boolean);
 * const { lang, version } = extractLocale(
 *   segments,
 *   ['en', 'de', 'fr'],
 *   ['latest', 'v1', 'v2']
 * );
 * const route = segments.join('/');
 * console.log({ lang, version, route });
 * // { lang: 'de', version: 'latest', route: 'guide/installation' }
 * ```
 *
 * @see PathSegmentsInterface
 * @since 2.0.5
 */

export function extractLocale(segments: Array<string>, localesList: Array<string>, versionsList: Array<string>): PathSegmentsInterface {
    const version = versionsList.includes(segments[0]) ? segments.shift()! : '';
    const lang = localesList.includes(segments[0]) ? segments.shift()! : '';

    return { lang, version };
}

/**
 * Creates the resolver that maps a documentation source path to its published route.
 *
 * @returns A resolver that takes a source path and returns its rewritten route {@link RouteResolverType}
 *
 * @remarks
 * The resolver recognizes two prefixes and leaves every other path untouched.
 * A path under {@link StateModel.sources} belongs to the current version,
 * so it loses the prefix and keeps only its locale.
 * A path under {@link StateModel.archive} belongs to an archived version,
 * so {@link extractLocale} pulls the version and locale out of its leading segments.
 * Both cases hand the remaining source path to the `rewritesHook` of `versionsConfig`,
 * which decides the final segment order.
 *
 * The resolver reads the locale and version lists once and closes over them,
 * so it stays correct for every call without rescanning the state.
 *
 * @example
 * ```ts
 * const resolve = createRouteResolver();
 * resolve('src/guide/index.md');            // 'guide/index.md'
 * resolve('archive/v1.0.x/guide/index.md'); // 'v1.0.x/guide/index.md'
 * resolve('public/logo.png');               // 'public/logo.png'
 * ```
 *
 * @see extractLocale
 * @see parseRoutesComponent
 *
 * @since 2.1.0
 */

export function createRouteResolver(): RouteResolverType {
    const state = inject(StateModel);
    const localesList = Object.keys(state.localesMap);
    const versionsList = state.versionsList;
    const sourcesPrefix = `${ state.sources }/`;
    const archivePrefix = `${ state.archive }/`;

    return function (id: string): string {
        // Handle sources files
        if (id.startsWith(sourcesPrefix)) {
            const path = id.slice(sourcesPrefix.length);
            const localeKey = localesList.find(prefix => path.startsWith(prefix + '/'));

            if (localeKey) {
                const locale = state.localesMap[localeKey] === 'root' ? '' : localeKey;
                const filePath = path.slice(localeKey.length + 1);

                return state.versionsConfig.hooks.rewritesHook(filePath, '', locale);
            }

            return path;
        }

        // Handle archive files
        if (id.startsWith(archivePrefix)) {
            const path = id.slice(archivePrefix.length);
            const segments = path.split('/');
            const { lang, version } = extractLocale(segments, localesList, versionsList);
            const source = segments.join('/');

            return state.versionsConfig.hooks.rewritesHook(
                source, version, state.localesMap[lang] === 'root' ? '' : lang
            );
        }

        return id;
    };
}

/**
 * Collects the routes that every version publishes, keyed by version label.
 *
 * @param resolve - The resolver that turns a source path into its published route
 * @returns A record mapping each version label to the routes that version publishes
 *
 * @remarks
 * The current version is read from {@link StateModel.sourcesPath} and keyed by `versionsConfig.current`,
 * and each archived version is read from its own folder under {@link StateModel.archivePath}.
 * Every file runs through the same resolver that builds `vitepressConfig.rewrites`,
 * so a route in this record always matches the URL VitePress serves.
 *
 * The version switcher uses this record to tell whether the page a reader is on also exists
 * in the version they picked, and falls back to that version's home page when it does not.
 *
 * @example
 * ```ts
 * parseVersionRoutes(createRouteResolver());
 * // {
 * //   'v2.0.x': [ 'index.md', 'release.md', 'guide/index.md' ],
 * //   'v1.0.x': [ 'v1.0.x/index.md', 'v1.0.x/release.md' ]
 * // }
 * ```
 *
 * @see createRouteResolver
 * @see getAllMarkdownFilesRelative
 *
 * @since 2.1.0
 */

export function parseVersionRoutes(resolve: RouteResolverType): Record<string, Array<string>> {
    const state = inject(StateModel);
    const routes: Record<string, Array<string>> = {};

    routes[state.versionsConfig.current] = getAllMarkdownFilesRelative(state.sourcesPath)
        .map(file => resolve(join(state.sources, file)));

    for (const version of state.versionsList) {
        routes[version] = getAllMarkdownFilesRelative(joinPath(state.archivePath, version))
            .map(file => resolve(join(state.archive, version, file)));
    }

    return routes;
}

/**
 * Wires route rewriting into the VitePress configuration and records the routes of every version.
 *
 * @remarks
 * Assigns `vitepressConfig.rewrites` the resolver from {@link createRouteResolver},
 * which VitePress calls once per source file while it builds the site.
 * Fills {@link StateModel.routesMap} with the output of {@link parseVersionRoutes},
 * so the version switcher can check a route before it links to it.
 *
 * @example
 * ```ts
 * parseRoutesComponent();
 * state.vitepressConfig.rewrites('archive/v1.0.x/guide/index.md'); // 'v1.0.x/guide/index.md'
 * state.routesMap['v1.0.x'];                                       // [ 'v1.0.x/guide/index.md', ... ]
 * ```
 *
 * @see createRouteResolver
 * @see parseVersionRoutes
 *
 * @since 2.0.0
 */

export function parseRoutesComponent(): void {
    const state = inject(StateModel);
    const resolve = createRouteResolver();

    state.vitepressConfig.rewrites = resolve;
    Object.assign(state.routesMap, parseVersionRoutes(resolve));
}
