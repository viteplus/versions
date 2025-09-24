/**
 * Import will remove at compile time
 */

import type { ThemeInterface } from '@interfaces/theme.interface';
import type { SidebarItemType, SidebarType } from '@interfaces/sidebar.interface';
import type { PathSidebarInterface, SidebarGroupInterface } from '@interfaces/sidebar.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';

/**
 * Normalizes a sidebar configuration into a {@link PathSidebarInterface}.
 *
 * @param sidebar - The raw sidebar definition provided by the user.
 * @returns A normalized {@link PathSidebarInterface}.
 *
 * @remarks
 * - If the input is `undefined`, returns an empty object.
 * - If the input is an array, wraps it under the `root` key.
 * - If the input is already a record, returns it as-is.
 *
 * This ensures that sidebars are consistently shaped before being
 * processed by other utilities.
 *
 * @example
 * ```ts
 * normalizeSidebar([{ text: "Guide", link: "/guide/" }]);
 * // → { root: [{ text: "Guide", link: "/guide/" }] }
 * ```
 *
 * @since 2.0.0
 */

export function normalizeSidebar(sidebar?: SidebarType): PathSidebarInterface {
    return !sidebar ? {} : Array.isArray(sidebar) ? { root: sidebar } : sidebar;
}

/**
 * Populates the sidebar of a theme configuration with versioned items.
 *
 * @param target - The target {@link ThemeInterface} to populate with sidebar entries.
 * @param items - Either an array of sidebar items or a grouped sidebar definition.
 * @param version - The version or locale key to prefix into sidebar item bases.
 *
 * @remarks
 * - If provided `items` is a group, extracts its `base` and `items` fields.
 * - Ignores processing if `items` is empty.
 * - For each sidebar item:
 *   - Skips base modification if `skipVersioning` is set.
 *   - Otherwise, normalizes and prefixes the `base` with the given version.
 * - Mutates `target.sidebar` with the processed items.
 *
 * @example
 * ```ts
 * const theme: ThemeInterface = {};
 * populateSidebar(theme, [{ text: "Guide", link: "/guide/" }], "v2.0.0");
 *
 * // theme.sidebar → [
 * //   { text: "Guide", link: "/guide/", base: "/v2.0.0/" }
 * // ]
 * ```
 *
 * @since 2.0.0
 */

export function populateSidebar(target: ThemeInterface, items: Array<SidebarItemType> | SidebarGroupInterface, version: string): void {
    let base = '';
    if(!Array.isArray(items)) {
        base = items.base;
        items = items.items;
    }

    if(!items.length) return;
    target.sidebar = items.map(item => {
        if(item.skipVersioning) return item;
        item = { ...item };

        item.base ??= '';
        item.base = join('/', version, base, item.base, '/');

        return item;
    });
}

/**
 * Parses and populates sidebar structures for each locale and version.
 *
 * @param state - The current {@link StateModel}, which provides:
 * - `vitepressConfig.locales` — the target locales object to populate.
 * - `configuration.locales` — user-defined locale configurations.
 * - `localesMap` — a mapping between locale keys and their indices.
 * - `versionsList` — available documentation versions.
 *
 * @remarks
 * - Iterates through the `localesMap` entries.
 * - For each locale:
 *   - Normalizes the user-provided sidebar via {@link normalizeSidebar}.
 *   - Populates the root sidebar into the locale’s theme configuration.
 *   - Iterates through all `versionsList` to populate version-specific
 *     sidebars as well.
 * - Uses {@link populateSidebar} to inject version-aware sidebar bases
 *   into each locale’s theme configuration.
 *
 * @example
 * ```ts
 * const state = inject(StateModel);
 * parseLocaleSidebar(state);
 *
 * // Populates `state.vitepressConfig.locales` with
 * // versioned sidebars for all locales.
 * ```
 *
 * @since 2.0.0
 */

export function parseLocaleSidebar(state: StateModel): void {
    const { vitepressConfig: { locales }, configuration: { locales: userLocales }, localesMap, versionsList } = state;

    Object.entries(localesMap).forEach(([ key, index ]) => {
        const sidebar = normalizeSidebar(<SidebarType> userLocales[key].themeConfig?.sidebar);
        const rootNav = sidebar.root ?? [];

        locales[index].themeConfig ??= {};
        populateSidebar(locales[index].themeConfig as ThemeInterface, rootNav, index === 'root' ? '' : index);

        versionsList.forEach(version => {
            const subIndex = index === 'root' ? version : join(key, version);
            const versionNav = sidebar[subIndex] ?? sidebar.root ?? [];

            locales[subIndex].themeConfig ??= {};
            populateSidebar(locales[subIndex].themeConfig as ThemeInterface, versionNav, subIndex);
        });
    });
}

/**
 * Parses and populates the sidebar structure for the documentation site.
 *
 * @remarks
 * - Serves as the entry point for building sidebar trees.
 * - If user-defined locales exist in {@link ConfigurationInterface.locales},
 *   delegates to {@link parseLocaleSidebar}.
 * - Otherwise, builds sidebar entries from the root-level
 *   `themeConfig.sidebar` and applies them to the root and all versions.
 * - Uses {@link populateSidebar} to apply version-aware sidebar bases.
 *
 * This ensures consistent sidebar initialization across both
 * locale-based and single-root documentation setups.
 *
 * @example
 * ```ts
 * // Without locales, parse root and version-level sidebars
 * parseSidebar();
 *
 * // With locales, internally calls parseLocaleSidebar(state)
 * ```
 *
 * @since 2.0.0
 */

export function parseSidebar(): void {
    const state = inject(StateModel);
    const { vitepressConfig: { locales }, configuration, versionsList } = state;

    if (Object.keys(state.configuration.locales).length)
        return parseLocaleSidebar(state);

    const sidebar = normalizeSidebar(<SidebarType> configuration.themeConfig?.sidebar);
    const rootSidebar = sidebar.root ?? [];

    locales.root.themeConfig ??= {};
    populateSidebar(locales.root.themeConfig as ThemeInterface, rootSidebar, '');

    versionsList.forEach(version => {
        const versionSidebar = sidebar[version] ?? sidebar.root ?? [];
        locales[version].themeConfig ??= {};
        populateSidebar(locales[version].themeConfig as ThemeInterface, versionSidebar, version);
    });
}
