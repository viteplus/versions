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
            const parts = path.split('/');
            const version = parts[0];
            const localeKey = parts[1];
            const locale = state.localesMap[localeKey] === 'root' ? '' : localeKey;
            const filePath = parts.slice(2).join('/');

            return state.versionsConfig.hooks.rewritesHook(filePath, version, locale);
        }

        return id;
    };
}
