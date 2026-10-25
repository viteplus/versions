/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { SiteConfig } from 'vitepress';

/**
 * Imports
 */

import { join, posix } from 'path';
import { inject } from '@remotex-labs/xinject';
import { StateModel } from '@models/state.model';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Opens the latest version at the root of the site, with its versioned address in the address bar.
 *
 * @remarks
 * The root of the site and of every locale serves the home page of {@link StateModel.latest}
 * with a script that changes the address to `/<latest>/` before the app starts,
 * so the page opens without a redirect or a reload.
 * The dev server adds the script to the root page it serves,
 * and when the build ends the home page is copied to the root with the script, unless a page is already there.
 * The `vite` plugins and the `buildEnd` hook of the user configuration are kept, and that hook runs last.
 *
 * @example
 * ```ts
 * parseLatestEntry();
 * // opening / shows the home page of v2.0.x, with /v2.0.x/ in the address bar
 * ```
 *
 * @see https://github.com/viteplus/versions/issues/55
 *
 * @since 3.0.0
 */

export function parseLatestEntry(): void {
    const { latest, localesMap, vitepressConfig } = inject(StateModel);
    const { buildEnd, base = '/', vite = {} } = vitepressConfig;
    const locales = [ '', ...Object.keys(localesMap).filter(key => localesMap[key] !== 'root') ];
    const withScript = (html: string, locale: string): string => {
        const url = JSON.stringify(posix.join('/', base, locale, latest, '/'));

        return html.replace('<head>', `<head><script>history.replaceState(null,'',${ url }+location.search+location.hash)</script>`);
    };

    const plugin = {
        name: 'viteplus-versions:latest',
        transformIndexHtml(html: string, { originalUrl = '' }: { originalUrl?: string }): string {
            const path = originalUrl.replace(/[?#].*/, '').replace(/\/?(index\.html)?$/, '/');
            const locale = locales.find(locale => path === posix.join('/', base, locale, '/'));

            return locale === undefined ? html : withScript(html, locale);
        }
    };

    vitepressConfig.vite = { ...vite, plugins: [ ...vite.plugins ?? [], plugin ] };

    vitepressConfig.buildEnd = async (siteConfig: SiteConfig): Promise<void> => {
        for (const locale of locales) {
            const home = join(siteConfig.outDir, locale, latest, 'index.html');
            const root = join(siteConfig.outDir, locale, 'index.html');

            try {
                // 'wx' fails when a page already sits at the root, in one step and without a race
                writeFileSync(root, withScript(readFileSync(home, 'utf8'), locale), { flag: 'wx' });
            } catch (error) {
                if (![ 'ENOENT', 'EEXIST' ].includes(<string> (<NodeJS.ErrnoException> error).code)) throw error;
            }
        }

        await buildEnd?.(siteConfig);
    };
}
