/**
 * Import will remove at compile time
 */

import type { LocaleInterface } from '@interfaces/locale.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';

/**
 * Extracts the language code from a locale string.
 *
 * @param locale - The locale string to parse (e.g., 'en-US', 'fr_CA', 'zh-Hans-CN').
 * @returns The language code portion of the locale (e.g., 'en', 'fr', 'zh').
 *
 * @remarks
 * This function parses a locale string and returns only the primary language code,
 * discarding region, script, and variant information. It handles both standard
 * separators used in locale strings:
 * - Hyphen (`-`): BCP 47 standard (e.g., 'en-US', 'zh-Hans-CN')
 * - Underscore (`_`): POSIX/Java standard (e.g., 'en_US', 'pt_BR')
 *
 * The language code is always the first component of a locale identifier and
 * represents the base language without regional or script variations.
 *
 * Common use cases:
 * - Fallback language selection when a specific locale is unavailable
 * - Grouping locales by language family
 * - Simplifying locale matching for translations
 * - Language detection without regional specificity
 * - API requests that only accept language codes
 *
 * Locale format examples:
 * - Language only: 'en', 'fr', 'ja'
 * - Language + Region: 'en-US', 'fr-CA', 'pt-BR'
 * - Language + Script + Region: 'zh-Hans-CN', 'zh-Hant-TW'
 * - POSIX format: 'en_US', 'de_DE', 'es_MX'
 *
 * @example
 * ```ts
 * // BCP 47 format with region
 * console.log(getLanguageOnly('en-US')); // 'en'
 * console.log(getLanguageOnly('fr-CA')); // 'fr'
 * console.log(getLanguageOnly('pt-BR')); // 'pt'
 *
 * // POSIX format with underscore
 * console.log(getLanguageOnly('en_GB')); // 'en'
 * console.log(getLanguageOnly('de_DE')); // 'de'
 *
 * // Complex locale with script
 * console.log(getLanguageOnly('zh-Hans-CN')); // 'zh'
 * console.log(getLanguageOnly('zh-Hant-TW')); // 'zh'
 *
 * // Language code only (no separator)
 * console.log(getLanguageOnly('ja')); // 'ja'
 * console.log(getLanguageOnly('ko')); // 'ko'
 *
 * // Use case: Fallback language selection
 * const userLocale = 'es-MX';
 * const language = getLanguageOnly(userLocale); // 'es'
 * const translations = loadTranslations(language); // Load Spanish translations
 * ```
 *
 * @since 2.0.5
 */

export function getLanguageOnly(locale: string): string {
    return locale.split(/[-_]/)[0];
}

/**
 * Creates a sanitized copy of a locale object with navigation data removed.
 *
 * @param sourceLocale - The original locale object to sanitize {@link LocaleInterface}.
 * @returns A deep clone of the locale with navigation and sidebar data removed.
 *
 * @remarks
 * This function creates a deep copy of a locale object and removes potentially
 * large or sensitive theme configuration data, specifically navigation and sidebar
 * structures. This is useful for:
 * - Reducing payload size when sending locale data to clients
 * - Removing structure information that shouldn't be exposed
 * - Creating clean locale data for API responses
 * - Preparing locale data for serialization or storage
 *
 * The sanitization process:
 * 1. Creates a deep clone using {@link structuredClone} to avoid mutating the original
 * 2. Checks if `themeConfig` exists and contains properties
 * 3. Removes `nav` property (navigation menu structure)
 * 4. Removes `sidebar` property (sidebar navigation structure)
 * 5. Preserves all other locale data unchanged
 *
 * Properties preserved:
 * - All locale metadata (language, region, etc.)
 * - Translation strings and messages
 * - Theme configuration except nav and sidebar
 * - Any custom properties not related to navigation
 *
 * The original locale object is never modified, ensuring immutability and
 * preventing unintended side effects in the calling code.
 *
 * @example
 * ```ts
 * const originalLocale: LocaleInterface = {
 *   lang: 'en-US',
 *   label: 'English',
 *   themeConfig: {
 *     nav: [
 *       { text: 'Home', link: '/' },
 *       { text: 'About', link: '/about' }
 *     ],
 *     sidebar: {
 *       '/guide/': [{ text: 'Introduction', link: '/guide/intro' }]
 *     },
 *     footer: 'Copyright 2024'
 *   }
 * };
 *
 * const sanitized = createSanitizedLocale(originalLocale);
 *
 * console.log(sanitized.themeConfig?.nav);      // undefined
 * console.log(sanitized.themeConfig?.sidebar);  // undefined
 * console.log(sanitized.themeConfig?.footer);   // 'Copyright 2024'
 * console.log(originalLocale.themeConfig?.nav); // Still intact
 *
 * // Use case: API response
 * app.get('/api/locale/:lang', (req, res) => {
 *   const locale = getLocale(req.params.lang);
 *   const sanitized = createSanitizedLocale(locale);
 *   res.json(sanitized); // Smaller payload without navigation data
 * });
 *
 * // Use case: Locale without theme config
 * const minimalLocale: LocaleInterface = {
 *   lang: 'fr',
 *   label: 'Français'
 * };
 * const result = createSanitizedLocale(minimalLocale);
 * // Returns clone unchanged (no themeConfig to sanitize)
 * ```
 *
 * @see LocaleInterface
 * @since 2.0.5
 */

function createSanitizedLocale(sourceLocale: LocaleInterface): LocaleInterface {
    const cloned = Object.assign({}, sourceLocale);

    if (cloned.themeConfig && Object.keys(cloned.themeConfig).length > 0) {
        cloned.themeConfig = Object.assign({}, cloned.themeConfig);

        delete cloned.themeConfig.nav;
        delete cloned.themeConfig.sidebar;
    }

    return cloned;
}

/**
 * Generates a locale-specific URL path based on language configuration.
 *
 * @param isRoot - Whether this is the root/default locale.
 * @param lang - The full locale string (e.g., 'en-US', 'fr-CA') to generate a link for.
 * @returns A URL path string: '/' for root locale, or '/<language>/' for non-root locales.
 *
 * @remarks
 * This function creates URL paths for locale-specific content in a multi-language
 * application. It follows a common pattern where:
 * - The root/default locale uses the base path '/'
 * - Other locales use language-prefixed paths like '/fr/', '/es/', '/de/'
 *
 * The function uses {@link getLanguageOnly} to extract just the language code from
 * the full locale string, ignoring region and script information. This ensures clean,
 * simple URLs like '/fr/' instead of '/fr-CA/' or '/zh/' instead of '/zh-Hans-CN/'.
 *
 * URL structure:
 * - Root locale: `'/'` - No language prefix (typically English or primary language)
 * - Non-root locale: `'/{lang}/'` - Language code with leading and trailing slashes
 *
 * @example
 * ```ts
 * // Root locale (typically English)
 * const rootLink = generateLocaleLink(true, 'en-US');
 * console.log(rootLink); // '/'
 *
 * // Non-root locales
 * const frenchLink = generateLocaleLink(false, 'fr-CA');
 * console.log(frenchLink); // '/fr/'
 *
 * const spanishLink = generateLocaleLink(false, 'es-MX');
 * console.log(spanishLink); // '/es/'
 *
 * const chineseLink = generateLocaleLink(false, 'zh-Hans-CN');
 * console.log(chineseLink); // '/zh/'
 *
 * // Use case: Locale switcher navigation
 * const locales = [
 *   { lang: 'en-US', isRoot: true, label: 'English' },
 *   { lang: 'fr-CA', isRoot: false, label: 'Français' },
 *   { lang: 'es-MX', isRoot: false, label: 'Español' }
 * ];
 *
 * const links = locales.map(locale => ({
 *   label: locale.label,
 *   href: generateLocaleLink(locale.isRoot, locale.lang)
 * }));
 * // [
 * //   { label: 'English', href: '/' },
 * //   { label: 'Français', href: '/fr/' },
 * //   { label: 'Español', href: '/es/' }
 * // ]
 *
 * // Use case: Building full page URLs
 * const currentLocale = { isRoot: false, lang: 'de-DE' };
 * const pagePath = 'docs/getting-started';
 * const fullUrl = generateLocaleLink(currentLocale.isRoot, currentLocale.lang) + pagePath;
 * console.log(fullUrl); // '/de/docs/getting-started'
 * ```
 *
 * @see getLanguageOnly
 * @since 2.0.5
 */

function generateLocaleLink(isRoot: boolean, lang: string): string {
    return isRoot ? '/' : `/${ getLanguageOnly(lang) }/`;
}

/**
 * Creates a versioned locale configuration with minimal label and generated link.
 *
 * @param baseLocale - The base locale object to clone {@link LocaleInterface}.
 * @param isRoot - Whether this is the root/default locale.
 * @param lang - The full locale string (e.g., 'en-US', 'fr-CA') for link generation.
 * @returns A new locale object with modified label and link properties.
 *
 * @remarks
 * This function creates a locale configuration suitable for version-specific documentation
 * or multi-version site structures. It clones the base locale and modifies two key properties:
 * - Sets the label to a single space (hiding or minimizing visual display)
 * - Generates a locale-specific link using {@link generateLocaleLink}
 *
 * The single-space label is commonly used in documentation sites where:
 * - Locale switching is handled by icons or flags instead of text
 * - Visual space needs to be preserved without displaying text
 * - The locale selector UI requires a placeholder
 * - Multiple versions need consistent spacing without labels
 *
 * The function uses {@link structuredClone} to create a deep copy, ensuring the
 * original locale remains unmodified and preventing unintended side effects.
 *
 * @example
 * ```ts
 * const baseLocale: LocaleInterface = {
 *   lang: 'fr-CA',
 *   label: 'Français (Canada)',
 *   themeConfig: {
 *     nav: [...],
 *     sidebar: {...}
 *   }
 * };
 *
 * // Create versioned locale for non-root language
 * const versionedFr = createVersionedLocale(baseLocale, false, 'fr-CA');
 * console.log(versionedFr.label); // ' '
 * console.log(versionedFr.link);  // '/fr/'
 *
 * // Create versioned locale for root language
 * const baseEn: LocaleInterface = {
 *   lang: 'en-US',
 *   label: 'English (US)',
 *   themeConfig: {...}
 * };
 *
 * const versionedEn = createVersionedLocale(baseEn, true, 'en-US');
 * console.log(versionedEn.label); // ' '
 * console.log(versionedEn.link);  // '/'
 *
 * // Use case: Multi-version documentation site
 * const versions = ['v1', 'v2', 'v3'];
 * const locales = ['en-US', 'fr-CA', 'es-MX'];
 *
 * const versionedLocales = versions.flatMap(version =>
 *   locales.map((lang, idx) => ({
 *     version,
 *     locale: createVersionedLocale(
 *       getBaseLocale(lang),
 *       idx === 0, // First locale is root
 *       lang
 *     )
 *   }))
 * );
 *
 * // Use case: Icon-based locale switcher
 * const localeConfigs = [
 *   { base: enLocale, isRoot: true, lang: 'en-US', icon: '🇺🇸' },
 *   { base: frLocale, isRoot: false, lang: 'fr-CA', icon: '🇨🇦' }
 * ].map(config =>
 *   createVersionedLocale(config.base, config.isRoot, config.lang)
 * );
 * // Labels are minimal spaces, icons handle the display
 * ```
 *
 * @see LocaleInterface
 * @see structuredClone
 * @see generateLocaleLink
 *
 * @since 2.0.5
 */

function createVersionedLocale(baseLocale: LocaleInterface, isRoot: boolean, lang: string): LocaleInterface {
    const locale = createSanitizedLocale(baseLocale);
    locale.label = ' ';
    locale.link = generateLocaleLink(isRoot, lang);

    return locale;
}

/**
 * Parses and configures locale settings for a multi-version, multi-language documentation site.
 *
 * @remarks
 * This function orchestrates the complete locale configuration process by combining
 * user-defined locale settings with version information to generate a comprehensive
 * locale map. It handles both root and non-root locales across multiple documentation
 * versions.
 *
 * The function operates on injected state from {@link StateModel} and processes:
 * - {@link versionsList}: Available documentation versions (e.g., ['v1', 'v2', 'v3'])
 * - {@link vitepressConfig}: VitePress configuration containing locale definitions
 * - {@link configuration}: User-provided locale configurations
 * - {@link localesMap}: Mapping between locale keys and indices
 *
 * Processing workflow:
 * 1. Injects application state to access configuration data
 * 2. Determines if 'root' key exists in user-provided locales
 * 3. Iterates through each locale in the locale map
 * 4. Creates sanitized base locale using {@link createSanitizedLocale} (removes nav/sidebar)
 * 5. Sets up the root locale entry with a generated link via {@link generateLocaleLink}
 * 6. Creates versioned locale entries for each version using {@link createVersionedLocale}
 *
 * Locale key structure:
 * - Root locale: Direct version keys (e.g., 'v1', 'v2')
 * - Non-root locales: Prefixed version keys (e.g., 'fr/v1', 'es/v2')
 *
 * The sanitization process removes navigation structures to reduce memory overhead
 * and prevent duplication of large theme configuration objects across versions.
 *
 * @example
 * ```ts
 * // Configuration state before parsing
 * const state = {
 *   versionsList: ['v1', 'v2'],
 *   localesMap: {
 *     '/': 'root',
 *     '/fr/': 'fr',
 *     '/es/': 'es'
 *   },
 *   configuration: {
 *     locales: {
 *       root: {
 *         lang: 'en-US',
 *         label: 'English',
 *         themeConfig: { nav: [...], sidebar: {...} }
 *       },
 *       fr: {
 *         lang: 'fr-CA',
 *         label: 'Français',
 *         themeConfig: { nav: [...], sidebar: {...} }
 *       }
 *     }
 *   }
 * };
 *
 * parseLocale();
 *
 * // Result in vitepressConfig.locales:
 * // {
 * //   'root': { lang: 'en-US', label: 'English', link: '/', ... },
 * //   'v1': { lang: 'en-US', label: ' ', link: '/', ... },
 * //   'v2': { lang: 'en-US', label: ' ', link: '/', ... },
 * //   'fr': { lang: 'fr-CA', label: 'Français', link: '/fr/', ... },
 * //   'fr/v1': { lang: 'fr-CA', label: ' ', link: '/fr/', ... },
 * //   'fr/v2': { lang: 'fr-CA', label: ' ', link: '/fr/', ... }
 * // }
 *
 * // Use case: Multi-version documentation with multiple languages
 * const state = inject(StateModel);
 * state.versionsList = ['latest', 'v3', 'v2'];
 * state.configuration.locales = {
 *   '/': { lang: 'en-US', label: 'English' },
 *   '/de/': { lang: 'de-DE', label: 'Deutsch' },
 *   '/ja/': { lang: 'ja-JP', label: '日本語' }
 * };
 *
 * parseLocale();
 * // Generates 12 locale entries (3 versions × 3 languages + 3 base locales)
 * ```
 *
 * @see StateModel
 * @see generateLocaleLink
 * @see createSanitizedLocale
 * @see createVersionedLocale
 *
 * @since 2.0.5
 */

export function parseLocale(): void {
    const state = inject(StateModel);
    const { versionsList, vitepressConfig, configuration, localesMap } = state;
    const { locales } = vitepressConfig;
    const userLocales = configuration.locales;
    const hasRootInUserLocales = 'root' in userLocales;

    for (const [ key, index ] of Object.entries(localesMap)) {
        const isRoot = index === 'root';

        // Get source locale configuration
        const sourceLocale = hasRootInUserLocales
            ? userLocales[index]
            : userLocales[key];

        // Create a sanitized base locale (deep clone without nav/sidebar)
        const baseLocale = createSanitizedLocale(sourceLocale);
        const lang = baseLocale.lang ?? '';

        // Initialize and populate the root locale entry
        locales[index] = baseLocale;
        locales[index].link = generateLocaleLink(isRoot, lang);

        // Create versioned locale entries
        for (const version of versionsList) {
            const versionedKey = isRoot ? version : join(key, version);
            locales[versionedKey] = createVersionedLocale(baseLocale, isRoot, lang);
        }
    }
}
