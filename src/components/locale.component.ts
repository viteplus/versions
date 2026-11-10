/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { LocaleInterface } from '@interfaces/locale.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';

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
 * Creates a copy of a locale without its navigation.
 *
 * @param sourceLocale - The locale of the user configuration {@link LocaleInterface}
 * @returns A shallow copy of the locale with its own `themeConfig` that holds no `nav` or `sidebar`
 *
 * @remarks
 * The plugin builds the `nav` and `sidebar` of every locale entry itself.
 * Every copy gets its own `themeConfig` object, so writing the navigation of one entry never reaches
 * another entry or the user configuration. Values inside `themeConfig`, functions included, are shared by reference.
 *
 * @example
 * ```ts
 * const locale = createSanitizedLocale({ lang: 'de-DE', themeConfig: { nav: [], footer: 'Impressum' } });
 * // { lang: 'de-DE', themeConfig: { footer: 'Impressum' } }
 * ```
 *
 * @see LocaleInterface
 * @since 2.0.5
 */

function createSanitizedLocale(sourceLocale: LocaleInterface = {}): LocaleInterface {
    const cloned = { ...sourceLocale };
    if (cloned.themeConfig) {
        cloned.themeConfig = { ...cloned.themeConfig };
        delete cloned.themeConfig.nav;
        delete cloned.themeConfig.sidebar;
    }

    return cloned;
}

/**
 * Builds the link of a locale from its URL prefix.
 *
 * @param prefix - The URL prefix of the locale, empty for the root locale
 * @returns `/` for the root locale, or `/<prefix>/` for any other
 *
 * @example
 * ```ts
 * generateLocaleLink('');   // '/'
 * generateLocaleLink('de'); // '/de/'
 * ```
 *
 * @since 2.0.5
 */

function generateLocaleLink(prefix: string): string {
    return prefix ? `/${ prefix }/` : '/';
}

/**
 * Creates the locale entry of one version of a locale.
 *
 * @param baseLocale - The locale of the user configuration {@link LocaleInterface}
 * @param prefix - The URL prefix of the locale, empty for the root locale
 * @returns A copy of the locale with a blank label and the link of the locale
 *
 * @remarks
 * The blank label keeps the versioned entry out of the language menu,
 * and the link leads the language menu to the locale.
 *
 * @example
 * ```ts
 * createVersionedLocale({ lang: 'de-DE', label: 'Deutsch' }, 'de');
 * // { lang: 'de-DE', label: ' ', link: '/de/' }
 * ```
 *
 * @see createSanitizedLocale
 * @since 2.0.5
 */

function createVersionedLocale(baseLocale: LocaleInterface, prefix: string): LocaleInterface {
    return { ...createSanitizedLocale(baseLocale), label: ' ', link: generateLocaleLink(prefix) };
}

/**
 * Builds every locale entry of the VitePress configuration.
 *
 * @remarks
 * Every locale gets an entry at its prefix, `root` for the root locale,
 * and one entry per version at `<prefix>/<version>`, the address its pages are published under.
 * The versioned entries come before the entry of their locale, since VitePress picks the first key that matches a page.
 * A site without locales gets an entry for `root` and for every version.
 *
 * Every entry also gets a `themeConfig.logoLink` to the home page of its version, `latest` for `root` and the bare locales,
 * unless the user sets one. The site title would otherwise link to `/`, which no version publishes,
 * and the router would show the not-found page when the title is clicked inside the site.
 *
 * @example
 * ```ts
 * // configuration.locales is { root: { lang: 'en' }, de: { lang: 'de-DE' } }, the versions are v1 and v2
 * parseLocale();
 * Object.keys(vitepressConfig.locales); // [ 'root', 'v1', 'v2', 'de/v1', 'de/v2', 'de' ]
 * ```
 *
 * @see StateModel.localePrefixes
 * @see createVersionedLocale
 *
 * @since 2.0.5
 */

export function parseLocale(): void {
    const { latest, versionsList, vitepressConfig: { locales, base = '/' }, configuration, localePrefixes } = inject(StateModel);
    const withLogoLink = (locale: LocaleInterface, prefix: string, version: string): LocaleInterface => {
        if (configuration.themeConfig?.logoLink || locale.themeConfig?.logoLink) return locale;

        return { ...locale, themeConfig: { ...locale.themeConfig, logoLink: join('/', base, prefix, version, '/') } };
    };

    locales.root = {};
    for (const [ key, prefix ] of Object.entries(localePrefixes)) {
        const baseLocale = createSanitizedLocale(configuration.locales[key]);
        for (const version of versionsList) {
            locales[join(prefix, version)] = withLogoLink(createVersionedLocale(baseLocale, prefix), prefix, version);
        }

        locales[prefix || 'root'] = withLogoLink({ ...baseLocale, link: generateLocaleLink(prefix) }, prefix, latest);
    }

    locales.root = withLogoLink(locales.root, '', latest);
    for (const version of versionsList) locales[version] ??= withLogoLink({}, '', version);
}
