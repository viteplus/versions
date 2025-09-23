/**
 * Import will remove at compile time
 */

import type { DefaultTheme, UserConfig } from 'vitepress';
import type { ThemeInterface } from '@interfaces/theme.interface';
import type { LocalesInterface } from '@interfaces/locale.interface';
import type { DeepPartialType, RequireKeysType } from '@interfaces/function.interface';

/**
 * Defines hooks for version- and locale-specific behavior.
 *
 * @remarks
 * The `rewritesHook` function allows you to programmatically rewrite
 * paths or content based on the documentation version and locale being served.
 *
 * @example
 * ```ts
 * const hooks: VersionsHooksInterface = {
 *   rewritesHook: (source, version, locale) =>
 *     `${version}/${locale}/${source}`
 * };
 * ```
 *
 * @since 2.0.0
 */

export interface VersionsHooksInterface {
    /**
     * A function that rewrites a source path based on version and locale.
     *
     * @param source - The original file path or source string.
     * @param version - The current documentation version (e.g., "2.0").
     * @param locale - The locale code or folder name (e.g., "en", "de").
     *
     * @returns The rewritten path string, which can be used for routing or file organization.
     *
     * @remarks
     * This hook is invoked whenever paths need to be version- and locale-aware,
     * allowing complete control over URL or file structure.
     *
     * @since 2.0.0
     */

    rewritesHook(source: string, version: string, locale: string): string;
}

/**
 * Configuration for a version switcher component.
 *
 * @remarks
 * - `text` is the display label for the version switcher.
 * - `includeCurrentVersion` determines whether the currently active version
 *   should appear in the switcher dropdown.
 *
 * @example
 * ```ts
 * const switcher: VersionsSwitcherInterface = {
 *   text: "Version",
 *   includeCurrentVersion: true
 * };
 * ```
 *
 * @since 2.0.0
 */

export interface VersionsSwitcherInterface {
    /**
     * The display label for the version switcher component.
     *
     * @remarks
     * This text is shown in the UI as the version selector label.
     *
     * @since 2.0.0
     */

    text: string;

    /**
     * Determines whether the currently active version should appear in the switcher dropdown.
     *
     * @remarks
     * If `true`, the current version will be included; if `false`, it will be omitted.
     *
     * @since 2.0.0
     */

    includeCurrentVersion: boolean;
}

/**
 * Configuration for documentation versions.
 *
 * @remarks
 * - `current` specifies the currently active version.
 * - `sources` is the folder or path where current versioned sources reside.
 * - `archive` is the folder or path for archived versions.
 * - `hooks` allows for custom rewriting logic per version.
 * - `versionSwitcher` enables or disables the version switcher, or provides its configuration.
 *
 * @example
 * ```ts
 * const versionsConfig: VersionsConfigInterface = {
 *   current: "2.0",
 *   sources: "src",
 *   archive: "archive",
 *   hooks: {
 *     rewritesHook: (source, version) => `/v${version}/${source}`
 *   },
 *   versionSwitcher: { text: "Version", includeCurrentVersion: true }
 * };
 * ```
 *
 * @since 2.0.0
 */

export interface VersionsConfigInterface {
    /**
     * The currently active documentation version.
     *
     * @remarks
     * Used to determine which version to serve by default and which version
     * should be highlighted in the version switcher.
     *
     * @since 2.0.0
     */

    current: string;

    /**
     * The folder or path where the current versioned sources reside.
     *
     * @since 2.0.0
     */

    sources: string;

    /**
     * The folder or path where archived versions are stored.
     *
     * @since 2.0.0
     */

    archive: string;

    /**
     * Hooks for custom behavior when working with versioned content.
     *
     * @remarks
     * Currently, supports `rewritesHook`, which can programmatically rewrite
     * paths based on version and locale.
     *
     * @see VersionsHooksInterface
     * @since 2.0.0
     */

    hooks: VersionsHooksInterface;

    /**
     * Configuration for the version switcher or `false` to disable it.
     *
     * @remarks
     * If enabled, this object defines the switcher text and whether the
     * current version is included in the switcher options.
     *
     * @see VersionsSwitcherInterface
     * @since 2.0.0
     */

    versionSwitcher: false | VersionsSwitcherInterface;
}

/**
 * Main configuration interface for a VitePress site with extended features.
 *
 * @remarks
 * Extends VitePress's `UserConfig` but overrides:
 * - `locales` to use a strongly typed `LocalesInterface`.
 * - `rewrites` to define path rewrites for the site.
 * - `versionsConfig` to manage documentation versions and the version switcher.
 *
 * @example
 * ```ts
 * const config: ConfigurationInterface = {
 *   locales: {
 *     en: { link: "/en/", label: "English" },
 *     de: { link: "/de/", label: "Deutsch" }
 *   },
 *   rewrites: {
 *     "/old-path": "/new-path"
 *   },
 *   versionsConfig: {
 *     current: "2.0",
 *     sources: "src",
 *     archive: "archive",
 *     hooks: { rewritesHook: (src, ver) => `/v${ver}/${src}` },
 *     versionSwitcher: { text: "Version", includeCurrentVersion: true }
 *   }
 * };
 * ```
 *
 * @since 2.0.0
 */

export interface ConfigurationInterface extends Omit<UserConfig<ThemeInterface>, 'rewrites' | 'locales'> {
    /**
     * Locale-specific configuration for the site.
     *
     * @remarks
     * Uses {@link LocalesInterface} to strongly type each locale's settings.
     *
     * @since 2.0.0
     */

    locales: LocalesInterface;

    /**
     * Path rewrites for the site.
     *
     * @remarks
     * Maps old paths to new paths, enabling URL restructuring without breaking links.
     *
     * @since 2.0.0
     */

    rewrites: Record<string, string>;

    /**
     * Versioning configuration for documentation.
     *
     * @remarks
     * Defines the current version, source directory, archive, hooks, and version switcher behavior.
     *
     * @see VersionsConfigInterface
     * @since 2.0.0
     */

    versionsConfig: VersionsConfigInterface;
}

/**
 * Represents a deeply partial version of the `ConfigurationInterface`.
 *
 * @remarks
 * This type allows any property of `ConfigurationInterface` to be optional,
 * including all nested properties. It is based on the `DeepPartialType` utility type.
 *
 * Useful for scenarios where you want to provide only a subset of the configuration,
 * for example, when overriding default settings or merging user-provided options.
 *
 * @example
 * ```ts
 * const partialConfig: PartialConfigurationType = {
 *   locales: {
 *     en: { label: "English" }
 *   },
 *   versionsConfig: {
 *     versionSwitcher: { text: "Version" }
 *   }
 * };
 * ```
 *
 * @since 2.0.0
 */

export type PartialConfigurationType = DeepPartialType<ConfigurationInterface>;

/**
 * A strongly typed VitePress configuration where specific keys are required.
 *
 * @remarks
 * This type uses {@link RequireKeysType} to ensure that the following properties
 * of `UserConfig<DefaultTheme.Config>` are always present:
 * - `locales`
 * - `rewrites`
 * - `themeConfig`
 *
 * All other properties remain optional, preserving the flexibility of the standard
 * VitePress configuration type.
 *
 * @example
 * ```ts
 * const config: VitepressConfigType = {
 *   locales: { en: { link: "/en/", label: "English" } },
 *   rewrites: { "/old-path": "/new-path" },
 *   themeConfig: { nav: [], sidebar: {} }
 * };
 * ```
 *
 * @since 2.0.0
 */

export type VitepressConfigType = RequireKeysType<UserConfig<DefaultTheme.Config>, 'locales' | 'rewrites' | 'themeConfig'>

/**
 * Strongly typed VitePress configuration interface with custom locales support.
 *
 * @remarks
 * Extends {@link VitepressConfigType} but overrides the `locales` property
 * to use a strongly typed {@link LocalesInterface}.
 *
 * This ensures:
 * - `locales` are fully typed with per-locale configurations.
 * - Other required properties from `VitepressConfigType` (`rewrites`, `themeConfig`) remain enforced.
 * - Remaining properties from `UserConfig<DefaultTheme.Config>` retain their optionality.
 *
 * @example
 * ```ts
 * const config: VitepressConfigInterface = {
 *   locales: {
 *     en: { link: "/en/", label: "English" },
 *     de: { link: "/de/", label: "Deutsch" }
 *   },
 *   rewrites: { "/old-path": "/new-path" },
 *   themeConfig: { nav: [], sidebar: {} }
 * };
 * ```
 *
 * @since 2.0.0
 */

export interface VitepressConfigInterface extends Omit<VitepressConfigType, 'locales'> {
    /**
     * Locale-specific configuration for the site.
     *
     * @remarks
     * Uses {@link LocalesInterface} to strongly type each locale's settings.
     *
     * @since 2.0.0
     */

    locales: LocalesInterface;
}
