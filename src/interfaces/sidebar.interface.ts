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
 * Represents the overall sidebar configuration.
 *
 * @remarks
 * Can be defined in one of two ways:
 * - As a flat array of {@link SidebarItemType}, or
 * - As a path-based mapping using {@link PathSidebarInterface}.
 *
 * This flexibility allows defining either a single global sidebar
 * or multiple sidebars scoped to different route prefixes.
 *
 * @example
 * Flat sidebar:
 * ```ts
 * const sidebar: SidebarType = [
 *   { text: "Home", link: "/" },
 *   { text: "Guide", link: "/guide/" }
 * ];
 * ```
 *
 * @example
 * Path-based sidebars:
 * ```ts
 * const sidebar: SidebarType = {
 *   "/guide/": [
 *     { text: "Introduction", link: "/guide/introduction" }
 *   ],
 *   "/api/": [
 *     { text: "API Reference", link: "/api/" }
 *   ]
 * };
 * ```
 *
 * @see SidebarItemType
 * @see PathSidebarInterface
 *
 * @since 2.0.0
 */

export type SidebarType = Array<SidebarItemType> | PathSidebarInterface;

/**
 * Represents a mapping of paths to sidebar item arrays.
 *
 * @remarks
 * This structure allows defining sidebars on a per-path basis,
 * where each key is a route prefix (e.g., `"/guide/"`) and its value
 * is an array of {@link SidebarItemType}.
 *
 * @example
 * ```ts
 * const sidebars: SidebarObjectType = {
 *   "/guide/": [
 *     { text: "Introduction", link: "/guide/introduction" },
 *     { text: "Setup", link: "/guide/setup" }
 *   ],
 *   "/api/": [
 *     { text: "API Reference", link: "/api/" }
 *   ]
 * };
 * ```
 *
 * @see SidebarItemType
 * @since 2.0.0
 */

export type SidebarObjectType = Record<string, Array<SidebarItemType>>;
