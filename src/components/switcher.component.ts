/**
 * Imports
 */

import type { NavItemWithChildrenType } from '@interfaces/nav.interface';
import type { VersionsConfigInterface } from '@interfaces/configuration.interface';

/**
 * Builds a version switcher navigation item for the documentation site.
 *
 * @param themeConfig - The {@link VersionsConfigInterface} configuration object.
 * @param versions - An array of available version strings.
 * @param current - The current version label, defaults to `"Latest"`.
 *
 * @returns A {@link NavItemWithChildrenType} representing the version switcher,
 * or `undefined` if the switcher is disabled in the configuration.
 *
 * @remarks
 * - If `themeConfig.versionSwitcher === false`, no switcher is created.
 * - The returned navigation item contains child links for each version in `versions`.
 * - If `includeCurrentVersion` is enabled, adds a link to the root (`"/"`)
 *   for the currently active version, displayed as `"Latest"` or
 *   `"vX.Y.Z (latest)"`.
 * - All version links have `skipVersioning: true` to prevent further prefixing.
 *
 * This utility allows users to quickly switch between documentation versions
 * from the navigation bar.
 *
 * @example
 * ```ts
 * const themeConfig: VersionsConfigInterface = {
 *   versionSwitcher: { text: "Versions", includeCurrentVersion: true }
 * };
 *
 * const versions = ["v2.0.0", "v1.5.0"];
 * const navItem = versionSwitcher(themeConfig, versions, "v2.0.0");
 *
 * // → {
 * //   text: "Versions",
 * //   items: [
 * //     { link: "/", text: "v2.0.0 (latest)", skipVersioning: true },
 * //     { link: "/v2.0.0/", text: "v2.0.0", skipVersioning: true },
 * //     { link: "/v1.5.0/", text: "v1.5.0", skipVersioning: true }
 * //   ]
 * // }
 * ```
 *
 * @since 2.0.0
 */

export function versionSwitcher(themeConfig: VersionsConfigInterface, versions: Array<string>, current: string = 'Latest'): undefined | NavItemWithChildrenType {
    if (themeConfig.versionSwitcher === false) return;

    const { text, includeCurrentVersion } = themeConfig.versionSwitcher;
    const items = [];
    if (includeCurrentVersion) {
        items.push({
            link: '/',
            text: current === 'Latest' ? current : `${ current } (latest)`,
            skipVersioning: true
        });
    }

    for (const version of versions) {
        items.push({ text: version, link: `/${ version }/`, skipVersioning: true });
    }

    return { text, items };
}
