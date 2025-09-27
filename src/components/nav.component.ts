/**
 * Import will remove at compile time
 */

import type { NavItemType, NavItemWithChildrenType } from '@interfaces/nav.interface';
import type { NavItemWithLinkType, NavObjectType, NavType } from '@interfaces/nav.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';
import { versionSwitcher } from '@components/switcher.component';

/**
 * Type guard to check if a navigation item has children.
 *
 * @param item - The navigation item to test.
 * @returns `true` if the item is a {@link NavItemWithChildrenType}, `false` otherwise.
 *
 * @remarks
 * - This function checks for the presence of an `item` property that is an array.
 * - Use this type guard to safely access child navigation items when iterating
 *   or transforming navigation trees.
 *
 * @example
 * ```ts
 * const item: NavItemType = { text: "Docs", items: [{ text: "Guide", link: "/guide/" }] };
 * if (isNavItemWithChildren(item)) {
 *   console.log(item.items); // Safe to access
 * }
 * ```
 *
 * @since 2.0.0
 */

export function isNavItemWithChildren(item: NavItemType): item is NavItemWithChildrenType {
    return 'items' in item && Array.isArray(item.items);
}

/**
 * Type guard to check if a navigation item has a link.
 *
 * @param item - The navigation item to test.
 * @returns `true` if the item is a {@link NavItemWithLinkType}, `false` otherwise.
 *
 * @remarks
 * - This function checks for the presence of a `link` property.
 * - Use this type guard to safely access the `link` property when iterating
 *   or transforming navigation trees.
 *
 * @example
 * ```ts
 * const item: NavItemType = { text: "Home", link: "/" };
 * if (isNavItemWithLink(item)) {
 *   console.log(item.link); // Safe to access
 * }
 * ```
 *
 * @since 2.0.0
 */

export function isNavItemWithLink(item: NavItemType): item is NavItemWithLinkType {
    return 'link' in item && !!item.link;
}

/**
 * Recursively prepends a version prefix to navigation item links.
 *
 * @param version - The version string to prefix (e.g., `"v2.0.0"`).
 * @param item - The navigation item to process, which can be a link, a group with children, or a component.
 * @returns A new navigation item with updated `link` values where applicable.
 *
 * @remarks
 * - For {@link NavItemWithLinkType}, prepends the given `version` to the `link`
 *   unless `skipVersioning` is `true`.
 * - For {@link NavItemWithChildrenType}, recursively traverses all children and applies
 *   the same transformation.
 * - Component-based navigation items ({@link NavItemComponentType}) are returned as-is.
 * - Preserves other properties of the navigation items.
 *
 * @example
 * ```ts
 * const navItem: NavItemWithLinkType = { text: "Guide", link: "/guide/" };
 * const result = replaceLinksRecursive("v2.0.0", navItem);
 * // → { text: "Guide", link: "/v2.0.0/guide/" }
 *
 * const navGroup: NavItemWithChildrenType = {
 *   text: "Docs",
 *   items: [{ text: "Intro", link: "/intro/" }]
 * };
 * const groupResult = replaceLinksRecursive("v2.0.0", navGroup);
 * // → { text: "Docs", items: [{ text: "Intro", link: "/v2.0.0/intro/" }] }
 * ```
 *
 * @since 2.0.0
 */

export function replaceLinksRecursive(version: string, item: NavItemType): NavItemType {
    if (isNavItemWithChildren(item) && !item.skipVersioning) {
        return {
            ...item,
            items: item.items.map(child => replaceLinksRecursive(version, child))
        };
    }

    if (isNavItemWithLink(item) && !item.skipVersioning) {
        return {
            ...item,
            link: join('/', version, item.link)
        };
    }

    return item;
}

/**
 * Applies version prefixes to an array of navigation items.
 *
 * @param items - An array of navigation items to process.
 * @param version - The version string to prepend to links (e.g., `"v2.0.0"`).
 *   - If `"root"` is provided, no version prefix is added.
 * @returns A new array of navigation items with versioned links applied.
 *
 * @remarks
 * - Uses {@link replaceLinksRecursive} to traverse each navigation item.
 * - Only items that are link-based or have children are modified; component items remain unchanged.
 * - Preserves other properties of the navigation items.
 *
 * @example
 * ```ts
 * const navItems: NavItemType[] = [
 *   { text: "Guide", link: "/guide/" },
 *   { text: "Docs", items: [{ text: "Intro", link: "/intro/" }] }
 * ];
 * const versionedNav = populateNav(navItems, "v2.0.0");
 * // → [
 * //   { text: "Guide", link: "/v2.0.0/guide/" },
 * //   { text: "Docs", items: [{ text: "Intro", link: "/v2.0.0/intro/" }] }
 * // ]
 * ```
 *
 * @since 2.0.0
 */

export function populateNav(items: Array<NavItemType>, version: string): Array<NavItemType> {
    const state = inject(StateModel);
    if (version === 'root') version = '';

    return items.map(item => {
        if ('component' in item && item.component) {
            return {
                ...item,
                props: {
                    ...item.props,
                    versioningPlugin: {
                        versions: state.versionsList,
                        currentVersion: state.versionsConfig.current
                    }
                }
            };
        }

        return replaceLinksRecursive(version, item);
    });
}

/**
 * Normalizes a navigation structure into a flat, prefixed record.
 *
 * @param results - The target {@link NavObjectType} to populate with normalized items.
 * @param nav - The navigation structure to normalize. Can be:
 *   - An array of navigation items (`NavItemType[]`), or
 *   - A record mapping strings to arrays of navigation items (`NavObjectType`).
 * @param prefix - Optional prefix for keys when processing nested navigation objects.
 *   Defaults to an empty string.
 * @param root - Optional root-level navigation items to include in all normalized entries.
 *
 * @remarks
 * - If `nav` is an array, it merges it with the root items (if any) and appends to `results.root`.
 * - If `nav` is a record:
 *   - Each key is prefixed with `prefix` unless it is `'root'`.
 *   - Items from `root` or `root.root` are merged into each key.
 *   - All items are accumulated in the `results` object, preserving the hierarchy as flat keys.
 *
 * @example
 * ```ts
 * const nav: NavObjectType = {
 *   root: [{ text: "Home", link: "/" }],
 *   guide: [{ text: "Intro", link: "/intro/" }]
 * };
 * const results: NavObjectType = { root: [] };
 * normalizeNav(results, nav, "v2.0.0");
 * // results → {
 * //   root: [{ text: "Home", link: "/" }],
 * //   "v2.0.0/guide": [{ text: "Intro", link: "/intro/" }]
 * // }
 * ```
 *
 * @since 2.0.0
 */

export function normalizeNav(results: NavObjectType, nav: NavType, prefix: string = '', root: NavObjectType = {}): void {
    if (Array.isArray(nav)) {
        const index = prefix ? prefix : 'root';

        results[index] ??= [];
        results[index].push(...nav);
        if (root[index]) results[index].push(...root[index]);
        else if (root.root) results[index].push(...root.root);

        return;
    }

    for (const [ key, items ] of Object.entries(nav)) {
        const subRoot =  key === 'root' &&  prefix === '' ? 'root' : prefix;
        const index = key === 'root' ? subRoot : join(prefix, key);

        results[index] ??= [];
        results[index].push(...items);
        if (root[key]) results[index].push(...root[key]);
        else if (root.root) results[index].push(...root.root);
    }
}

/**
 * Normalizes all navigation structures across the global and locale-specific configurations.
 *
 * @param state - The current {@link StateModel} providing configuration data:
 *   - `configuration.themeConfig.nav` — global navigation configuration.
 *   - `configuration.locales` — locale-specific configurations with optional `nav`.
 *
 * @returns A flat record of navigation items keyed by locale or `'root'`, suitable for further processing.
 *
 * @remarks
 * - First, global navigation items are normalized into `globalResults`.
 * - If no locales are defined, `globalResults` is returned directly.
 * - Otherwise, iterates through all locale keys:
 *   - Normalizes each locale’s `nav` configuration.
 *   - Merges in global navigation items as fallback where necessary.
 * - Ensures that all navigation entries are flattened and ready for versioning or rendering.
 *
 * @example
 * ```ts
 * const state = inject(StateModel);
 * const normalizedNavs = normalizeNavs(state);
 * // normalizedNavs → {
 * //   root: [...global items],
 * //   en: [...English locale items including global fallback],
 * //   de: [...German locale items including global fallback]
 * // }
 * ```
 *
 * @since 2.0.0
 */

export function normalizeNavs(state: StateModel): Record<string, Array<NavItemType>> {
    const locales = state.configuration.locales;
    const localesKeys = Object.keys(locales);
    const globalResults: Record<string, Array<NavItemType>> = { root: [] };
    const switcher = versionSwitcher(state.versionsConfig, state.versionsList, state.versionsConfig.current);
    if(switcher) globalResults.root.push(switcher);

    if (state.configuration.themeConfig?.nav) {
        normalizeNav(globalResults, state.configuration.themeConfig.nav as NavType);
    }

    if (!localesKeys.length) return globalResults;
    const results: Record<string, Array<NavItemType>> = { root: [] };

    for (const locale of localesKeys) {
        const prefix = locale === 'root' || state.localesMap[locale] === 'root' ? 'root' : locale;
        normalizeNav(results, (locales[locale].themeConfig?.nav ?? []) as NavType, prefix, globalResults);
    }

    return results;
}

/**
 * Parses and populates the navigation structure for all locales.
 *
 * @remarks
 * - Retrieves normalized navigation items using {@link normalizeNavs}.
 * - Iterates through all locales defined in `vitepressConfig.locales`.
 * - For each locale:
 *   - Falls back to global navigation (`navs.root`) if locale-specific navigation is not defined.
 *   - Ensures the locale’s `themeConfig` exists.
 *   - Populates the locale’s `themeConfig.nav` using {@link populateNav}, applying versioning where applicable.
 *
 * This function ensures that all locales have a fully initialized and version-aware navigation structure.
 *
 * @example
 * ```ts
 * parseNavs();
 * // state.vitepressConfig.locales → each locale has `themeConfig.nav` populated
 * ```
 *
 * @since 2.0.0
 */

export function parseNavs(): void {
    const state = inject(StateModel);
    const { vitepressConfig: { locales } } = state;
    const navs = normalizeNavs(state);

    for (const [ key, locale ] of Object.entries(locales)) {
        const nav = navs[key] ?? navs.root;

        locale.themeConfig ??= {};
        locale.themeConfig.nav = populateNav(nav, key);
    }
}
