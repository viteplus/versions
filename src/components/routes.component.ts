/**
 * Import will remove at compile time
 */

import type { ConfigInterface, RewritesOptionsInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { posix } from 'path';
import { existsSync, readdirSync } from 'fs';

/**
 * Recursively collects all file paths from a directory, skipping locale folders.
 *
 * @param dirPath - The directory path to scan.
 * @param locales - An array of locale folder names to skip.
 *
 * @returns An array of file paths found recursively under `dirPath`.
 *
 * @remarks
 * - Skips any directories that match names in the `locales` array.
 * - Uses POSIX-style paths for consistency across platforms.
 *
 * @example
 * ```ts
 * const files = collectFilesRecursively('/docs/versions/1.0.0', ['en', 'fr']);
 * ```
 *
 * @since 1.0.0
 */

export function collectFilesRecursively(dirPath: string, locales: Array<string>): Array<string> {
    const files: string[] = [];

    for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
        const fullPath = posix.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (locales.includes(entry.name)) continue;
            files.push(...collectFilesRecursively(fullPath, locales));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Generates versioned URL mappings for documentation files.
 *
 * @param rewrites - Rewrites options or `false` to disable URL generation.
 * @param docPath - The root path to the documentation folder.
 * @param versions - An array of documentation versions.
 * @param locales - Optional array of locales to include in URL generation.
 *
 * @returns A record mapping original file paths to their versioned URLs.
 *
 * @remarks
 * - Iterates through each version folder and collects all files.
 * - Applies `rewriteProcessor` and optionally `localeRewriteProcessor` to generate versioned paths.
 * - Locale files are prefixed with `rewrites.localePrefix` and cleaned up for the final path.
 *
 * @example
 * ```ts
 * const urls = generateVersionedUrls(rewrites, '/docs', ['1.0.0', '2.0.0'], ['en', 'fr']);
 * ```
 *
 * @since 1.0.0
 */

export function generateVersionedUrls(
    rewrites: RewritesOptionsInterface | false, docPath: string, versions: Array<string>, locales: Array<string> = []
): Record<string, string> {
    const versionedUrls: Record<string, string> = {};
    if (rewrites === false) return versionedUrls;

    const versionsDir = posix.join(docPath, 'versions');
    for (const version of versions) {
        const versionPath = posix.join(versionsDir, version);

        // Collect all files in this version folder
        const files = collectFilesRecursively(versionPath, locales);

        for (const filePath of files) {
            const sourcePath = filePath.replace(versionsDir, 'versions');
            versionedUrls[sourcePath] = rewrites.rewriteProcessor!(
                sourcePath,
                version
            );
        }

        for (const locale of locales) {
            const localeDir = posix.join(
                versionsDir,
                version,
                rewrites.localePrefix!,
                locale
            );

            if (!existsSync(localeDir)) continue;

            const localeFiles = collectFilesRecursively(localeDir, locales);

            for (const filePath of localeFiles) {
                const sourcePath = filePath.replace(versionsDir, 'versions');
                versionedUrls[sourcePath] = rewrites.localeRewriteProcessor?.(
                    sourcePath,
                    version,
                    locale
                ).replace(`/${ rewrites.localePrefix! }`, '') ?? '';
            }
        }
    }

    return versionedUrls;
}

/**
 * Updates the configuration object with versioned routes for documentation.
 *
 * @param config - The configuration object to update with versioned URLs.
 * @param versions - An array of documentation versions.
 * @param docPath - The root path to the documentation folder.
 *
 * @returns void
 *
 * @remarks
 * - Calls {@link generateVersionedUrls} to generate mappings for all versions and locales.
 * - Merges the generated URLs into `config.rewrites`.
 *
 * @example
 * ```ts
 * versionRoutes(config, ['1.0.0', '2.0.0'], '/docs');
 * ```
 *
 * @since 1.0.0
 */

export function versionRoutes(config: ConfigInterface, versions: Array<string>, docPath: string): void {
    config.rewrites = {
        ...config.rewrites,
        ...generateVersionedUrls(
            config.versioning.rewrites!,
            docPath,
            versions,
            Object.keys(config.locales ?? {})
        )
    };
}
