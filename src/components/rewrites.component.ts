/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { RouteResolverType } from '@interfaces/function.interface';

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
 * Creates the resolver that maps a documentation source path to its published route.
 *
 * @returns A resolver that takes a source path and returns its rewritten route {@link RouteResolverType}
 *
 * @remarks
 * A path under a folder of {@link StateModel.versionDirs} belongs to that version.
 * The resolver drops the folder, takes a leading locale folder off the rest,
 * and hands both to the `rewritesHook` of `versionsConfig`, which decides the final segment order.
 * Every other path stays untouched.
 *
 * @example
 * ```ts
 * const resolve = createRouteResolver();
 * resolve('src/guide/index.md');            // 'next/guide/index.md'
 * resolve('archive/v1.0.x/de/index.md');    // 'de/v1.0.x/index.md'
 * resolve('public/logo.png');               // 'public/logo.png'
 * ```
 *
 * @see parseRoutesComponent
 * @since 2.1.0
 */

export function createRouteResolver(): RouteResolverType {
    const state = inject(StateModel);
    const { localesMap, versionsConfig } = state;
    const localesList = Object.keys(localesMap);
    const folders = Object.entries(state.versionDirs);

    return function (id: string): string {
        const match = folders.find(([ , folder ]) => id.startsWith(`${ folder }/`));
        if (!match) return id;

        const [ version, folder ] = match;
        const path = id.slice(folder.length + 1);
        const localeKey = localesList.find(prefix => path.startsWith(`${ prefix }/`));
        if (!localeKey) return versionsConfig.hooks.rewritesHook(path, version, '');

        const locale = localesMap[localeKey] === 'root' ? '' : localeKey;

        return versionsConfig.hooks.rewritesHook(path.slice(localeKey.length + 1), version, locale);
    };
}

/**
 * Collects the routes that every version publishes, keyed by version name.
 *
 * @param resolve - The resolver that turns a source path into its published route
 * @returns A record mapping each version name to the routes that version publishes
 *
 * @remarks
 * Every version is read from its folder in {@link StateModel.versionDirs},
 * and every file runs through the same resolver that builds `vitepressConfig.rewrites`,
 * so a route in this record always matches the URL VitePress serves.
 * The version switcher checks this record before it links to a page in another version.
 *
 * @example
 * ```ts
 * parseVersionRoutes(createRouteResolver());
 * // { 'v2.0.x': [ 'v2.0.x/index.md' ], 'v1.0.x': [ 'v1.0.x/index.md', 'v1.0.x/release.md' ] }
 * ```
 *
 * @see createRouteResolver
 * @see getAllMarkdownFilesRelative
 *
 * @since 2.1.0
 */

export function parseVersionRoutes(resolve: RouteResolverType): Record<string, Array<string>> {
    const { root, versionDirs } = inject(StateModel);

    const routes = (folder: string): Array<string> =>
        getAllMarkdownFilesRelative(joinPath(root, folder)).map(file => resolve(join(folder, file)));

    return Object.fromEntries(Object.entries(versionDirs).map(([ version, folder ]) => [ version, routes(folder) ]));
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
