/**
 * Import will remove at compile time
 */

import type { DefaultTheme } from 'vitepress';
import type { ConfigInterface, SidebarItemInterface, SidebarOptionsInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

/**
 * Recursively replaces sidebar links for a given version using a custom URL processor.
 *
 * @param sidebarOptions - Sidebar options containing the `sidebarUrlProcessor` function.
 * @param version - The current documentation version to apply in the links.
 * @param sidebar - An array of sidebar items to process.
 *
 * @returns A new array of sidebar items with versioned links applied.
 *
 * @remarks
 * - Skips items marked with `skipVersioning`.
 * - Recursively processes nested items under `items`.
 *
 * @example
 * ```ts
 * const updatedSidebar = replaceLinksRecursive(sidebarOptions, '1.0.0', sidebar);
 * ```
 *
 * @since 1.0.0
 */

export function replaceLinksRecursive(
    sidebarOptions: SidebarOptionsInterface, version: string, sidebar: Array<SidebarItemInterface>
): Array<SidebarItemInterface> {
    return sidebar.map((item) => {
        if (item.skipVersioning) {
            return item;
        }

        if (item.link) {
            item.link = sidebarOptions.sidebarUrlProcessor!(item.link, version);
        }

        if (item.items) {
            item.items = replaceLinksRecursive(sidebarOptions, version, item.items);
        }

        return item;
    });
}

/**
 * Loads a sidebar for a specific version and locale from the filesystem.
 *
 * @param sidebarOptions - Sidebar options including `sidebarPathResolver`.
 * @param version - The current documentation version.
 * @param locale - The locale key ('root' for default locale).
 * @param rootPath - Absolute path to the project root.
 *
 * @returns A `DefaultTheme.Sidebar` object (array or multi-sidebar) with versioned links.
 *
 * @remarks
 * - If the sidebar file does not exist, returns an empty array.
 * - Recursively applies `replaceLinksRecursive` for versioned links.
 * - Supports both single-array sidebars and multi-sidebar objects.
 *
 * @example
 * ```ts
 * const sidebar = loadSidebar(sidebarOptions, '1.0.0', 'en', '/path/to/project');
 * ```
 *
 * @since 1.0.0
 */

export function loadSidebar(sidebarOptions: SidebarOptionsInterface, version: string, locale: string, rootPath: string): DefaultTheme.Sidebar {
    const sidebarPath = resolve(
        rootPath,
        sidebarOptions.sidebarPathResolver!(
            version + (locale === 'root' ? '' : `-${ locale }`)
        )
    );

    if (!existsSync(sidebarPath)) return [];
    const sidebar = JSON.parse(readFileSync(sidebarPath, 'utf-8'));
    if (Array.isArray(sidebar)) {
        return replaceLinksRecursive(
            sidebarOptions,
            (locale === 'root' ? '' : `${ locale }/`) + version,
            sidebar
        );
    }

    const multiSidebar = sidebar as DefaultTheme.SidebarMulti;
    Object.keys(multiSidebar).forEach((key) => {
        if (Array.isArray(multiSidebar[key])) {
            multiSidebar[key] = replaceLinksRecursive(
                sidebarOptions,
                (locale === 'root' ? '' : `${ locale }/`) + version,
                multiSidebar[key] as Array<SidebarItemInterface>
            );
        }
    });

    return multiSidebar;
}

/**
 * Generates versioned sidebars for all versions and locales.
 *
 * @param config - The configuration object containing versioning and sidebar settings.
 * @param versions - An array of available documentation versions.
 * @param locales - An array of locale keys including `'root'`. If empty, `'root'` will be used.
 * @param rootPath - Absolute path to the project root.
 *
 * @returns A `DefaultTheme.SidebarMulti` object mapping versioned paths to sidebars.
 *
 * @remarks
 * - Iterates through all versions and locales to load and process sidebars.
 * - Uses {@link loadSidebar} to read the sidebar JSON and convert links to versioned URLs.
 * - Handles both single-array sidebars and multi-sidebar objects.
 * - All sidebar links are converted to **absolute paths** relative to the version root to prevent duplicated folder segments in nested paths.
 * - If `config.versioning.sidebarOptions` is `false`, returns an empty sidebar mapping.
 * - Defaults to `'root'` locale if no locales are specified.
 *
 * @example
 * ```ts
 * const sidebars = versioningSidebar(config, ['1.0.0', '2.0.0'], ['root', 'en'], '/path/to/project');
 * // sidebars['/1.0.0/'] → sidebar for root locale, version 1.0.0
 * // sidebars['/en/1.0.0/'] → sidebar for 'en' locale, version 1.0.0
 * ```
 *
 * @since 1.0.0
 */

export function versioningSidebar(
    config: ConfigInterface, versions: Array<string>, locales: Array<string>, rootPath: string
): DefaultTheme.SidebarMulti {
    const versionSidebars: DefaultTheme.SidebarMulti = {};
    const sidebarOptions = config.versioning.sidebarOptions!;
    if (sidebarOptions === false) return versionSidebars;

    for (const version of versions) {
        for (const locale of locales) {
            const sidebar = loadSidebar(sidebarOptions, version, locale, rootPath);

            if (Array.isArray(sidebar)) {
                versionSidebars[
                    (locale === 'root' ? '' : `/${ locale }`) + `/${ version }/`
                ] = sidebar;
            } else {
                Object.keys(sidebar).forEach((key) => {
                    versionSidebars[
                        (locale === 'root' ? '' : `/${ locale }`) + `/${ version }${ key }`
                    ] = (sidebar as DefaultTheme.SidebarMulti)[key];
                });
            }
        }
    }

    return versionSidebars;
}
