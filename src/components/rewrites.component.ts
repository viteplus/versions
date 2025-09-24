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
    const result: Record<string, string> = {};
    const state = inject(StateModel);
    const localesPrefix = Object.keys(state.localesMap);

    for (const [ folder, fileList ] of Object.entries(state.fileMap)) {
        const prefix = folder === '' ? state.sources : state.archive;

        for (const file of fileList) {
            const localeKey = localesPrefix[localesPrefix.findIndex(item => file.startsWith(item))];
            const locale = state.localesMap[localeKey] === 'root' ? '' : localeKey ?? '';

            result[join(prefix, folder, file)] = state.versionsConfig.hooks.rewritesHook(
                file.replace(localeKey + '/', ''), folder, locale
            );
        }
    }

    state.vitepressConfig.rewrites = result;
}
