/**
 * Import will remove at compile time
 */

import type { Dirent } from 'fs';
import type { UserConfig } from 'vitepress';
import type { ConfigInterface, VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { join } from 'path';
import { themeConfig } from '@providers/theme.provider';
import { defaultConfig } from './constants/default.constant';
import { versionRoutes } from '@components/routes.component';
import { assignMissingDeep } from '@components/object.component';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';

/**
 * Exports
 */

export * from './interfaces/config.interface';

/**
 * Defines a versioned configuration for a VitePress project.
 *
 * This function sets up the necessary folder structure for versioned documentation,
 * merges default configuration values with the provided config, and initializes
 * theme and routing for versioned documentation.
 *
 * @template T - Type extending {@link VersionThemeInterface}, used for theme configuration.
 *
 * @param config - The user-defined configuration object.
 * @returns UserConfig - The finalized configuration object ready for VitePress.
 *
 * @remarks
 * The function performs the following steps:
 * 1. Resolves the absolute paths for the project root, documentation source folder, and versions folder.
 * 2. Creates the `versions` folder if it doesn't exist and adds a `.gitkeep` file.
 * 3. Reads all directories inside the `versions` folder to determine available versions.
 * 4. Merges user-provided versioning configuration with the default values.
 * 5. Initializes theme settings via {@link themeConfig}.
 * 6. Initializes version-based routes via {@link versionRoutes}.
 *
 * @example
 * ```ts
 * import { defineVersionedConfig } from './config';
 *
 * export default defineVersionedConfig({
 *   root: '.',
 *   srcDir: 'docs',
 *   versioning: { enabled: true },
 *   theme: { colorMode: 'dark' }
 * });
 * ```
 *
 * @since 1.0.0
 */

export function defineVersionedConfig<T extends VersionThemeInterface = VersionThemeInterface>(config: ConfigInterface<T>): UserConfig<T> {
    const rootPath = join(process.cwd(), config.root);
    const docsPath = join(rootPath, config.srcDir ?? '');
    const versionsFolder = join(docsPath, 'versions');

    if (!existsSync(versionsFolder)) {
        mkdirSync(versionsFolder);
        writeFileSync(join(versionsFolder, '.gitkeep'), '');
    }

    const versions: string[] = readdirSync(versionsFolder, { withFileTypes: true })
        .filter((entry: Dirent) => entry.isDirectory())
        .map((entry: Dirent) => entry.name);

    config.versioning = <ConfigInterface['versioning']> assignMissingDeep(config.versioning, defaultConfig);
    themeConfig(config, versions, rootPath);
    versionRoutes(config, versions, docsPath);

    return config;
}
