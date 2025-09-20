/**
 * Import will remove at compile time
 */

import type { DefaultTheme } from 'vitepress';
import type { VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { assignMissingDeep } from '@components/object.component';

/**
 * Adds a version-switching dropdown to the VitePress navigation.
 *
 * @remarks
 * This utility augments the provided {@link VersionThemeInterface | themeConfig}
 * with a `nav` entry that lists available documentation versions.
 *
 * - If `themeConfig.versionSwitcher` is `false`, the function exits without changes.
 * - If `themeConfig.versionSwitcher` is an object, missing keys are filled using {@link assignMissingDeep}.
 *
 * @param themeConfig - The mutable VitePress theme configuration that will receive the version switcher.
 * @param versions - Array of version strings (e.g., `['v1', 'v2']`) to display as selectable links.
 * @param latestVersion - Optional label for the latest version entry. Defaults to `'Latest'`.
 *
 * @example
 * ```ts
 * versionSwitcher(themeConfig, ['v1', 'v2']);
 * // Adds a nav dropdown titled "Switch Version" with entries:
 * // → Latest
 * // → v1
 * // → v2
 * ```
 *
 * @since 1.0.0
 */

export function versionSwitcher(themeConfig: VersionThemeInterface, versions: Array<string>, latestVersion: string = 'Latest'): void {
    if (themeConfig.versionSwitcher === false) return;
    const defaults = { text: 'Switch Version', includeLatestVersion: true };

    if (!themeConfig.versionSwitcher) {
        themeConfig.versionSwitcher = { ...defaults };
    } else {
        assignMissingDeep(themeConfig.versionSwitcher, defaults);
    }

    const { text, includeLatestVersion } = themeConfig.versionSwitcher;
    const items: DefaultTheme.NavItemWithLink[] = [];
    if (includeLatestVersion) {
        items.push({
            text: latestVersion === 'Latest' ? latestVersion : `${ latestVersion } (latest)`,
            link: '/'
        });
    }

    for (const version of versions) {
        items.push({ text: version, link: `/${ version }/` });
    }

    themeConfig.nav ??= [];
    themeConfig.nav.push({ text, items });
}
