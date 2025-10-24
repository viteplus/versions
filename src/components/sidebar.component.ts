/**
 * Import will remove at compile time
 */

import type { SidebarItemType, SidebarObjectType, SidebarType } from '@interfaces/sidebar.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';

/**
 * Populates sidebar items with versioned base paths.
 *
 * @param sidebar - The list of sidebar {@link SidebarItemType} items to transform.
 * @param version - The version key (e.g., `"en"`, `"v1.0"`, `"root"`).
 *
 * @returns A new sidebar array with versioned `base` properties applied.
 *
 * @remarks
 * - If the provided `version` is `"root"`, it is normalized to an empty prefix (`""`).
 * - Items marked with `skipVersioning` are returned unchanged.
 * - When an item has a `link` or nested `items`, its `base` property is updated with the version prefix.
 * - Recursively processes child `items` to ensure consistent versioning throughout the sidebar tree.
 *
 * @example
 * ```ts
 * const sidebar: SidebarItemType[] = [
 *   { text: "Introduction", link: "/intro" },
 *   {
 *     text: "Guide",
 *     items: [
 *       { text: "Setup", link: "/setup" }
 *     ]
 *   }
 * ];
 *
 * // Applying version "v1"
 * const result = populateSidebar(sidebar, "v1");
 *
 * // Result:
 * [
 *   { text: "Introduction", link: "/intro", base: "/v1/" },
 *   {
 *     text: "Guide",
 *     base: "/v1/",
 *     items: [
 *       { text: "Setup", link: "/setup", base: "/v1/" }
 *     ]
 *   }
 * ]
 * ```
 *
 * @see SidebarItemType
 * @since 2.0.0
 */

export function populateSidebar(sidebar: Array<SidebarItemType>, version: string): Array<SidebarItemType> {
    if (version === 'root') version = '';

    return sidebar.map(item => {
        if(item.skipVersioning || item?.link?.startsWith('http')) return item;
        item = { ...item };

        if((item.link || item.items) && version !== '') {
            item.base ??= '';
            item.base = join('/', version, item.base, '/');
        }

        return item;
    });
}

/**
 * Normalizes a sidebar definition into a flat {@link SidebarObjectType} structure.
 *
 * @param results - The target results object where normalized sidebar items will be accumulated.
 * @param sidebar - The sidebar definition to normalize, which can be an array of items or a path-based mapping.
 * @param prefix - The optional path prefix used for nested sidebar entries (defaults to `""`).
 * @param root - A root-level sidebar object used as a fallback when merging items (defaults to `{}`).
 *
 * @returns void — Mutates the `results` object directly by appending normalized sidebar items.
 *
 * @remarks
 * - If the `sidebar` is an array, it is stored under the `prefix` key (or `"root"` if no prefix is given).
 * - If the `sidebar` is an object, each key is resolved into a full index path using the `prefix`.
 * - When merging items, entries from `root` (matching key or `"root"`) are prepended to the results.
 * - Ensures all sidebar values are normalized into arrays, even if a single item is provided.
 *
 * @example
 * ```ts
 * const results: SidebarObjectType = {};
 * normalizeSidebar(results, [
 *   { text: "Intro", link: "/intro" }
 * ]);
 *
 * // Result:
 * {
 *   root: [
 *     { text: "Intro", link: "/intro" }
 *   ]
 * }
 * ```
 *
 * @example
 * ```ts
 * const results: SidebarObjectType = {};
 * normalizeSidebar(results, {
 *   guide: [
 *     { text: "Getting Started", link: "/guide/start" }
 *   ]
 * }, "en");
 *
 * // Result:
 * {
 *   "en/guide": [
 *     { text: "Getting Started", link: "/guide/start" }
 *   ]
 * }
 * ```
 *
 * @see SidebarType
 * @see SidebarObjectType
 *
 * @since 2.0.0
 */

export function normalizeSidebar(results: SidebarObjectType, sidebar: SidebarType, prefix: string = '', root: SidebarObjectType = {}): void {
    if (Array.isArray(sidebar)) {
        const index = prefix ? prefix : 'root';
        results[index] ??= [];

        if (root[index]) results[index].push(...root[index]);
        else if (root.root) results[index].push(...root.root);
        results[index].push(...sidebar);

        return;
    }

    for (const [ key, items ] of Object.entries(sidebar)) {
        const subRoot =  key === 'root' &&  prefix === '' ? 'root' : prefix;
        const index = key === 'root' ? subRoot : join(prefix, key);
        const itemsArray = Array.isArray(items) ? items : [ items ];
        results[index] ??= [];

        if (root[key]) results[index].push(...root[key]);
        else if (root.root) results[index].push(...root.root);
        results[index].push(...itemsArray);
    }
}

/**
 * Normalizes all sidebar structures across global and locale-specific configurations.
 *
 * @param state - The current {@link StateModel} providing configuration data:
 *   - `configuration.themeConfig.sidebar` — global sidebar configuration.
 *   - `configuration.locales` — locale-specific configurations with optional `sidebar`.
 *   - `localesMap` — maps locale keys to normalized paths for root fallback.
 *
 * @returns A flat {@link SidebarObjectType} where each key corresponds to a locale
 * or `"root"` and contains an array of normalized sidebar items.
 *
 * @remarks
 * - Global sidebar items are first normalized into `globalResults`.
 * - If no locales are defined, `globalResults` is returned directly.
 * - For each locale:
 *   - Computes a `prefix` key for the locale (falling back to `"root"` if necessary).
 *   - Normalizes the locale’s sidebar using {@link normalizeSidebar}, merging in global items as fallback.
 * - Ensures that all sidebar entries are flattened and ready for versioning or rendering.
 *
 * @example
 * ```ts
 * const state = inject(StateModel);
 * const sidebars = normalizeSidebars(state);
 * // sidebars → {
 * //   root: [...global items],
 * //   en: [...English locale items including global fallback],
 * //   fr: [...French locale items including global fallback]
 * // }
 * ```
 *
 * @see SidebarType
 * @see normalizeSidebar
 * @see SidebarObjectType
 *
 * @since 2.0.0
 */

export function normalizeSidebars(state: StateModel): SidebarObjectType {
    const locales = state.configuration.locales;
    const localesKeys = Object.keys(locales);
    const globalResults: SidebarObjectType = { root: [] };

    if (state.configuration.themeConfig?.sidebar) {
        normalizeSidebar(globalResults, state.configuration.themeConfig.sidebar as SidebarType);
    }

    if (!localesKeys.length) return globalResults;
    const results: SidebarObjectType = { root: [] };

    for (const locale of localesKeys) {
        const prefix = locale === 'root' || state.localesMap[locale] === 'root' ? 'root' : locale;
        normalizeSidebar(results, (locales[locale].themeConfig?.sidebar ?? []) as SidebarType, prefix, globalResults);
    }

    return results;
}

/**
 * Parses and populates the sidebar structure for all locales.
 *
 * @remarks
 * - Retrieves normalized sidebar items using {@link normalizeSidebars}.
 * - Iterates through all locales defined in `vitepressConfig.locales`.
 * - For each locale:
 *   - Falls back to global sidebar (`sidebars.root`) if locale-specific sidebar is not defined.
 *   - Ensures the locale’s `themeConfig` exists.
 *   - Populates the locale’s `themeConfig.sidebar` using {@link populateSidebar}, applying versioning where applicable.
 *
 * This function ensures that all locales have a fully initialized and version-aware sidebar structure.
 *
 * @example
 * ```ts
 * parseSidebar();
 * // state.vitepressConfig.locales → each locale has `themeConfig.sidebar` populated
 * ```
 *
 * @see SidebarType
 * @see populateSidebar
 * @see SidebarObjectType
 * @see normalizeSidebars
 *
 * @since 2.0.0
 */

export function parseSidebar(): void {
    const state = inject(StateModel);
    const { vitepressConfig: { locales } } = state;
    const sidebars = normalizeSidebars(state);

    for (const [ key, locale ] of Object.entries(locales)) {
        const sidebar = sidebars[key] ?? sidebars.root;

        locale.themeConfig ??= {};
        locale.themeConfig.sidebar = populateSidebar(sidebar, key);
    }
}
