/**
 * Import will remove at compile time
 */

import type { PathSegmentsInterface } from '@components/interfaces/sidebar-component.interface';

/**
 * imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';

/**
 * Rewrites a documentation source path using version and locale.
 *
 * @remarks
 * This implementation joins the `version`, `locale`, and original `source`
 * into a normalized POSIX-style path. It is commonly used to generate
 * consistent URLs or filesystem paths for versioned and localized docs.
 *
 * @param source - The original file path or content identifier.
 * @param version - The version string of the documentation (e.g., `"1.2.0"`).
 * @param locale - The locale code (e.g., `"en"`, `"de"`).
 *
 * @returns The rewritten path string in the format `version/locale/source`.
 *
 * @example
 * ```ts
 * rewritesHook("guide/intro.md", "v2.0.0", "en");
 * // → "en/v2.0.0/guide/intro.md"
 * ```
 *
 * @since 2.0.0
 */

export function rewritesHook(source: string, version: string, locale: string): string {
    return join(locale, version, source);
}

/**
 * Extracts locale and version information from URL path segments.
 *
 * @param segments - Array of URL path segments to parse (will be modified by shifting elements).
 * @param localesList - List of valid locale identifiers for matching.
 * @param versionsList - List of valid version identifiers for matching.
 * @returns An object containing extracted language and version {@link PathSegmentsInterface}.
 *
 * @remarks
 * This function parses URL path segments to identify and extract locale and version
 * information, supporting both version-first and locale-first URL structures. The
 * function operates on the segment array destructively, removing matched elements
 * via {@link Array.shift}.
 *
 * **Parsing logic**:
 * 1. If the first segment matches a version → extract it as `version`.
 * 2. If the first segment matches a locale → extract it as `lang`.
 * 3. Return both extracted values (empty strings if not found).
 *
 * **URL patterns supported**:
 * - `/v2.0/guide/` → `{ lang: '', version: 'v2.0' }`
 * - `/fr/v2.0/guide/` → `{ lang: 'fr', version: 'v2.0' }`
 * - `/fr/guide/` → `{ lang: 'fr', version: '' }`
 * - `/guide/` → `{ lang: '', version: '' }`
 *
 * The segment array is mutated during extraction, with matched segments removed
 * from the beginning. This allows the following processing to work with the remaining
 * path components.
 *
 * @example
 * ```ts
 * const localesList = ['en', 'fr', 'de'];
 * const versionsList = ['v1.0', 'v2.0', 'latest'];
 *
 * // Version-first pattern
 * const segments1 = ['v2.0', 'guide', 'intro'];
 * const result1 = extractLocale(segments1, localesList, versionsList);
 * console.log(result1); // { lang: '', version: 'v2.0' }
 * console.log(segments1); // ['guide', 'intro']
 *
 * // Locale-first pattern
 * const segments2 = ['fr', 'v2.0', 'api', 'reference'];
 * const result2 = extractLocale(segments2, localesList, versionsList);
 * console.log(result2); // { lang: 'fr', version: 'v2.0' }
 * console.log(segments2); // ['api', 'reference']
 *
 * // No locale or version
 * const segments3 = ['docs', 'getting-started'];
 * const result3 = extractLocale(segments3, localesList, versionsList);
 * console.log(result3); // { lang: '', version: '' }
 * console.log(segments3); // ['docs', 'getting-started']
 *
 * // Use case: URL parsing for routing
 * const url = '/de/latest/guide/installation';
 * const segments = url.split('/').filter(Boolean);
 * const { lang, version } = extractLocale(
 *   segments,
 *   ['en', 'de', 'fr'],
 *   ['latest', 'v1', 'v2']
 * );
 * const route = segments.join('/');
 * console.log({ lang, version, route });
 * // { lang: 'de', version: 'latest', route: 'guide/installation' }
 * ```
 *
 * @see PathSegmentsInterface
 * @since 2.0.5
 */

export function extractLocale(segments: Array<string>, localesList: Array<string>, versionsList: Array<string>): PathSegmentsInterface {
    const version = versionsList.includes(segments[0]) ? segments.shift()! : '';
    const lang = localesList.includes(segments[0]) ? segments.shift()! : '';

    return { lang, version };
}

/**
 * Parses all documentation routes and generates rewritten paths for versioned and localized files.
 *
 * @remarks
 * - Iterates through the `fileMap` of the `StateModel` to process all Markdown files.
 * - Determines the correct locale for each file using `localesMap`.
 * - Uses the `rewritesHook` from `versionsConfig.hooks` to generate the versioned and localized path.
 * - Populates the `vitepressConfig.rewrites` object with the mapping of original paths to rewritten paths.
 *
 * @example
 * ```ts
 * parseRoutesComponent();
 * console.log(state.vitepressConfig.rewrites);
 * // → {
 *      "src/en/index.md": "en/index.md",
 *      "src/de/index.md": "index.md",
 *      "archive/x0.0.1/en/index.md": "x0.0.1/en/index.md"
 *      ...
 * }
 * ```
 *
 * @since 2.0.0
 */

export function parseRoutesComponent(): void {
    const state = inject(StateModel);
    const localesPrefix = Object.keys(state.localesMap);
    const localesList = Object.keys(state.localesMap);
    const versionsList = state.versionsList;

    state.vitepressConfig.rewrites = function (id: string): string {
        // Handle src/ files
        if (id.startsWith('src/')) {
            const path = id.replace('src/', '');
            const localeKey = localesPrefix.find(prefix => path.startsWith(prefix + '/'));

            if (localeKey) {
                const locale = state.localesMap[localeKey] === 'root' ? '' : localeKey;
                const filePath = path.replace(localeKey + '/', '');

                return state.versionsConfig.hooks.rewritesHook(filePath, '', locale);
            }

            return path;
        }

        // Handle archive/ files
        if (id.startsWith('archive/')) {
            const path = id.replace('archive/', '');
            const segments = path.split('/');
            const { lang, version } = extractLocale(segments, localesList, versionsList);
            const source = segments.join('/');

            return state.versionsConfig.hooks.rewritesHook(
                source, version, state.localesMap[lang] === 'root' ? '' : lang
            );
        }

        return id;
    };
}
