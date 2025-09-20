/**
 * Import will remove at compile time
 */

import type { DefaultTheme } from 'vitepress';
import type { VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Recursively adds versioning information to a navigation item.
 *
 * @param navItem - A navigation item to which versioning information will be added.
 * @param versions - An array of available documentation versions.
 * @param latestVersion - The latest version string to mark as the default/latest.
 *
 * @returns The updated navigation item with versioning plugin props applied.
 *
 * @remarks
 * - If the `navItem` has nested `items`, the function recursively updates them.
 * - If the `navItem` has a `component` property, a `versioningPlugin` prop is added
 *   containing `versions` and `latestVersion`.
 *
 * @example
 * ```ts
 * import { addVersioningToNavItem } from './nav';
 *
 * const navItemWithVersioning = addVersioningToNavItem(navItem, ['1.0.0', '2.0.0'], '2.0.0');
 * ```
 *
 * @since 1.0.0
 */

export function addVersioningToNavItem(navItem: DefaultTheme.NavItem, versions: Array<string>, latestVersion: string): DefaultTheme.NavItem {
    if ('items' in navItem && navItem.items) {
        navItem.items = navItem.items.map((item) =>
            addVersioningToNavItem(item, versions, latestVersion)
        ) as Array<DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren>;
    }

    if ('component' in navItem && navItem.component) {
        const componentItem = navItem as DefaultTheme.NavItem & {
            component: string;
            props?: Record<string, unknown>;
        };

        componentItem.props ??= {};
        componentItem.props.versioningPlugin = {
            versions,
            latestVersion
        };
    }

    return navItem;
}

/**
 * Applies versioning to all navigation items in a theme configuration.
 *
 * @param themeConfig - Theme configuration object containing the `nav` array.
 * @param versions - An array of available documentation versions.
 * @param latestVersion - The latest version string to mark as default/latest.
 *
 * @returns void
 *
 * @remarks
 * - Iterates through all `nav` items and applies {@link addVersioningToNavItem}.
 * - Skips processing if `themeConfig.nav` is not an array.
 *
 * @example
 * ```ts
 * import { versioningNav } from './nav';
 *
 * versioningNav(themeConfig, ['1.0.0', '2.0.0'], '2.0.0');
 * ```
 *
 * @since 1.0.0
 */

export function versioningNav(themeConfig: VersionThemeInterface, versions: Array<string>, latestVersion: string = ''): void {
    if (!Array.isArray(themeConfig.nav)) return;

    themeConfig.nav = themeConfig.nav.map((item) =>
        addVersioningToNavItem(item, versions, latestVersion)
    );
}
