/**
 * Import will remove at compile time
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Represents a sidebar item from VitePress with optional versioning control.
 *
 * @remarks
 * Extends VitePress's {@link DefaultTheme.SidebarItem} type by adding an optional
 * `skipVersioning` flag. Use this flag to indicate that the item should not be
 * automatically versioned in multi-version documentation setups.
 *
 * @example
 * ```ts
 * const item: SidebarItemType = {
 *   text: "Introduction",
 *   link: "/guide/introduction",
 *   skipVersioning: true
 * };
 * ```
 *
 * @since 2.0.0
 */

export type SidebarItemType = DefaultTheme.SidebarItem & {
    /**
     * Determines whether this sidebar item should be excluded from automatic versioning.
     *
     * @default false
     * @remarks
     * When `true`, this sidebar item will remain consistent across all documentation versions.
     *
     * @since 2.0.0
     */

    skipVersioning?: boolean;
}

/**
 * Represents a sidebar group containing multiple sidebar items.
 *
 * @remarks
 * Each group has a `base` path and an array of sidebar items.
 * Useful for organizing related pages under a common path prefix.
 *
 * @example
 * ```ts
 * const group: SidebarGroupInterface = {
 *   base: "/guide/",
 *   items: [
 *     { text: "Introduction", link: "/guide/introduction" },
 *     { text: "Setup", link: "/guide/setup" }
 *   ]
 * };
 * ```
 *
 * @see SidebarItemType
 * @since 2.0.0
 */

export interface SidebarGroupInterface {
    /**
     * The base path for the sidebar group.
     *
     * @remarks
     * This path is prepended to all child sidebar items within the group.
     * Typically corresponds to the folder containing the group’s pages, e.g., `"en"`.
     *
     * @since 2.0.0
     */

    base: string;

    /**
     * The list of sidebar items within this group.
     *
     * @remarks
     * Each item is typed as {@link SidebarItemType}, which may include links,
     * collapsible sections, or other sidebar elements.
     *
     * @since 2.0.0
     */

    items: Array<SidebarItemType>;
}

/**
 * Represents a mapping of paths to sidebar items or groups.
 *
 * @remarks
 * The keys are path strings, and the values can be either:
 * - An array of sidebar items (`SidebarItemType[]`), or
 * - A sidebar group (`SidebarGroupInterface`).
 *
 * @example
 * ```ts
 * const sidebar: PathSidebarInterface = {
 *   guide: [
 *     { text: "Intro", link: "/guide/intro" },
 *     { text: "Setup", link: "/guide/setup" }
 *   ],
 *   api: { base: "/api/", items: [ { text: "Functions", link: "/api/functions" } ] }
 * };
 * ```
 *
 * @see SidebarItemType
 * @see SidebarGroupInterface
 *
 * @since 2.0.0
 */

export interface PathSidebarInterface {
    [path: string]: Array<SidebarItemType> | SidebarGroupInterface;
}

/**
 * Represents the sidebar structure.
 *
 * @remarks
 * Can be either:
 * - An array of sidebar items (`SidebarItemType[]`), or
 * - A path-based mapping of sidebar items or groups (`PathSidebarInterface`).
 *
 * @see SidebarItemType
 * @see PathSidebarInterface
 *
 * @since 2.0.0
 */

export type SidebarType = Array<SidebarItemType> | PathSidebarInterface;
