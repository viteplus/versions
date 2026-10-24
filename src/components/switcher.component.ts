/**
 * Imports
 */

import type { VersionsConfigInterface } from '@interfaces/configuration.interface';
import type { NavItemWithChildrenType, NavItemWithLinkType } from '@interfaces/nav.interface';

/**
 * Builds a version switcher navigation item for the documentation site.
 *
 * @param themeConfig - The {@link VersionsConfigInterface} configuration object
 * @param versions - The names of every published version
 * @param latest - The name of the stable version
 * @param labels - The text to show for each version name, falling back to the name itself
 * @returns A {@link NavItemWithChildrenType} representing the version switcher,
 * or `undefined` if the switcher is disabled in the configuration
 *
 * @remarks
 * - If `themeConfig.versionSwitcher === false`, no switcher is created.
 * - The returned navigation item contains child links for each version in `versions` other than `latest`.
 * - If `includeCurrentVersion` is enabled, a link to the root, where `latest` is served, comes first,
 *   tagged `(latest)` unless its label already reads `latest`.
 * - All version links have `skipVersioning: true` to prevent further prefixing.
 *
 * Each link keeps the version name in its URL and shows the text from `labels`,
 * so a label never moves a page.
 *
 * @example
 * ```ts
 * const themeConfig: VersionsConfigInterface = {
 *   versionSwitcher: { text: "Versions", includeCurrentVersion: true }
 * };
 *
 * const versions = ["next", "v2.0.0", "v1.5.0"];
 * const navItem = versionSwitcher(themeConfig, versions, "v2.0.0", { "v1.5.0": "v1.5.0 (LTS)" });
 *
 * // → {
 * //   text: "Versions",
 * //   items: [
 * //     { link: "/", text: "v2.0.0 (latest)", skipVersioning: true },
 * //     { link: "/next/", text: "next", skipVersioning: true },
 * //     { link: "/v1.5.0/", text: "v1.5.0 (LTS)", skipVersioning: true }
 * //   ]
 * // }
 * ```
 *
 * @see https://github.com/viteplus/versions/issues/55
 * @since 3.0.0
 */

export function versionSwitcher(
    themeConfig: VersionsConfigInterface, versions: Array<string>, latest: string, labels: Record<string, string> = {}
): undefined | NavItemWithChildrenType {
    if (themeConfig.versionSwitcher === false) return;

    const { text, includeCurrentVersion } = themeConfig.versionSwitcher;
    const item = (version: string, label = labels[version] ?? version): NavItemWithLinkType =>
        ({ text: label, link: version === latest ? '/' : `/${ version }/`, skipVersioning: true });

    const items = versions.filter(version => version !== latest).map(version => item(version));
    if (includeCurrentVersion) {
        const label = labels[latest] ?? latest;
        items.unshift(item(latest, label.toLowerCase() === 'latest' ? label : `${ label } (latest)`));
    }

    return { text, items };
}
