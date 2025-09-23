/**
 * Imports
 */

import { readdirSync } from 'fs';
import { join, relative } from 'path/posix';

/**
 * Deeply merges two object types into a single object.
 *
 * @typeParam T - The type of the first object.
 * @typeParam U - The type of the second object.
 *
 * @param obj1 - The base object whose properties will be merged.
 * @param obj2 - The object whose properties will overwrite or merge into `obj1`.
 * @returns A new object containing the deeply merged properties of both `obj1` and `obj2`.
 *
 * @remarks
 * - This function performs a deep merge, recursively merging nested objects.
 * - If a property exists in both `obj1` and `obj2`:
 *   - If both values are plain objects, they are merged recursively.
 *   - Otherwise, the value from `obj2` overwrites the value from `obj1`.
 * - Arrays are **not** merged; if a property is an array in `obj2`, it will replace
 *   the corresponding property in `obj1`.
 *
 * @example
 * ```ts
 * const obj1 = { a: 1, b: { c: 2, d: 3 } };
 * const obj2 = { b: { c: 42 }, e: 99 };
 *
 * const merged = deepMerge(obj1, obj2);
 * // Result: { a: 1, b: { c: 42, d: 3 }, e: 99 }
 * ```
 *
 * @since 2.0.0
 */

export function deepMerge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
    const result = <Record<string, unknown>> { ...obj1 };

    for (const key in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, key)) {
            const val2 = (obj2 as T & U)[key];
            const val1 = (obj1 as T & U)[key];

            if (
                val1 && typeof val1 === 'object' &&
                val2 && typeof val2 === 'object' &&
                !Array.isArray(val2) && !Array.isArray(val2)
            ) {
                result[key] = deepMerge(val1 as object, val2 as object);
            } else {
                result[key] = val2;
            }
        }
    }

    return result as T & U;
}

/**
 * Recursively collects all Markdown (`.md`) files within a given directory,
 * returning their paths relative to a specified root directory.
 *
 * @param rootDir - The root directory used as the base for relative paths.
 * @param currentDir - The current directory to scan. Defaults to `rootDir`.
 * @returns An array of relative file paths to Markdown files.
 *
 * @remarks
 * - This function traverses directories recursively.
 * - Only files with a `.md` extension are included in the results.
 * - Returned paths are **relative to `rootDir`**, regardless of how deep the files are nested.
 * - Uses Node.js `fs.readdirSync` with `withFileTypes: true` for efficient directory traversal.
 *
 * @example
 * ```ts
 * const markdownFiles = getAllMarkdownFilesRelative("/project/docs");
 *
 * console.log(markdownFiles);
 * // Example output:
 * // [
 * //   "README.md",
 * //   "guide/intro.md",
 * //   "tutorial/setup.md"
 * // ]
 * ```
 *
 * @since 2.0.0
 */

export function getAllMarkdownFilesRelative(rootDir: string, currentDir: string = rootDir): Array<string> {
    let results: Array<string> = [];
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
            results = results.concat(getAllMarkdownFilesRelative(rootDir, fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            const relativePath = relative(rootDir, fullPath);
            results.push(relativePath);
        }
    }

    return results;
}
