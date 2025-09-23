/**
 * Import will remove at compile time
 */

import type { ConfigurationInterface } from '@interfaces/configuration.interface';

/**
 * Imports
 */

import { rewritesHook } from '@components/rewrites.component';

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
    }
};
