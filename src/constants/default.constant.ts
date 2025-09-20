/**
 * Import will remove at compile time
 */

import type { ConfigInterface } from '@interfaces/config.interface';

/**
 * Default versioning configuration.
 *
 * @remarks
 * This object provides the default settings for versioned documentation,
 * including the latest version, URL rewrites, and sidebar options.
 *
 * - `latestVersion`: Initially `undefined`; can be set to mark the most recent version.
 * - `rewrites`: Functions and prefix used to generate versioned URLs for documents.
 *    - `localePrefix`: Prefix for locale-specific URLs.
 *    - `rewriteProcessor`: Processes file paths for versioned URLs.
 *    - `localeRewriteProcessor`: Processes locale-specific versioned URLs.
 * - `sidebarOptions`: Configuration for generating versioned sidebars.
 *    - `processSidebarURLs`: Whether sidebar URLs should be processed.
 *    - `sidebarPathResolver`: Resolves the path to the sidebar JSON file for a given version.
 *    - `sidebarUrlProcessor`: Processes sidebar item URLs to include the version prefix.
 *
 * @example
 * ```ts
 * import { defaultConfig } from './default.constant';
 *
 * console.log(defaultConfig.sidebarOptions.sidebarPathResolver('1.0.0'));
 * // Output: ".vitepress/sidebars/versioned/1.0.0.json"
 *
 * console.log(defaultConfig.rewrites.rewriteProcessor('versions/guide.md'));
 * // Output: "guide.md"
 * ```
 *
 * @since 1.0.0
 */

export const defaultConfig: Required<ConfigInterface['versioning']> = {
    latestVersion: undefined,
    rewrites: {
        localePrefix: '',
        rewriteProcessor: (inputFilePath: string) => inputFilePath.replace('versions/', ''),
        localeRewriteProcessor(inputFilePath: string, _version: string, locale: string): string {
            return `${ locale }/` + inputFilePath.replace(
                'versions/', '').replace(`${ locale }/`, ''
            );
        }
    },
    sidebarOptions: {
        processSidebarURLs: true,
        sidebarPathResolver: (version: string) => `.vitepress/sidebars/versioned/${ version }.json`,
        sidebarUrlProcessor: (url: string, version: string) => `/${ version }${ url }`
    }
};
