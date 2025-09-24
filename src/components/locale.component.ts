/**
 * Imports
 */

import { join } from 'path/posix';
import { StateModel } from '@models/state.model';
import { inject } from '@symlinks/services/inject.service';

/**
 * Populates locale information in the VitePress configuration for all versions.
 *
 * @remarks
 * - Reads the `localesMap` from the `StateModel` to identify each user-defined locale.
 * - Copies `lang` and `label` from the user configuration into `vitepressConfig.locales`.
 * - For each version in `versionsList`, creates a versioned locale entry in `vitepressConfig.locales`.
 * - Ensures that both the root locale and versioned locales have proper `lang` and `label` settings.
 *
 * @example
 * ```ts
 * parseLocale();
 * console.log(state.vitepressConfig.locales);
 * // → { root: { lang: "en", label: "English" }, "1.0/en": { lang: "en" }, ... }
 * ```
 *
 * @since 2.0.0
 */

export function parseLocale(): void {
    const state = inject(StateModel);
    const versions = state.versionsList;
    const locales = state.vitepressConfig.locales;
    const userLocales = state.configuration.locales;

    for (const key of Object.keys(state.localesMap)) {
        const index = state.localesMap[key];
        const isRoot = index === 'root';
        const localeObject = 'root' in userLocales ? userLocales[index] : userLocales[key];
        const localeItems = { ...localeObject, themeConfig: undefined };

        locales[index] ??= {};
        Object.assign(locales[index], localeItems);

        if(isRoot) locales[index].link = '/';
        else locales[index].link = `/${ locales[index].lang }/`;

        for (const version of versions) {
            const subIndex = isRoot ? version : join(key, version);
            locales[subIndex] ??= {};
            Object.assign(locales[subIndex], { ...localeItems });

            locales[subIndex].label = ' ';
            if(isRoot) locales[subIndex].link = '/';
            else locales[subIndex].link = `/${ locales[subIndex].lang }/`;
        }
    }
}
