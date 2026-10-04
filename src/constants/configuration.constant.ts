/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { ConfigurationInterface } from '@interfaces/configuration.interface';

/**
 * Imports
 */

import { existsSync, readFileSync, realpathSync } from 'fs';
import { rewritesHook } from '@components/rewrites.component';

/**
 * The file system that the Vue SFC compiler reads imported types through.
 *
 * @remarks
 * `defineProps<PropsInterface>()` in the version switcher names a type from another file,
 * and the compiler has to read that file to turn the type into runtime props.
 * Without an `fs` option the compiler falls back to `ts.sys` of the `typescript` package,
 * which TypeScript 7 no longer ships and which is missing when TypeScript is not installed,
 * so the build fails with `No fs option provided to compileScript`.
 *
 * VitePress hands `vue.script` to `@vitejs/plugin-vue`, which passes it on to `compileScript`,
 * so this default gives the compiler Node's file system whatever TypeScript the site installs.
 * A site that sets its own `vue.script.fs` keeps it, since the user configuration is merged on top.
 *
 * @example
 * ```ts
 * scriptFileSystem.fileExists('/docs/.vitepress/theme/index.ts'); // true
 * ```
 *
 * @see https://github.com/viteplus/versions/issues/42
 * @since 2.2.0
 */

export const scriptFileSystem = {
    fileExists: (file: string): boolean => existsSync(file),
    readFile: (file: string): string => readFileSync(file, 'utf8'),
    realpath: (file: string): string => realpathSync(file)
};

/**
 * Default configuration object for the `versions` system.
 *
 * @remarks
 * Provides a baseline implementation of {@link ConfigurationInterface}.
 * This includes:
 * - Empty `locales` and `rewrites` mappings.
 * - A `versionsConfig` with:
 *   - `current` set to `"latest"`.
 *   - `sources` pointing to `"src"`.
 *   - `archive` pointing to `"archive"`.
 *   - `hooks.rewritesHook` bound to the default {@link rewritesHook}.
 *   - A `versionSwitcher` enabled with label `"Switch Version"` and
 *     `includeCurrentVersion` set to `true`.
 * - A `vue.script.fs` that reads the file system through Node, see {@link scriptFileSystem}.
 * - A `vite.resolve.dedupe` of `vue` and `vitepress`, so the switcher component resolves both from the site
 *   even when the package is linked from outside it, and shares the one Vue app and router the site runs.
 *
 * This default setup can be extended or overridden as needed when
 * customizing your documentation site.
 *
 * @example
 * ```ts
 * import { defaultConfiguration } from "@config/default.configuration";
 *
 * export default {
 *   ...defaultConfiguration,
 *   locales: {
 *     en: { link: "/en/", label: "English" }
 *   }
 * };
 * ```
 *
 * @since 2.0.0
 */

export const defaultConfiguration: ConfigurationInterface = {
    locales: {},
    rewrites: {},
    versionsConfig: {
        current: 'latest',
        sources: 'src',
        archive: 'archive',
        hooks: {
            rewritesHook: rewritesHook
        },
        versionSwitcher: {
            text: 'Switch Version',
            includeCurrentVersion: true
        }
    },
    vue: {
        script: {
            fs: scriptFileSystem
        }
    },
    vite: {
        resolve: {
            dedupe: [ 'vue', 'vitepress' ]
        }
    }
};
