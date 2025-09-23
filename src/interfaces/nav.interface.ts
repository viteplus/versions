/**
 * Import will remove at compile time
 */

import type { DefaultTheme } from 'vitepress';

/**
 * Represents a component-based navigation item from VitePress.
 *
 * @remarks
 * This type is directly imported from VitePress and allows using custom
 * Vue components as navigation items.
 *
 * @since 2.0.0
 */

export type NavItemComponentType = DefaultTheme.NavItemComponent;

/**
 * Represents a navigation item with a link.
 *
 * @remarks
 * Extends VitePress's {@link DefaultTheme.NavItemWithLink} with an optional
 * `skipVersioning` flag. Use `skipVersioning` to indicate that this
 * navigation item should not be automatically versioned in multi-version
 * documentation setups.
 *
 * @example
 * ```ts
 * const navItem: NavItemWithLinkType = {
 *   text: "Home",
 *   link: "/",
 *   skipVersioning: true
 * };
 * ```
 *
 * @since 2.0.0
 */

export type NavItemWithLinkType = DefaultTheme.NavItemWithLink & {
    /**
     * Indicates whether this navigation item should be excluded from automatic versioning.
     *
     * @default false
     * @remarks
     * When set to `true`, this item will remain the same across all documentation versions.
     *
     * @since 2.0.0
     */

    skipVersioning?: boolean;
};

/**
 * Represents a navigation item with children.
 *
 * @remarks
 * Extends VitePress's {@link DefaultTheme.NavItemWithChildren} but requires
 * `items` to be an array of navigation items of various types:
 * - {@link NavItemComponentType}
 * - {@link NavItemWithLinkType}
 * - Recursively, {@link NavItemWithChildrenType}
 *
 * Supports the optional `skipVersioning` flag to exclude the item from automatic
 * versioning in multi-version documentation setups.
 *
 * @example
 * ```ts
 * const nav: NavItemWithChildrenType = {
 *   text: "Docs",
 *   items: [
 *     { text: "Guide", link: "/guide/" },
 *     {
 *       text: "API",
 *       items: [
 *         { text: "Functions", link: "/api/functions" }
 *       ]
 *     }
 *   ],
 *   skipVersioning: true
 * };
 * ```
 *
 * @since 2.0.0
 */

export type NavItemWithChildrenType = Omit<DefaultTheme.NavItemWithChildren, 'items'> & {
    /**
     * Child navigation items for this item.
     *
     * @remarks
     * Can include standard components, link items, or nested child items.
     *
     * @since 2.0.0
     */

    items: Array<NavItemComponentType | NavItemWithChildrenType | NavItemWithLinkType>;

    /**
     * Indicates whether this navigation item should be excluded from automatic versioning.
     *
     * @default false
     * @remarks
     * When set to `true`, this item and all its children remain unchanged across versions.
     *
     * @since 2.0.0
     */

    skipVersioning?: boolean;
};

/**
 * Represents a single navigation item of any type.
 *
 * @remarks
 * Can be a component, a link, or a navigation item with children.
 *
 * @since 2.0.0
 */

export type NavItemType = NavItemComponentType | NavItemWithLinkType | NavItemWithChildrenType;

/**
 * Represents a record of named navigation groups.
 *
 * @remarks
 * - Each key in the record is a group identifier (commonly a section name or locale).
 * - Each value is an array of {@link NavItemType}, which can include links, components,
 *   or nested navigation structures.
 * - Useful for organizing navigation into multiple top-level groups instead of a single array.
 *
 * @example
 * ```ts
 * const nav: NavObjectType = {
 *   root: [
 *     { text: "Home", link: "/" },
 *     { text: "Guide", link: "/guide/" }
 *   ],
 *   'v1.0.0': [
 *     { text: "Functions", link: "/api/functions" },
 *     { text: "Classes", link: "/api/classes" }
 *   ]
 * };
 * ```
 *
 * @since 2.0.0
 */

export type NavObjectType = Record<string, Array<NavItemType>>;

/**
 * Represents the navigation structure.
 *
 * @remarks
 * Can be either:
 * - An array of navigation items (`NavItemType[]`), or
 * - A record mapping strings (e.g., section names) to arrays of navigation items.
 *
 * @since 2.0.0
 */

export type NavType = Array<NavItemType> | NavObjectType;
