/**
 * Import will remove at compile time
 */

import type { SidebarItemType } from '@viteplus/versions';
import type { SidebarObjectType, SidebarType } from '@interfaces/sidebar.interface';
import type { PathSegmentsInterface } from '@components/interfaces/sidebar-component.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';

/**
 * Safely joins path segments, preventing empty or dot-only results.
 *
 * @param args - Variable number of path segments to join.
 * @returns A joined path string, or empty string if the result would be '.' or empty.
 *
 * @remarks
 * This function is a wrapper around Node.js's {@link join} from path/posix that addresses
 * a common edge case: when all input segments are empty or falsy, {@link join} returns
 * a single dot (`'.'`) representing the current directory. This function prevents that
 * behavior by returning an empty string instead.
 *
 * **Processing steps**:
 * 1. Filters out falsy values (empty strings, null, undefined, 0, false) using {@link Boolean}
 * 2. Joins remaining segments using {@link join}
 * 3. Returns empty string if result is `'.'`, otherwise returns the joined path
 *
 * **Use cases**:
 * - Building URL paths where empty segments should result in empty strings
 * - Constructing locale-aware paths with optional prefixes
 * - Generating version-specific routes where components may be absent
 * - Avoiding visual artifacts from dot paths in UI components
 *
 * The function is particularly useful in multi-version, multi-locale systems where
 * path components (locale, version, base path) may be conditionally empty, and you
 * need consistent empty-string results rather than dot notation.
 *
 * @example
 * ```ts
 * // Normal path joining
 * const path1 = safeJoin('docs', 'guide', 'intro');
 * console.log(path1); // 'docs/guide/intro'
 *
 * // With empty segments (filtered out)
 * const path2 = safeJoin('', 'docs', '', 'guide');
 * console.log(path2); // 'docs/guide'
 *
 * // All empty segments (returns empty string, not '.')
 * const path3 = safeJoin('', '', '');
 * console.log(path3); // '' (not '.')
 *
 * // Single segment
 * const path4 = safeJoin('docs');
 * console.log(path4); // 'docs'
 *
 * // Use case: Building versioned paths
 * const locale = ''; // Root locale (empty)
 * const version = ''; // Current version (empty)
 * const base = 'guide';
 *
 * const path = safeJoin(locale, version, base);
 * console.log(path); // 'guide' (not './guide' or '.')
 *
 * // Use case: Optional prefix paths
 * function buildPath(prefix: string, ...segments: string[]): string {
 *   return '/' + safeJoin(prefix, ...segments);
 * }
 *
 * console.log(buildPath('', 'api', 'users')); // '/api/users'
 * console.log(buildPath('v2', 'api', 'users')); // '/v2/api/users'
 * console.log(buildPath('', '', '')); // '/' (not '/.')
 * ```
 *
 * @see join
 * @see Boolean
 *
 * @since 2.0.5
 */

function safeJoin(...args: Array<string>): string {
    const joined = join(...args.filter(Boolean));

    return joined === '.' ? '' : joined;
}

/**
 * Populates sidebar items with version-specific base paths.
 *
 * @param sidebar - Array of sidebar items to process {@link SidebarItemType}.
 * @param version - The version string to apply to base paths, or 'root' for the default version.
 * @returns A new array of sidebar items with updated base paths.
 *
 * @remarks
 * This function transforms sidebar items by adding version-specific base paths to enable
 * multi-version documentation navigation. It processes each sidebar item according to
 * specific rules:
 *
 * **Skipped items** (returned unchanged):
 * - Items with `skipVersioning: true` flag
 * - Items with external links (starting with 'http')
 * - Items without links or nested items
 * - Items when a version is empty or 'root'
 *
 * **Processed items**:
 * - The base path is prepended with a version: `/{version}/{base}/`
 * - Original item properties are preserved via spread operator
 * - The normalized version replaces 'root' with empty string
 *
 * The base path structure follows the pattern: `/{version}/{originalBase}/`
 * using {@link join} from path/posix for consistent URL formatting across platforms.
 *
 * @example
 * ```ts
 * const sidebar: Array<SidebarItemType> = [
 *   { text: 'Guide', link: '/guide/', base: '/docs' },
 *   { text: 'API', link: '/api/', base: '/reference' },
 *   { text: 'External', link: 'https://example.com' },
 *   { text: 'Skip', link: '/skip/', skipVersioning: true }
 * ];
 *
 * const versioned = populateSidebar(sidebar, 'v2.0');
 * // [
 * //   { text: 'Guide', link: '/guide/', base: '/v2.0/docs/' },
 * //   { text: 'API', link: '/api/', base: '/v2.0/reference/' },
 * //   { text: 'External', link: 'https://example.com' },
 * //   { text: 'Skip', link: '/skip/', skipVersioning: true }
 * // ]
 *
 * // Root version (no prefix)
 * const rootVersioned = populateSidebar(sidebar, 'root');
 * // Base paths remain unchanged
 *
 * // Use case: Version-specific sidebar configuration
 * const versions = ['v1.0', 'v2.0', 'latest'];
 * const sidebarConfigs = versions.map(version => ({
 *   version,
 *   items: populateSidebar(baseSidebar, version)
 * }));
 * ```
 *
 * @see SidebarItemType
 * @since 2.0.5
 */

export function populateSidebar(sidebar: Array<SidebarItemType>, version: string): Array<SidebarItemType> {
    const normalizedVersion = version === 'root' ? '' : version;

    return sidebar.map(item => {
        if (item.skipVersioning || item?.link?.startsWith('http')) return item;
        if (!(item.link || item.items) || !normalizedVersion) return item;

        return {
            ...item,
            base: safeJoin('/', normalizedVersion, item.base ?? '', '/')
        };
    });
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
 * 1. If the first segment matches a version → return `{ lang: '', version }` (version-first pattern)
 * 2. If the first segment matches a locale → extract it as `lang` (locale-first pattern)
 * 3. If the second segment matches a version → extract it as `version`
 * 4. Return both extracted values (empty strings if not found)
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
    if (versionsList.includes(segments[0])) {
        return { lang: '', version: segments.shift()! };
    }

    const lang = localesList.includes(segments[0]) ? segments.shift()! : '';
    const version = versionsList.includes(segments[0]) ? segments.shift()! : '';

    return { lang, version };
}

/**
 * Normalizes sidebar configuration into a structured format for multi-version documentation.
 *
 * @param state - The state model containing configuration data {@link StateModel}.
 * @param results - Accumulator object to store normalized sidebar entries {@link SidebarObjectType}.
 * @param sidebar - The sidebar configuration to normalize {@link SidebarType}.
 * @param prefix - Locale prefix for the sidebar (e.g., 'root', 'fr', 'de').
 *
 * @remarks
 * This function transforms sidebar configurations from various input formats into a
 * normalized structure that supports multi-version, multi-locale documentation. It
 * handles both array-based and object-based sidebar definitions.
 *
 * **Input formats supported**:
 * - **Array format**: Simple list of sidebar items for a single path
 * - **Object format**: Key-value pairs where keys are paths and values are sidebar items
 * - **Undefined**: Gracefully handles missing sidebar configuration
 *
 * **Normalization process**:
 * 1. Early return if the sidebar is undefined
 * 2. Convert the 'root' prefix to an empty string for URL normalization
 * 3. For array format: Store items under the normalized path
 * 4. For object format: Parse each key to extract locale/version using {@link extractLocale}
 * 5. Filter entries that don't match the current locale prefix
 * 6. Construct versioned paths and store items in the result accumulator
 *
 * **Results structure**:
 * ```ts
 * {
 *   'root': { '/': [...items], '/guide/': [...items] },
 *   'fr': { '/fr/': [...items], '/fr/guide/': [...items] },
 *   'fr/v2.0': { '/fr/v2.0/': [...items] }
 * }
 * ```
 *
 * The function uses state data to access:
 * - {@link StateModel.localesMap} for valid locale identifiers
 * - {@link StateModel.versionsList} for valid version identifiers
 *
 * @example
 * ```ts
 * const state = new StateModel(config).init();
 * const results: Record<string, SidebarObjectType> = {};
 *
 * // Array format sidebar
 * const arraySidebar = [
 *   { text: 'Guide', link: '/guide/' },
 *   { text: 'API', link: '/api/' }
 * ];
 * normalizeSidebar(state, results, arraySidebar, 'root');
 * // results = { 'root': { '/': [{ text: 'Guide', ... }, { text: 'API', ... }] } }
 *
 * // Object format sidebar
 * const objectSidebar = {
 *   '/': [{ text: 'Home', link: '/' }],
 *   '/guide/': [{ text: 'Getting Started', link: '/guide/start' }],
 *   '/fr/guide/': [{ text: 'Commencer', link: '/fr/guide/start' }]
 * };
 * normalizeSidebar(state, results, objectSidebar, 'root');
 *
 * // With locale prefix
 * normalizeSidebar(state, results, objectSidebar, 'fr');
 * // Only '/fr/guide/' entries are processed
 *
 * // Use case: Multi-locale sidebar processing
 * const results = {};
 * const locales = ['root', 'fr', 'de'];
 * for (const locale of locales) {
 *   const sidebar = getLocaleSidebar(locale);
 *   normalizeSidebar(state, results, sidebar, locale);
 * }
 * ```
 *
 * @see StateModel
 * @see SidebarType
 * @see extractLocale
 * @see SidebarObjectType
 *
 * @since 2.0.5
 */

export function normalizeSidebar(state: StateModel, results: Record<string, SidebarObjectType>, sidebar?: SidebarType, prefix: string = ''): void {
    if (!sidebar) return;
    const normalizedPrefix = prefix === 'root' ? '' : prefix;

    if (Array.isArray(sidebar)) {
        const index = normalizedPrefix ? normalizedPrefix : '/';
        results[prefix] ??= {};
        results[prefix][index] ??= [];
        results[prefix][index].push(...sidebar);

        return;
    }

    const localesList = Object.values(state.localesMap);
    const versionsList = state.versionsList;

    for (const [ key, items ] of Object.entries(sidebar)) {
        const segments = key.split('/').filter(Boolean);
        const { lang, version } = extractLocale(segments, localesList, versionsList);

        if (lang && !prefix.startsWith(lang)) continue;

        const parent = version ? safeJoin(normalizedPrefix, version) : normalizedPrefix;
        const index = safeJoin(parent, ...segments) || '/';
        const parentIndex = parent || 'root';

        results[parentIndex] ??= {};
        results[parentIndex][index] ??= [];

        const itemsArray = Array.isArray(items) ? items : [ items ];
        results[parentIndex][index].push(...itemsArray);
    }
}


/**
 * Normalizes all sidebar configurations across locales and versions.
 *
 * @param state - The state model containing configuration data {@link StateModel}.
 * @returns A normalized sidebar structure organized by locale and path {@link SidebarObjectType}.
 *
 * @remarks
 * This function orchestrates the complete normalization of all sidebar configurations
 * in a multi-version, multi-locale documentation site. It processes sidebars from both
 * global theme configuration and locale-specific settings, then propagates them to all
 * versioned locale entries.
 *
 * **Processing stages**:
 * 1. **Initial Normalization**: Process sidebars from global theme config and each locale's
 *    theme config using {@link normalizeSidebar}
 * 2. **Version Propagation**: For each locale entry in {@link StateModel.vitepressConfig},
 *    if it lacks a normalized sidebar, inherit from its parent locale
 * 3. **Path Adjustment**: Adjust inherited paths to include the version/locale prefix
 *
 * **Data sources processed**:
 * - {@link StateModel.configuration.themeConfig.sidebar}: Global sidebar configuration
 * - Each locale's `themeConfig.sidebar`: Locale-specific sidebar configuration
 *
 * **Output structure**:
 * ```ts
 * {
 *   'root': { '/': [...], '/guide/': [...] },
 *   'v2.0': { '/v2.0/': [...], '/v2.0/guide/': [...] },
 *   'fr': { '/fr/': [...], '/fr/guide/': [...] },
 *   'fr/v2.0': { '/fr/v2.0/': [...], '/fr/v2.0/guide/': [...] }
 * }
 * ```
 *
 * The function ensures that every locale entry in the VitePress configuration has
 * appropriate sidebar items, either directly defined or inherited from parent locales.
 * This enables consistent navigation across all versions and locales.
 *
 * @example
 * ```ts
 * const state = new StateModel({
 *   themeConfig: {
 *     sidebar: {
 *       '/': [{ text: 'Home', link: '/' }],
 *       '/guide/': [{ text: 'Guide', link: '/guide/' }]
 *     }
 *   },
 *   locales: {
 *     root: { lang: 'en-US' },
 *     '/fr/': {
 *       lang: 'fr-FR',
 *       themeConfig: {
 *         sidebar: {
 *           '/fr/guide/': [{ text: 'Guide', link: '/fr/guide/' }]
 *         }
 *       }
 *     }
 *   },
 *   versionsConfig: {
 *     sources: 'src',
 *     archive: 'versions'
 *   }
 * }).init();
 *
 * const normalized = normalizeSidebars(state);
 *
 * console.log(Object.keys(normalized));
 * // ['root', 'v1.0', 'v2.0', 'fr', 'fr/v1.0', 'fr/v2.0']
 *
 * console.log(normalized['v2.0']);
 * // { '/v2.0/': [...], '/v2.0/guide/': [...] }
 *
 * console.log(normalized['fr/v2.0']);
 * // { '/fr/v2.0/': [...], '/fr/v2.0/guide/': [...] }
 *
 * // Use case: Building a complete sidebar structure
 * const state = inject(StateModel);
 * const sidebars = normalizeSidebars(state);
 *
 * // Apply to VitePress config
 * for (const [locale, paths] of Object.entries(sidebars)) {
 *   vitepressConfig.locales[locale].themeConfig.sidebar = paths;
 * }
 * ```
 *
 * @see StateModel
 * @see extractLocale
 * @see normalizeSidebar
 * @see SidebarObjectType
 *
 * @since 2.0.5
 */

export function normalizeSidebars(state: StateModel): Record<string, SidebarObjectType> {
    const { vitepressConfig, configuration: { locales, themeConfig } } = state;
    const normalizedSidebar: Record<string, SidebarObjectType> = {};

    if(Object.keys(locales).length > 0) {
        for (const [ localeKey, locale ] of Object.entries(locales)) {
            normalizeSidebar(state, normalizedSidebar, themeConfig?.sidebar as SidebarObjectType, localeKey);
            normalizeSidebar(state, normalizedSidebar, locale.themeConfig?.sidebar as SidebarObjectType, localeKey);
        }
    } else {
        normalizeSidebar(state, normalizedSidebar, themeConfig?.sidebar as SidebarObjectType, 'root');
    }

    const localesList = Object.values(state.localesMap);
    const versionsList = state.versionsList;
    for (const index of Object.keys(vitepressConfig.locales)) {
        if (normalizedSidebar[index]) continue;

        const { lang } = extractLocale(index.split('/'), localesList, versionsList);
        const parent = normalizedSidebar[lang || 'root'];
        if (!parent) continue;

        normalizedSidebar[index] = {};
        for (const [ key, items ] of Object.entries(parent)) {
            const segments = key.split('/').filter(Boolean);
            extractLocale(segments, localesList, versionsList);
            normalizedSidebar[index][safeJoin(index, ...segments)] = [ ...items ];
        }
    }

    return normalizedSidebar;
}

/**
 * Parses and applies sidebar configurations to all locales in the VitePress configuration.
 *
 * @remarks
 * This function is the main entry point for sidebar processing in a multi-version,
 * multi-locale documentation system. It coordinates the complete sidebar normalization
 * and population workflow by:
 *
 * 1. **Injecting State**: Retrieves the {@link StateModel} singleton instance
 * 2. **Normalizing**: Calls {@link normalizeSidebars} to process all sidebar configurations
 * 3. **Applying**: Iterates through each locale in {@link StateModel.vitepressConfig.locales}
 * 4. **Populating**: Uses {@link populateSidebar} to add version-specific base paths
 * 5. **Merging**: Assigns processed sidebars to each locale's theme configuration
 *
 * **Sidebar structure handling**:
 * - Initializes `themeConfig` if it doesn't exist
 * - Converts array-based sidebars to object format for consistent processing
 * - Preserves existing sidebar structure when no normalized version exists
 * - Ensures sidebar is always in object format after processing
 *
 * The function modifies the VitePress configuration in place, updating each locale's
 * `themeConfig.sidebar` with the normalized and versioned sidebar items. This ensures
 * that all routes have appropriate navigation structures.
 *
 * **Processing flow**:
 * ```
 * User Config → normalizeSidebars() → Normalized Structure
 *                                           ↓
 * VitePress Config ← populateSidebar() ← Per-Locale Items
 * ```
 *
 * @example
 * ```ts
 * // Setup configuration
 * const config = {
 *   themeConfig: {
 *     sidebar: {
 *       '/': [{ text: 'Home', link: '/' }],
 *       '/guide/': [{ text: 'Getting Started', link: '/guide/start' }]
 *     }
 *   },
 *   locales: {
 *     root: { lang: 'en-US', label: 'English' },
 *     '/fr/': {
 *       lang: 'fr-FR',
 *       label: 'Français',
 *       themeConfig: {
 *         sidebar: {
 *           '/fr/guide/': [{ text: 'Commencer', link: '/fr/guide/start' }]
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * const state = new StateModel(config).init();
 * provide(StateModel, state);
 *
 * // Parse and apply sidebars
 * parseSidebars();
 *
 * // Result: Each locale now has versioned sidebars
 * console.log(state.vitepressConfig.locales['v2.0'].themeConfig.sidebar);
 * // {
 * //   '/v2.0/': [{ text: 'Home', link: '/', base: '/v2.0/' }],
 * //   '/v2.0/guide/': [{ text: 'Getting Started', link: '/guide/start', base: '/v2.0/guide/' }]
 * // }
 *
 * console.log(state.vitepressConfig.locales['fr/v2.0'].themeConfig.sidebar);
 * // {
 * //   '/fr/v2.0/guide/': [{ text: 'Commencer', link: '/fr/guide/start', base: '/fr/v2.0/guide/' }]
 * // }
 *
 * // Use case: Integration in VitePress config hook
 * export default defineConfig({
 *   async buildStart() {
 *     parseSidebars();
 *   },
 *   // ... rest of config
 * });
 * ```
 *
 * @see StateModel
 * @see populateSidebar
 * @see normalizeSidebars
 *
 * @since 2.0.5
 */

export function parseSidebars(): void {
    const state = inject(StateModel);
    const { vitepressConfig: { locales } } = state;
    const localesList = Object.values(state.localesMap);
    const versionsList = state.versionsList;

    const sidebars = normalizeSidebars(state);
    for (const [ key, locale ] of Object.entries(locales)) {
        if (!sidebars[key]) continue;

        locale.themeConfig ??= {};
        if (!locale.themeConfig.sidebar || Array.isArray(locale.themeConfig.sidebar)) {
            locale.themeConfig.sidebar = {};
        }

        for (const [ index, items ] of Object.entries(sidebars[key])) {
            const { lang, version } = extractLocale(index.split('/'), localesList, versionsList);
            (locale.themeConfig.sidebar as SidebarObjectType)[index] = populateSidebar(
                items, safeJoin(lang, version)
            );
        }
    }
}
