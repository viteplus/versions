/**
 * Import will remove at compile time
 */

import type { Dirent } from 'fs';
import type { ConfigurationInterface } from '@interfaces/configuration.interface';
import type { VersionsConfigInterface, VitepressConfigInterface } from '@interfaces/configuration.interface';

/**
 * Imports
 */

import { join, posix } from 'path';
import { xterm } from '@remotex-labs/xansi/xterm.component';
import { getLanguageOnly } from '@components/locale.component';
import { Injectable } from '@symlinks/services/inject.service';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { defaultConfiguration } from '@constants/configuration.constant';

/**
 * Manages the state of a versioned VitePress documentation project.
 *
 * @remarks
 * The `StateModel` class is responsible for:
 * - Managing source and archive directories for versioned documentation.
 * - Initializing the VitePress configuration (`VitepressConfigInterface`) from
 *   a provided {@link ConfigurationInterface}.
 * - Maintaining a list of documentation versions and a map of Markdown files per version.
 * - Ensuring the necessary directories exist and are initialized.
 *
 * This service is designed as a singleton, making it safe to inject across
 * your application using `@Injectable({ scope: 'singleton' })`.
 *
 * @example
 * ```ts
 * import { StateModel } from "@models/state.model";
 *
 * const state = new StateModel(config).init();
 * console.log(state.versionsList);
 * ```
 *
 * @since 2.0.0
 */

@Injectable({
    scope: 'singleton'
})
export class StateModel {
    /**
     * The root path of the documentation project,
     * based on the current working directory and optional srcDir.
     *
     * @since 2.0.0
     */

    readonly root: string;

    /**
     * The name of the sources directory from which current content.
     *
     * @default `src`
     * @since 2.0.0
     */

    readonly sources: string;

    /**
     * The name of the archive directory where old versions are stored.
     *
     * @default `archive`
     * @since 2.0.0
     */

    readonly archive: string;

    /**
     * Full path to the `sources` directory.
     *
     * @since 2.0.0
     */

    readonly sourcesPath: string;

    /**
     * Full path to the `archive` directory.
     *
     * @since 2.0.0
     */

    readonly archivePath: string;

    /**
     * The `versions` configuration object for the plugin.
     *
     * @remarks
     * This property holds the currently active versions configuration
     * as defined in {@link VersionsConfigInterface}. It includes settings
     * like the current version, sources, archive, hooks, and version switcher.
     *
     * @see VersionsConfigInterface
     * @since 2.0.0
     */

    readonly versionsConfig: VersionsConfigInterface;

    /**
     * The VitePress configuration object crafted from the user-provided configuration,
     * with versioning support added.
     *
     * @remarks
     * This object is based on the user configuration and extended to include
     * locales, rewrites, and versioning-aware settings. It is typed as
     * {@link VitepressConfigInterface}.
     *
     * @see VitepressConfigInterface
     * @since 2.0.0
     */

    readonly vitepressConfig: VitepressConfigInterface;

    /**
     * List of all available documentation versions.
     *
     * @remarks
     * This array is populated during initialization (`init()`) by reading the archive
     * and sources directories. Each element is a version string (e.g., `"1.0"`, `"2.0"`).
     *
     * @since 2.0.0
     */

    readonly versionsList: Array<string> = [];

    /**
     * Maps locale keys to their effective base paths.
     *
     * @remarks
     * - Keys are the locale identifiers as defined in the user configuration
     *   (e.g., `"de"`, `"root"`).
     * - Values are the corresponding effective base paths or link prefixes
     *   used inside the generated VitePress config.
     * - The `"root"` locale always maps to the default language of the site.
     *
     * This mapping is used internally to resolve and normalize locale-based
     * routing for both source files and versioned archives.
     *
     * @example
     * ```ts
     * localesMap = {
     *   en: "root",
     *   de: "de"
     * };
     * ```
     *
     * @since 2.0.0
     */

    readonly localesMap: Record<string, string> = {};

    /**
     * Creates an instance of `StateModel`.
     *
     * @param configuration - Optional configuration object; defaults to {@link defaultConfiguration}.
     *
     * @throws Will throw an error if the sources directory does not exist.
     *
     * @remarks
     * Initializes the state of the documentation project by:
     * - Extracting `sources` and `archive` from the provided configuration.
     * - Constructing full paths for `root`, `sourcesPath`, and `archivePath`.
     * - Validating that the sources directory exists.
     * - Ensuring the archive directory exists and creating a `.gitkeep` file if necessary.
     * - Creating a VitePress configuration object with versioning support.
     *
     * @since 2.0.0
     */

    constructor(readonly configuration: ConfigurationInterface = defaultConfiguration) {
        const { sources, archive } = configuration.versionsConfig;

        this.sources = sources;
        this.archive = archive;
        this.versionsConfig = configuration.versionsConfig;

        this.root = join(process.cwd(), process.argv[3] ?? '', configuration.srcDir ?? '');
        this.sourcesPath = join(this.root, this.sources);
        this.archivePath = join(this.root, this.archive);

        if (!existsSync(this.sourcesPath)) {
            console.error(xterm.red('[ viteplus ]'), `Source directory ${ this.sourcesPath } does not exist\n`);
            throw new Error(`Source directory ${ this.sourcesPath } does not exist`);
        }

        this.makeArchiveDirectory(this.archivePath);
        this.vitepressConfig = this.createVitepressConfig();
    }

    /**
     * Initializes the state model by scanning archive directory and setting up locale configuration.
     *
     * @returns The current instance for method chaining.
     *
     * @remarks
     * This method performs the initial setup sequence for a multi-version documentation system
     * by discovering available versions and preparing the locale infrastructure. It executes
     * three primary operations:
     *
     * 1. **Root Locale Initialization**: Sets up the root locale entry in {@link vitepressConfig.locales}
     *    with an empty theme configuration, establishing the foundation for all locale-specific settings
     * 2. **Version Discovery**: Scans {@link archivePath} using {@link readdirSync} to identify all
     *    subdirectories, which represent available documentation versions. Each subdirectory name
     *    is added to {@link versionsList}
     * 3. **Locale Map Setup**: Calls {@link initializeLocalesMap} to establish the locale mapping
     *    structure and populate versioned locale entries
     *
     * The archive directory structure is expected to contain version folders:
     * ```
     * archive/
     *   ├── v1.0/
     *   ├── v2.0/
     *   └── latest/
     * ```
     *
     * Each subdirectory discovered becomes a version entry, enabling the system to generate
     * versioned locale configurations and routing structures for multi-version documentation.
     *
     * The root locale is initialized first to ensure a consistent base exists before user-defined
     * locale configurations are applied through {@link initializeLocalesMap}.
     *
     * Method chaining support allows for fluent initialization patterns, making it easy to
     * combine multiple setup operations in a readable sequence.
     *
     * @example
     * ```ts
     * // Basic initialization
     * const state = new StateModel(config);
     * state.init();
     *
     * console.log(state.versionsList);
     * // ['v1.0', 'v2.0', 'v3.0', 'latest']
     *
     * console.log(state.vitepressConfig.locales['root']);
     * // { themeConfig: {} }
     *
     * // Method chaining pattern
     * const state = new StateModel(config)
     *   .init();
     *
     * console.log(`Initialized with ${state.versionsList.length} versions`);
     *
     * // Use case: Dynamic version detection
     * const config = {
     *   versionsConfig: {
     *     sources: 'src',
     *     archive: 'versions'
     *   },
     *   locales: {
     *     root: { lang: 'en-US', label: 'English' },
     *     '/de/': { lang: 'de-DE', label: 'Deutsch' }
     *   }
     * };
     *
     * const state = new StateModel(config).init();
     *
     * // Archive structure:
     * // versions/
     * //   ├── v1.0.0/
     * //   ├── v2.0.0/
     * //   └── latest/
     *
     * console.log(state.versionsList);
     * // ['v1.0.0', 'v2.0.0']
     *
     * // Locale entries created for each version
     * console.log(Object.keys(state.vitepressConfig.locales));
     * // ['root', 'v1.0.0', 'v2.0.0', 'latest', '/de/', 'de/v1.0.0', 'de/v2.0.0']
     *
     * // Use case: Error handling
     * try {
     *   const state = new StateModel(config).init();
     *   if (state.versionsList.length === 0) {
     *     console.warn('No versions found in archive');
     *   }
     * } catch (error) {
     *   console.error('Failed to initialize state:', error);
     * }
     * ```
     *
     * @see archivePath
     * @see readdirSync
     * @see versionsList
     * @see vitepressConfig
     * @see initializeLocalesMap
     *
     * @since 2.0.0
     */

    init(): this {
        this.vitepressConfig.locales.root = { themeConfig: {} };
        const versionFolders = readdirSync(this.archivePath, { withFileTypes: true })
            .filter((entry: Dirent) => entry.isDirectory())
            .map((entry: Dirent) => entry.name);

        this.versionsList.push(...versionFolders);
        this.initializeLocalesMap();

        return this;
    }

    /**
     * Initializes the locale entries in the VitePress configuration and builds a mapping
     * of locales to their links for all versions.
     *
     * @remarks
     * - Adds a `root` locale entry.
     * - Copies all user-defined locales into the VitePress config.
     * - Populates `localesMap` with locale keys and their corresponding links (or folder names).
     * - Ensures that for each documentation version, a locale entry exists in the VitePress config.
     * - Handles both root and non-root locales, creating versioned paths automatically.
     *
     * @since 2.0.0
     */

    private initializeLocalesMap(): void {
        const locales = this.vitepressConfig.locales;
        const userLocales = this.configuration.locales;

        locales['root'] = {};
        if (Object.keys(userLocales).length > 0) {
            const keys = Object.keys(userLocales);
            const rootLocaleKey = 'root' in userLocales ? 'root' : keys[0];

            for (const key of keys) {
                const index = getLanguageOnly(userLocales[key].lang ?? key);
                for (const version of this.versionsList) {
                    if(key === rootLocaleKey) continue;
                    const versionPath = posix.join(index, version);
                    locales[versionPath] = {};
                }

                if (key === rootLocaleKey) {
                    this.localesMap[userLocales[key].link ?? index] = 'root';
                } else {
                    locales[key] = {};
                    this.localesMap[userLocales[key].link ?? index] = key;
                }
            }
        }

        for (const version of this.versionsList) {
            locales[version] = {};
        }
    }

    /**
     * Ensures that the archive directory exists.
     *
     * @param path - The path to the archive directory.
     *
     * @remarks
     * - If the directory does not exist, it is created.
     * - A `.gitkeep` file is also added to ensure the directory is tracked by Git.
     *
     * @since 2.0.0
     */

    private makeArchiveDirectory(path: string): void {
        if (!path) return;

        if (!existsSync(path)) {
            mkdirSync(path);
            writeFileSync(join(path, '.gitkeep'), '');
        }
    }

    /**
     * Creates a VitePress configuration object from the user-provided configuration.
     *
     * @returns A `VitepressConfigInterface` object with versioning support added.
     *
     * @remarks
     * - Copies all configuration properties except for `locales`, `rewrites`, `themeConfig`, and `versionsConfig`.
     * - Initializes excluded properties (except `versionsConfig`) with empty objects.
     * - Returns a configuration object typed as {@link VitepressConfigInterface}, ready for VitePress usage.
     *
     * @see VitepressConfigInterface
     * @since 2.0.0
     */

    private createVitepressConfig(): VitepressConfigInterface {
        const result: Record<string, unknown> = {};
        const exclude: Array<keyof ConfigurationInterface> = [
            'locales',
            'rewrites',
            'themeConfig',
            'versionsConfig'
        ];

        for (const key of Object.keys(this.configuration) as Array<keyof ConfigurationInterface>) {
            if (!exclude.includes(key)) {
                result[key] = this.configuration[key];
            } else if (key === 'themeConfig') {
                const themeConfig = this.configuration.themeConfig ?? {};
                result.themeConfig = Object.fromEntries(
                    Object.entries(themeConfig).filter(
                        ([ prop ]) => prop !== 'nav' && prop !== 'sidebar'
                    )
                );
            } else if (key !== 'versionsConfig') {
                result[key] = {};
            }
        }

        return <VitepressConfigInterface><unknown>result;
    }
}
