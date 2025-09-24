/**
 * Import will remove at compile time
 */

import type { ThemeInterface } from '@interfaces/theme.interface';
import type { NavItemType, NavItemWithChildrenType, NavItemWithLinkType, NavType } from '@interfaces/nav.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';
import { versionSwitcher } from '@components/switcher.component';

/**
 * Type guard to check if a navigation item is a {@link NavItemWithChildrenType}.
 *
 * @param item - The navigation item to test.
 * @returns `true` if the item has an `items` array, otherwise `false`.
 *
 * @example
 * ```ts
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
 * Type guard to check if a navigation item is a {@link NavItemWithLinkType}.
 *
 * @param item - The navigation item to test.
 * @returns `true` if the item has a `link` property, otherwise `false`.
 *
 * @example
 * ```ts
 * if (isNavItemWithLink(item)) {
 *   console.log(item.link); // Safe to access
 * }
 * ```
 *
 * @since 2.0.0
 */

export function isNavItemWithLink(item: NavItemType): item is NavItemWithLinkType {
    return 'link' in item;
}

/**
 * Recursively applies version prefixes to navigation item links.
 *
 * @param version - The version string to prefix (e.g., `"v2.0.0"`).
 * @param item - A navigation item, which may be a link or a nested group.
 *
 * @returns A new navigation item with updated `link` values where applicable.
 *
 * @remarks
 * - For {@link NavItemWithLinkType}, prepends the given `version` to the `link`
 *   unless `skipVersioning` is set.
 * - For {@link NavItemWithChildrenType}, traverses all children and applies
 *   the same transformation recursively.
 * - Preserves other properties of the navigation items.
 *
 * @example
 * ```ts
 * const navItem = { text: "Guide", link: "/guide/" };
 * const result = replaceLinksRecursive("v2.0.0", navItem);
 * // → { text: "Guide", link: "/v2.0.0/guide/" }
 * ```
 *
 * @since 2.0.0
 */

export function replaceLinksRecursive(version: string, item: NavItemType): NavItemType {
    if (isNavItemWithLink(item) && !item.skipVersioning) {
        item = {
            ...item,
            link: join('/', version, item.link)
        };
    }

    if (isNavItemWithChildren(item)) {
        item = {
            ...item,
            items: item.items.map(child => replaceLinksRecursive(version, child))
        };
    }

    return item;
}

/**
 * Normalizes a navigation configuration into a record keyed by scope.
 *
 * @param nav - The raw navigation configuration from the user.
 * @returns A normalized record of navigation items keyed by `root` or custom keys.
 *
 * @remarks
 * - If the input is `undefined`, returns an empty object.
 * - If the input is an array, returns `{ root: navArray }`.
 * - If the input is already a record, returns it as-is.
 *
 * @example
 * ```ts
 * normalizeNav([{ text: "Home", link: "/" }]);
 * // → { root: [{ text: "Home", link: "/" }] }
 * ```
 *
 * @since 2.0.0
 */

export function normalizeNav(nav?: NavType): Record<string, Array<NavItemType>> {
    return !nav ? {} : Array.isArray(nav) ? { root: nav } : nav as Record<string, Array<NavItemType>>;
}

/**
 * Populates the navigation of a theme configuration with versioned items.
 *
 * @param target - The target {@link ThemeInterface} to populate with navigation.
 * @param items - An array of navigation items to process.
 * @param version - The version string to prefix into navigation links
 *   (e.g., `"v2.0.0"`).
 *
 * @remarks
 * - Iterates through the given navigation `items` and transforms them
 *   before assigning them to the target theme’s `nav`.
 * - For items with a `component` property, injects a `versioningPlugin`
 *   prop containing available versions and the current version.
 * - For standard link or nested items, applies {@link replaceLinksRecursive}
 *   to prepend the given `version` to their `link` values.
 *
 * This ensures consistent version-aware navigation across the documentation site.
 *
 * @example
 * ```ts
 * const theme: ThemeInterface = {};
 * populateNav(theme, [{ text: "Guide", link: "/guide/" }], "v2.0.0");
 *
 * // theme.nav → [
 * //   { text: "Guide", link: "/v2.0.0/guide/" }
 * // ]
 * ```
 *
 * @since 2.0.0
 */

export function populateNav(target: ThemeInterface, items: Array<NavItemType>, version: string): void {
    const state = inject(StateModel);
    const switcher = versionSwitcher(state.versionsConfig, state.versionsList, state.versionsConfig.current);
    if(switcher) {
        items.push(switcher);
    }

    target.nav = items.map(item => {
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

        return replaceLinksRecursive(version, { ...item });
    });
}

/**
 * Parses and populates navigation structures for each locale and version.
 *
 * @param state - The current {@link StateModel}, which provides:
 * - `vitepressConfig.locales` — the target locales object to populate.
 * - `configuration.locales` — user-defined locale configurations.
 * - `localesMap` — a mapping between locale keys and their indices.
 * - `versionsList` — available documentation versions.
 *
 * @remarks
 * - Iterates through the `localesMap` of the current {@link StateModel}.
 * - For each locale:
 *   - Normalizes the user-provided `nav` structure via {@link normalizeNav}.
 *   - Populates the root navigation if defined.
 *   - Iterates through all available versions (`versionsList`) and ensures
 *     that version-specific navigation trees are also populated.
 * - Uses {@link populateNav} to inject version-aware navigation links and
 *   component props into each locale’s theme configuration.
 *
 * This ensures that both locale-level and version-level navigation entries
 * are consistently built and attached to the corresponding `vitepressConfig.locales`.
 *
 * @example
 * ```ts
 * const state = inject(StateModel);
 * parseLocaleNav(state);
 *
 * // Populates `state.vitepressConfig.locales` with
 * // versioned navigation trees for all locales.
 * ```
 *
 * @since 2.0.0
 */

export function parseLocaleNav(state: StateModel): void {
    const { vitepressConfig: { locales }, configuration: { locales: userLocales }, localesMap, versionsList } = state;

    Object.entries(localesMap).forEach(([ key, index ]) => {
        const nav = normalizeNav(<NavType> userLocales[key].themeConfig?.nav);
        const rootNav = nav.root ?? [];
        if (rootNav.length) {
            locales[index].themeConfig ??= {};
            populateNav(locales[index].themeConfig as ThemeInterface, rootNav, index === 'root' ? '' : index);
        }

        versionsList.forEach(version => {
            const subIndex = index === 'root' ? version : join(key, version);
            const versionNav = nav[subIndex] ?? nav.root ?? [];
            if (versionNav.length) {
                locales[subIndex].themeConfig ??= {};
                populateNav(locales[subIndex].themeConfig as ThemeInterface, versionNav, subIndex);
            }
        });
    });
}

/**
 * Parses and populates the navigation structure for the documentation site.
 *
 * @remarks
 * - Acts as the entry point for building navigation trees.
 * - If user-defined locales exist in {@link ConfigurationInterface.locales},
 *   delegates to {@link parseLocaleNav} to handle locale-aware navigation.
 * - Otherwise, builds navigation from the root-level `themeConfig.nav` and
 *   applies it to the root and version-specific sections of
 *   {@link VitepressConfigInterface.locales}.
 * - Uses {@link populateNav} to inject version-aware navigation links and
 *   component props into the target theme configurations.
 *
 * This ensures that navigation is consistently initialized whether the
 * documentation is locale-based or single-root.
 *
 * @example
 * ```ts
 * // Without locales, parse root and version-level navigation
 * parseNavs();
 *
 * // With locales, internally calls parseLocaleNav(state)
 * ```
 *
 * @since 2.0.0
 */

export function parseNavs(): void {
    const state = inject(StateModel);
    const { vitepressConfig: { locales }, configuration, versionsList } = state;

    if (Object.keys(configuration.locales).length)
        return parseLocaleNav(state);

    const nav = normalizeNav(configuration.themeConfig?.nav as NavType);
    const rootNav = nav.root ?? [];

    if (rootNav.length) {
        locales.root.themeConfig ??= {};
        populateNav(locales.root.themeConfig as ThemeInterface, rootNav, '');
    }

    versionsList.forEach(version => {
        const versionNav = nav[version] ?? nav.root ?? [];
        if (versionNav.length) {
            locales[version].themeConfig ??= {};
            populateNav(locales[version].themeConfig as ThemeInterface, versionNav, version);
        }
    });
}
