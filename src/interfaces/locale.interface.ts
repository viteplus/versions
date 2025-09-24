/**
 * Import will remove at compile time
 */

import type { LocaleSpecificConfig } from 'vitepress';
import type { ThemeInterface } from '@interfaces/theme.interface';

/**
 * Represents a locale-specific configuration for a VitePress site.
 *
 * @remarks
 * Extends VitePress's `LocaleSpecificConfig` with a custom {@link ThemeInterface}.
 * Adds optional properties:
 * - `link` — the base URL or path for this locale.
 * - `label` — a human-readable label for the locale (e.g., "English", "Deutsch").
 *
 * This interface allows configuring per-locale theme settings, navigation,
 * sidebar, and other locale-specific behavior.
 *
 * @example
 * ```ts
 * const enLocale: LocaleInterface = {
 *   link: "/en/",
 *   label: "English",
 *   themeConfig: {
 *     nav: [{ text: "Home", link: "/en/" }],
 *     sidebar: { "/en/guide/": [{ text: "Intro", link: "/en/guide/" }] }
 *   }
 * };
 * ```
 *
 * @since 2.0.0
 */

export interface LocaleInterface extends LocaleSpecificConfig<ThemeInterface> {
    /**
     * The base path for the locale.
     *
     * @default undefined
     * @since 2.0.0
     */

    link?: string;

    /**
     * A human-readable label for the locale.
     *
     * @default undefined
     * @since 2.0.0
     */

    label?: string;
}

/**
 * Represents a mapping of locale codes to their corresponding locale configurations.
 *
 * @remarks
 * The keys are locale codes (e.g., `"en"`, `"de"`), and the values are `LocaleInterface` objects.
 * Useful for multi-language or localized documentation setups in VitePress.
 *
 * @example
 * ```ts
 * const locales: LocalesInterface = {
 *   en: { link: "/en/", label: "English" },
 *   de: { link: "/de/", label: "Deutsch" }
 * };
 * ```
 *
 * @see LocaleInterface
 * @since 2.0.0
 */

export interface LocalesInterface {
    [key: string]: LocaleInterface;
}
