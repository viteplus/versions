/**
 * Represents extracted locale and version information from URL path segments.
 *
 * @remarks
 * This interface defines the structure returned by {@link extractLocale} when parsing
 * URL paths in a multi-version, multi-locale documentation system. It separates the
 * locale identifier from the version identifier, enabling proper routing and content
 * resolution.
 *
 * Both properties use empty strings as sentinel values to indicate absence, rather
 * than undefined or null, simplifying string concatenation and path construction
 * operations.
 *
 * Common usage patterns:
 * - Route parsing and URL analysis
 * - Content path resolution
 * - Locale and version detection from request URLs
 * - Sidebar and navigation path construction
 * - Determining which content variant to serve
 *
 * The interface supports various URL structures:
 * - Root locale, no version: `{ lang: '', version: '' }` → `/guide/`
 * - Root locale with version: `{ lang: '', version: 'v2.0' }` → `/v2.0/guide/`
 * - Specific locale, no version: `{ lang: 'fr', version: '' }` → `/fr/guide/`
 * - Specific locale with version: `{ lang: 'fr', version: 'v2.0' }` → `/fr/v2.0/guide/`
 *
 * @example
 * ```ts
 * // Parse URL segments
 * const segments = ['fr', 'v2.0', 'guide', 'intro'];
 * const result: PathSegmentsInterface = extractLocale(
 *   segments,
 *   ['en', 'fr', 'de'],
 *   ['v1.0', 'v2.0', 'latest']
 * );
 * console.log(result);
 * // { lang: 'fr', version: 'v2.0' }
 *
 * // Handle missing locale/version
 * const segments2 = ['docs', 'api'];
 * const result2: PathSegmentsInterface = extractLocale(segments2, locales, versions);
 * console.log(result2);
 * // { lang: '', version: '' }
 *
 * // Use in routing logic
 * function resolveContent(path: string): string {
 *   const segments = path.split('/').filter(Boolean);
 *   const { lang, version }: PathSegmentsInterface = extractLocale(
 *     segments,
 *     availableLocales,
 *     availableVersions
 *   );
 *
 *   const contentPath = [
 *     lang || 'en',
 *     version || 'latest',
 *     ...segments
 *   ].join('/');
 *
 *   return loadContent(contentPath);
 * }
 *
 * // Use in path construction
 * function buildPath(info: PathSegmentsInterface, ...segments: string[]): string {
 *   const parts = [
 *     info.lang,
 *     info.version,
 *     ...segments
 *   ].filter(Boolean);
 *
 *   return '/' + parts.join('/');
 * }
 *
 * const pathInfo: PathSegmentsInterface = { lang: 'de', version: 'v3.0' };
 * console.log(buildPath(pathInfo, 'guide', 'intro'));
 * // '/de/v3.0/guide/intro'
 * ```
 *
 * @see extractLocale
 * @since 2.0.5
 */

export interface PathSegmentsInterface {
    lang: string;
    version: string
}
