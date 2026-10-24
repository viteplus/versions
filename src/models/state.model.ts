/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { ConfigurationInterface } from '@interfaces/configuration.interface';
import type { VersionsConfigInterface, VitepressConfigInterface } from '@interfaces/configuration.interface';

/**
 * Imports
 */

import { Injectable } from '@remotex-labs/xinject';
import { xterm } from '@remotex-labs/xansi/xterm.component';
import { getLanguageOnly } from '@components/locale.component';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { isAbsolute, join, posix, relative, resolve, sep } from 'path';
import { defaultConfiguration } from '@constants/configuration.constant';

/**
 * Manages the state of a versioned VitePress documentation project.
 *
 * @remarks
 * The `StateModel` class is responsible for:
 * - Managing source and archive directories for versioned documentation.
 * - Initializing the VitePress configuration (`VitepressConfigInterface`) from
 *   a provided {@link ConfigurationInterface}.
 * - Maintaining a list of documentation versions and the routes each version publishes.
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
     * The names of every published version.
     *
     * @remarks
     * These are the names of {@link versionDirs} in the order that `init()` adds them:
     * the current version first, then every folder under {@link archivePath},
     * then every version that `versionsConfig.versions` gives its own `path`.
     *
     * @example
     * ```ts
     * state.versionsList; // [ 'next', 'v2.x', 'v1.x' ]
     * ```
     *
     * @since 2.0.0
     */

    get versionsList(): Array<string> {
        return Object.keys(this.versionDirs);
    }

    /**
     * Maps each version name to its folder, relative to {@link root} and in POSIX form.
     *
     * @remarks
     * The rewrites read every page of a version from this folder and publish it under the version name.
     *
     * @example
     * ```ts
     * state.versionDirs; // { next: 'src', 'v2.x': 'archive/v2.x', 'v0.x': 'legacy/v0' }
     * ```
     *
     * @see https://github.com/viteplus/versions/issues/55
     * @since 3.0.0
     */

    readonly versionDirs: Record<string, string> = {};

    /**
     * The name of the stable version.
     *
     * @remarks
     * It is `versionsConfig.latest`, or `versionsConfig.current` when that is empty.
     * Its pages are served at the root of the site without a version segment,
     * and the switchers tag this version as the latest one.
     *
     * @example
     * ```ts
     * state.latest; // 'v2.x'
     * ```
     *
     * @see https://github.com/viteplus/versions/issues/55
     * @since 3.0.0
     */

    latest: string = '';

    /**
     * Maps each version name to the text that the switchers show for it.
     *
     * @remarks
     * The text is the `label` of `versionsConfig.versions`, falling back to the version name.
     *
     * @example
     * ```ts
     * state.labels; // { 'v2.x': 'v2.x', 'v1.x': 'v1.x (LTS)' }
     * ```
     *
     * @see https://github.com/viteplus/versions/issues/55
     * @since 3.0.0
     */

    readonly labels: Record<string, string> = {};

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
     * Maps each version label to the routes that version publishes.
     *
     * @remarks
     * Keys are the names of {@link versionsList}.
     * Values are the published routes of that version, the same strings VitePress
     * receives back from `vitepressConfig.rewrites`.
     *
     * The version switcher reads this record to tell whether the page a reader is on
     * also exists in the version they picked, so it can fall back to that version's
     * home page instead of linking at a route that returns a 404.
     *
     * The record stays empty until `parseRoutesComponent` fills it.
     *
     * @example
     * ```ts
     * routesMap = {
     *   'v2.0.x': [ 'v2.0.x/index.md', 'v2.0.x/guide/index.md' ],
     *   'v1.0.x': [ 'v1.0.x/index.md', 'v1.0.x/release.md' ]
     * };
     * ```
     *
     * @since 2.1.0
     */

    readonly routesMap: Record<string, Array<string>> = {};

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

        if (!existsSync(this.sourcesPath)) this.fail(`Source directory ${ this.sourcesPath } does not exist`);

        this.makeArchiveDirectory(this.archivePath);
        this.vitepressConfig = this.createVitepressConfig();
    }

    /**
     * Initializes the state model by collecting the published versions and setting up the locale entries.
     *
     * @returns The current instance for method chaining
     *
     * @throws Error - When two versions share a name, when a `path` is no folder inside {@link root},
     * or when `versionsConfig.latest` or a key of `versionsConfig.versions` names no version
     *
     * @remarks
     * Every version is a name and a folder in {@link versionDirs}:
     * the current version reads from `sources`, an archived version from its folder under {@link archivePath},
     * and a version with its own `path` from that folder.
     * A misspelled name fails the build instead of leaving a version unpublished.
     *
     * @example
     * ```ts
     * // archive/ holds v1.0.x, and versionsConfig.current is 'v2.0.x'
     * const state = new StateModel(config).init();
     *
     * state.versionsList;                         // [ 'v2.0.x', 'v1.0.x' ]
     * state.latest;                               // 'v2.0.x'
     * Object.keys(state.vitepressConfig.locales); // [ 'root', 'v1.0.x' ], since the latest one is served at the root
     * ```
     *
     * @see versionDirs
     * @see initializeLocalesMap
     *
     * @since 2.0.0
     */

    init(): this {
        const { current, latest, versions } = this.versionsConfig;
        this.vitepressConfig.locales.root = { themeConfig: {} };

        this.addVersion(current, this.sources);
        for (const entry of readdirSync(this.archivePath, { withFileTypes: true })) {
            if (entry.isDirectory()) this.addVersion(entry.name, posix.join(this.archive, entry.name));
        }

        for (const [ name, { path }] of Object.entries(versions)) {
            if (path) this.addVersion(name, this.versionFolder(name, path));
        }

        for (const name of [ latest, ...Object.keys(versions) ]) {
            if (name && !this.versionDirs[name]) this.fail(`Version ${ name } is neither the current version nor an archive folder`);
        }

        this.latest = latest || current;
        for (const version of this.versionsList) this.labels[version] = versions[version]?.label ?? version;
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
                    if (key === rootLocaleKey || version === this.latest) continue;
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
            if (version !== this.latest) locales[version] = {};
        }
    }

    /**
     * Publishes a version from a folder.
     *
     * @param name - The name of the version, which becomes its URL segment
     * @param folder - The folder of the version, relative to {@link root}
     *
     * @throws Error - When another version already carries the name
     *
     * @remarks
     * Two versions with one name would publish over each other's pages,
     * such as an archive folder named after the current version.
     *
     * @since 3.0.0
     */

    private addVersion(name: string, folder: string): void {
        const taken = this.versionDirs[name];
        if (taken) this.fail(`Version ${ name } is published from both ${ taken } and ${ folder }, rename one of them`);

        this.versionDirs[name] = folder;
    }

    /**
     * Resolves the `path` of a version to its folder relative to {@link root}.
     *
     * @param name - The name of the version, for the error message
     * @param path - The `path` setting of the version
     * @returns The folder in POSIX form
     *
     * @throws Error - When the path is no existing folder inside {@link root}
     *
     * @remarks
     * VitePress builds only the files under its source directory, so a folder outside {@link root} is rejected.
     *
     * @since 3.0.0
     */

    private versionFolder(name: string, path: string): string {
        const folder = relative(this.root, resolve(this.root, path)).split(sep).join('/');
        if (!folder || folder.startsWith('..') || isAbsolute(folder) || !existsSync(join(this.root, folder))) {
            this.fail(`Path ${ path } of version ${ name } has to be an existing folder inside ${ this.root }`);
        }

        return folder;
    }

    /**
     * Reports a configuration error and stops loading the configuration.
     *
     * @param message - The description of the error
     *
     * @throws Error - Always, carrying the given message
     *
     * @remarks
     * The message goes to the console in red first,
     * so it stays visible above the stack trace that VitePress prints for the thrown error.
     *
     * @since 3.0.0
     */

    private fail(message: string): never {
        console.error(xterm.red('[ viteplus ]'), `${ message }\n`);
        throw new Error(message);
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
