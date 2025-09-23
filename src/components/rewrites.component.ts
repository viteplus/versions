/**
 * imports
 */

import { join } from 'path/posix';

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
