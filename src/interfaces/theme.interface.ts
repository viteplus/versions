/**
 * Import will remove at compile time
 */

import type { DefaultTheme } from 'vitepress';
import type { NavType } from '@interfaces/nav.interface';
import type { SidebarType } from '@interfaces/sidebar.interface';

/**
 * Represents the configuration interface for a VitePress theme.
 *
 * @remarks
 * Extends VitePress's {@link DefaultTheme.Config} type but overrides the
 * `nav` and `sidebar` properties to use custom, strongly typed interfaces
 * ({@link NavType} and {@link SidebarType}).
 *
 * This allows for enhanced type safety and additional functionality such as
 * versioning control in navigation and sidebar items.
 *
 * @example
 * ```ts
 * const themeConfig: ThemeInterface = {
 *   nav: [
 *     { text: "Home", link: "/" },
 *     { text: "Docs", items: [{ text: "Guide", link: "/guide/" }] }
 *   ],
 *   sidebar: {
 *     guide: [
 *       { text: "Introduction", link: "/guide/introduction" },
 *       { text: "Setup", link: "/guide/setup" }
 *     ]
 *   },
 *   lastUpdated: true
 * };
 * ```
 *
 * @since 2.0.0
 */

export interface ThemeInterface extends Omit<DefaultTheme.Config, 'nav' | 'sidebar'> {
    /**
     * Navigation structure of the site.
     *
     * @remarks
     * Typed as {@link NavType}, which allows versioning-aware navigation items.
     *
     * @since 2.0.0
     */

    nav?: NavType;

    /**
     * Sidebar structure of the site.
     *
     * @remarks
     * Typed as {@link SidebarType}, which allows versioning-aware sidebar items.
     *
     * @since 2.0.0
     */

    sidebar?: SidebarType;
}
