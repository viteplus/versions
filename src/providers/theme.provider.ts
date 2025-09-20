/**
 * Import will remove at compile time
 */

import type { ConfigInterface, VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { versioningNav } from '@components/nav.component';
import { xterm } from '@remotex-labs/xansi/xterm.component';
import { versionSwitcher } from '@components/switcher.component';
import { versioningSidebar } from '@components/sidebar.component';

/**
 * Configures the VitePress theme for versioned documentation.
 *
 * This function applies versioning to the theme, including the version switcher,
 * navigation, and sidebar, for both the default locale and any additional locales.
 *
 * @template T - Type extending {@link VersionThemeInterface}, used for theme configuration.
 *
 * @param config - The configuration object containing theme and versioning settings.
 * @param versions - An array of version strings detected from the `versions` folder.
 * @param rootPath - The absolute path to the project root.
 *
 * @remarks
 * For each theme configuration (default + locales):
 * 1. Initializes the version switcher via {@link versionSwitcher} using `versions` and `config.versioning.latestVersion`.
 * 2. Updates the navigation menu using {@link versioningNav}.
 * 3. Validates the sidebar configuration:
 *    - If the sidebar is an array, logs an error recommending a `DefaultTheme.MultiSidebar` object instead.
 *    - Otherwise, merges versioned sidebar options via {@link versioningSidebar}.
 *
 * The `themeConfig` function ensures all theme-related versioning features are applied consistently
 * across locales and prevents invalid sidebar structures.
 *
 * @example
 * ```ts
 * import { themeConfig } from './theme';
 *
 * themeConfig(config, ['1.0.0', '2.0.0'], '/path/to/project');
 * ```
 *
 * @since 1.0.0
 */

export function themeConfig<T extends VersionThemeInterface>(config: ConfigInterface<T>, versions: Array<string>, rootPath: string): void {
    const themeConfigArray = [
        config.themeConfig, ...Object.values(config.locales ?? {}).map(
            (locale) => locale.themeConfig
        )
    ];

    for (const themeConfig of themeConfigArray) {
        if (!themeConfig) continue;
        versionSwitcher(themeConfig, versions, config.versioning.latestVersion);
        versioningNav(themeConfig, versions, config.versioning.latestVersion);

        if(Array.isArray(themeConfig.sidebar)) {
            console.error(
                `${ xterm.redBright('[ viteplus ]') } - The sidebar cannot be an array.\n` +
                xterm.dim('Please use a DefaultTheme.MultiSidebar object where the root (\'/\') is your array.')
            );
        } else {
            themeConfig.sidebar = {
                ...themeConfig.sidebar,
                ...versioningSidebar(config, versions, Object.keys(config.locales ?? {}), rootPath)
            };
        }
    }
}
