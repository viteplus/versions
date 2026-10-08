/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Ref, ComputedRef } from 'vue';

/**
 * Imports
 */

import { computed, ref } from 'vue';
import { useData, useRouter } from 'vitepress';

/**
 * The versioning state that the plugin hands to the theme.
 *
 * @remarks
 * The plugin builds this object at configuration time and injects it into the theme layout,
 * so the switcher reads the published versions from its prop instead of the site configuration.
 *
 * @example
 * ```ts
 * const versioningPlugin: VersioningPluginInterface = {
 *     routes: { 'v1.0.x': [ 'v1.0.x/guide/index.md' ] },
 *     versions: new Set([ 'v1.0.x' ]),
 *     currentVersion: 'v2.0.x'
 * };
 * ```
 *
 * @since 2.1.0
 */

export interface VersioningPluginInterface {
    /**
     * The routes that every version publishes, keyed by version label.
     *
     * @remarks
     * A route is written exactly as VitePress serves it,
     * so it keeps its version prefix and the `.md` extension of its source file.
     * An older plugin ships no such record, and the switcher then trusts every path it builds.
     *
     * @example
     * ```ts
     * const { routes } = versioningPlugin;
     * routes; // { 'v1.0.x': [ 'v1.0.x/guide/index.md' ] }
     * ```
     *
     * @since 2.1.0
     */

    routes?: Record<string, Array<string>>;

    /**
     * The archived versions that the site publishes.
     *
     * @remarks
     * The current version is not a member of this set,
     * so the switcher adds it to the menu as a separate entry.
     *
     * @example
     * ```ts
     * const { versions } = versioningPlugin;
     * versions; // Set { 'v1.0.x', 'v0.9.x' }
     * ```
     *
     * @since 2.1.0
     */

    versions: Set<string>;

    /**
     * The label of the version that the site serves at its root.
     *
     * @remarks
     * A path built for this version carries no version segment at all,
     * which is why the switcher strips every version segment before it rebuilds a path.
     *
     * @example
     * ```ts
     * const { currentVersion } = versioningPlugin;
     * currentVersion; // 'v2.0.x'
     * ```
     *
     * @since 2.1.0
     */

    currentVersion: string;
}

/**
 * The props that the theme layout passes to the switcher.
 *
 * @remarks
 * One component serves both layouts, and `screenMenu` is what tells the two apart.
 *
 * @example
 * ```ts
 * const props: PropsInterface = { versioningPlugin, screenMenu: true };
 * ```
 *
 * @since 2.1.0
 */

export interface PropsInterface {
    /**
     * The versioning state that the plugin injected into the theme.
     *
     * @example
     * ```ts
     * const { versioningPlugin } = props;
     * versioningPlugin; // { versions: Set { 'v1.0.x' }, currentVersion: 'v2.0.x' }
     * ```
     *
     * @see VersioningPluginInterface
     * @since 2.1.0
     */

    versioningPlugin: VersioningPluginInterface;

    /**
     * Whether the switcher renders as the mobile dropdown.
     *
     * @remarks
     * When `true`, the component renders a collapsible group for the mobile navigation screen.
     * When `false` or omitted, it renders the flyout of the desktop navigation bar.
     *
     * @example
     * ```ts
     * const { screenMenu } = props;
     * screenMenu; // true inside the mobile navigation screen
     * ```
     *
     * @since 2.1.0
     */

    screenMenu?: boolean;

    /**
     * The tag that marks the current version as the latest one.
     *
     * @remarks
     * The switcher appends the tag in parentheses to the current version wherever it shows that label,
     * so the reader can tell the latest version apart from the archived ones.
     * When omitted, the tag reads `latest`, and an empty string turns it off.
     * A current version whose label already equals the tag is left as it is.
     *
     * The plugin passes the `props` of the nav item through,
     * so the tag is set where the component is placed in the navigation.
     *
     * @example
     * ```ts
     * const nav = [{ component: 'VersionSwitcher', props: { latestLabel: 'neueste' } }];
     * // the current version reads 'v2.0.x (neueste)'
     * ```
     *
     * @see https://github.com/viteplus/versions/issues/44
     * @since 2.2.0
     */

    latestLabel?: string;

    /**
     * The label of the switcher button.
     *
     * @remarks
     * The desktop flyout shows it as the accessible label of its button,
     * and the mobile dropdown shows it as the text of its button.
     * When omitted, it reads `Switch Version`.
     *
     * The plugin passes the `props` of the nav item through,
     * so the label is set where the component is placed in the navigation.
     *
     * @example
     * ```ts
     * const nav = [{ component: 'VersionSwitcher', props: { label: 'Version wechseln' } }];
     * // the button reads 'Version wechseln'
     * ```
     *
     * @see https://github.com/viteplus/versions/issues/51
     * @since 2.3.0
     */

    label?: string;
}

/**
 * The shape of a single entry of the version menu.
 *
 * @remarks
 * `VPMenuLink` of the default theme consumes this shape as it is,
 * so an entry needs no further mapping before it renders.
 *
 * @example
 * ```ts
 * const item: VersionMenuItemInterface = { text: 'v1.0.x', link: '/v1.0.x/guide/index.md' };
 * ```
 *
 * @since 2.1.0
 */

export interface VersionMenuItemInterface {
    /**
     * The label that the entry shows.
     *
     * @remarks
     * The version label is used verbatim, so the menu reads the same as the archive folders.
     * The current version alone carries the tag of {@link PropsInterface.latestLabel}.
     *
     * @example
     * ```ts
     * const { text } = item;
     * text; // 'v1.0.x'
     * ```
     *
     * @since 2.1.0
     */

    text: string;

    /**
     * The path that the entry points at.
     *
     * @example
     * ```ts
     * const { link } = item;
     * link; // '/v1.0.x/guide/index.md'
     * ```
     *
     * @since 2.1.0
     */

    link: string;
}

/**
 * The bindings that {@link useVersionSwitcher} exposes to the template.
 *
 * @remarks
 * Only what the template renders is exposed.
 * Every path helper stays inside the composable, since each one reads the props and the route.
 *
 * @example
 * ```ts
 * const { hasVersions, toggle } = useVersionSwitcher(props);
 * ```
 *
 * @since 2.1.0
 */

export interface VersionSwitcherInterface {
    /**
     * Whether the mobile dropdown is open.
     *
     * @remarks
     * The desktop flyout keeps its own open state, so this ref drives the mobile layout alone.
     *
     * @example
     * ```ts
     * isOpen.value; // false while the dropdown is collapsed
     * ```
     *
     * @since 2.1.0
     */

    isOpen: Ref<boolean>;

    /**
     * Whether the site publishes any archived version.
     *
     * @remarks
     * The component renders nothing while the set is empty,
     * so a site with no archive keeps its navigation bar unchanged.
     *
     * @example
     * ```ts
     * hasVersions.value; // false on a site with no archive
     * ```
     *
     * @since 2.1.0
     */

    hasVersions: ComputedRef<boolean>;

    /**
     * The version label that the current page belongs to.
     *
     * @remarks
     * The version sits in the first segment, or in the second one when a locale leads the path.
     * A page with no version segment belongs to the current version.
     *
     * @example
     * ```ts
     * // on /de/v1.0.x/guide/index.md
     * activeVersion.value; // 'v1.0.x'
     * ```
     *
     * @since 2.1.0
     */

    activeVersion: ComputedRef<string>;

    /**
     * The label of the active version as the switcher shows it.
     *
     * @remarks
     * This is {@link VersionSwitcherInterface.activeVersion} with the tag of {@link PropsInterface.latestLabel}
     * appended when the active version is the current one.
     * The flyout button renders it, while every path helper keeps working with the bare label.
     *
     * @example
     * ```ts
     * // on /de/guide/index.md
     * activeVersionText.value; // 'v2.0.x (latest)'
     * ```
     *
     * @since 2.2.0
     */

    activeVersionText: ComputedRef<string>;

    /**
     * The archived versions that the reader can switch to from the current page.
     *
     * @remarks
     * The active version is left out, so the menu never links to the page the reader already reads.
     *
     * @example
     * ```ts
     * // on /de/v1.0.x/guide/index.md
     * availableVersions.value; // [ 'v0.9.x' ]
     * ```
     *
     * @since 2.1.0
     */

    availableVersions: ComputedRef<Array<string>>;

    /**
     * Whether the desktop menu needs an entry for the current version.
     *
     * @remarks
     * The entry appears only while the reader is on an archived page,
     * since the current version is the active one everywhere else.
     *
     * @example
     * ```ts
     * shouldShowCurrentVersion.value; // true on an archived page
     * ```
     *
     * @since 2.1.0
     */

    shouldShowCurrentVersion: ComputedRef<boolean>;

    /**
     * Builds the menu entry that links to a version.
     *
     * @param version - The version label that the entry points at
     * @returns A {@link VersionMenuItemInterface} carrying the label and the path of that version
     *
     * @remarks
     * The template calls this for every entry it renders,
     * so an entry is built at render time and always points at the page the reader is on.
     *
     * @example
     * ```ts
     * // on /de/guide/index.md
     * createVersionMenuItem('v1.0.x');
     * // { text: 'v1.0.x', link: '/de/v1.0.x/guide/index.md' }
     * ```
     *
     * @since 2.1.0
     */

    createVersionMenuItem(version: string): VersionMenuItemInterface;

    /**
     * Opens or closes the mobile dropdown.
     *
     * @remarks
     * Only the mobile layout calls this, since the desktop flyout keeps its own open state.
     *
     * @example
     * ```ts
     * isOpen.value; // false
     * toggle();
     * isOpen.value; // true
     * ```
     *
     * @since 2.1.0
     */

    toggle(): void;
}

/**
 * Builds the reactive state and the handlers of the version switcher.
 *
 * @param props - The props that the theme layout passed to the component
 * @returns The bindings that the template renders {@link VersionSwitcherInterface}
 *
 * @remarks
 * The composable reads the router and the site data of the running site,
 * so the setup function of the component is the only place that may call it.
 * Every menu entry is rebuilt on render, which keeps the links pointed at the page the reader is on
 * as the reader moves through the site.
 *
 * @example
 * ```ts
 * const props = defineProps<PropsInterface>();
 * const { hasVersions, activeVersion, toggle } = useVersionSwitcher(props);
 * ```
 *
 * @see VersionSwitcherInterface
 * @since 2.1.0
 */

export function useVersionSwitcher(props: PropsInterface): VersionSwitcherInterface {
    const router = useRouter();
    const { site } = useData();
    const isOpen = ref(false);

    /**
     * The archived version labels as a set.
     *
     * @remarks
     * Every segment of every path the switcher handles is tested against this set
     * to tell a version apart from an ordinary segment.
     *
     * @example
     * ```ts
     * const versions = versionSet.value;
     * versions.has('v1.0.x'); // true
     * versions.has('guide');  // false
     * ```
     *
     * @since 2.1.0
     */

    const versionSet = computed(() => new Set([ ...props.versioningPlugin.versions ]));

    /**
     * Whether the site publishes any archived version.
     *
     * @remarks
     * The component renders nothing while the set is empty.
     *
     * @since 2.1.0
     */

    const hasVersions = computed(() => versionSet.value.size > 0);

    /**
     * The prefix of the active locale, without its slashes.
     *
     * @remarks
     * The root locale has no prefix of its own, so this value is an empty string there
     * and no path the switcher builds gains a locale segment.
     *
     * @example
     * ```ts
     * currentLocale.value; // 'de'
     * ```
     *
     * @since 2.1.0
     */

    const currentLocale = computed(() => {
        const { locales, localeIndex } = site.value;

        return locales[localeIndex ?? '']?.link?.replace(/\//g, '') || '';
    });

    /**
     * The relative path of the current page, split on the slash.
     *
     * @remarks
     * VitePress reports the source path here, so the last segment still carries its `.md` extension,
     * and a route of {@link VersioningPluginInterface.routes} matches it as written.
     *
     * @example
     * ```ts
     * pathSegments.value; // [ 'de', 'v1.0.x', 'guide', 'index.md' ]
     * ```
     *
     * @since 2.1.0
     */

    const pathSegments = computed(() => router.route.data.relativePath.split('/'));

    /**
     * The version label that the current page belongs to.
     *
     * @remarks
     * The version sits in the first segment, or in the second one when a locale leads the path.
     * A page with no version segment belongs to the current version.
     *
     * @since 2.1.0
     */

    const activeVersion = computed(() => {
        const { currentVersion } = props.versioningPlugin;
        const segments = pathSegments.value;
        const locale = currentLocale.value;

        // Determine which segment might be the version
        const versionCandidate = segments[0] === locale ? segments[1] : segments[0];

        return versionSet.value.has(versionCandidate) ? versionCandidate : currentVersion;
    });

    /**
     * Builds the label that the switcher shows for a version.
     *
     * @param version - The version label to display
     * @returns The label, tagged as the latest one when it names the current version
     *
     * @remarks
     * The tag comes from {@link PropsInterface.latestLabel} and defaults to `latest`.
     * An empty tag, or a current version that already reads as the tag, leaves the label as it is,
     * so the default `current: 'latest'` never shows as `latest (latest)`.
     *
     * @example
     * ```ts
     * versionText('v2.0.x'); // 'v2.0.x (latest)'
     * versionText('v1.0.x'); // 'v1.0.x'
     * ```
     *
     * @since 2.2.0
     */

    function versionText(version: string): string {
        const tag = props.latestLabel ?? 'latest';
        if (!tag || version !== props.versioningPlugin.currentVersion) return version;
        if (version.toLowerCase() === tag.toLowerCase()) return version;

        return `${ version } (${ tag })`;
    }

    /**
     * The label of the active version as the switcher shows it.
     *
     * @remarks
     * The flyout button renders it, while every path helper keeps working with the bare label.
     *
     * @since 2.2.0
     */

    const activeVersionText = computed(() => versionText(activeVersion.value));

    /**
     * The archived versions that the reader can switch to from the current page.
     *
     * @remarks
     * The active version is left out, so the menu never links to the page the reader already reads.
     *
     * @since 2.1.0
     */

    const availableVersions = computed(() =>
        Array.from(props.versioningPlugin.versions).filter(v => v !== activeVersion.value)
    );

    /**
     * Whether the desktop menu needs an entry for the current version.
     *
     * @remarks
     * The entry appears only while the reader is on an archived page.
     *
     * @since 2.1.0
     */

    const shouldShowCurrentVersion = computed(() =>
        activeVersion.value !== props.versioningPlugin.currentVersion
    );

    /**
     * Tells whether the leading segment of a path is the active locale.
     *
     * @param segments - The path segments to inspect
     * @returns `true` when the first segment matches the active locale
     *
     * @remarks
     * The root locale resolves to an empty prefix, which matches no segment,
     * so a path under the root locale always reports `false`.
     *
     * @example
     * ```ts
     * isLocaleFirst([ 'de', 'guide', 'index.md' ]); // true
     * isLocaleFirst([ 'guide', 'index.md' ]);       // false
     * ```
     *
     * @since 2.1.0
     */

    function isLocaleFirst(segments: Array<string>): boolean {
        return segments[0] === currentLocale.value;
    }

    /**
     * Strips every version segment out of a path.
     *
     * @param segments - The path segments to filter
     * @returns The segments that name no version
     *
     * @remarks
     * The result is the version-free form of the path,
     * which the switcher then rebuilds for the version the reader picked.
     *
     * @example
     * ```ts
     * removeVersionSegments([ 'de', 'v1.0.x', 'guide', 'index.md' ]);
     * // [ 'de', 'guide', 'index.md' ]
     * ```
     *
     * @since 2.1.0
     */

    function removeVersionSegments(segments: Array<string>): Array<string> {
        return segments.filter(seg => !versionSet.value.has(seg));
    }

    /**
     * Tells whether a version publishes the given path.
     *
     * @param version - The version label to look the path up in
     * @param path - The path to check, with its leading slash
     * @returns `true` when the version publishes the path, or when the plugin lists no routes
     *
     * @remarks
     * The plugin lists the routes of every version, so the switcher can check a link before it renders.
     * An older plugin, or the component used on its own, ships no such list,
     * and the check then passes for every path.
     *
     * @example
     * ```ts
     * routeExists('v1.0.x', '/v1.0.x/guide/index.md'); // true
     * routeExists('v1.0.x', '/v1.0.x/api/index.md');   // false
     * ```
     *
     * @since 2.1.0
     */

    function routeExists(version: string, path: string): boolean {
        const routes = props.versioningPlugin.routes?.[version];
        if (!routes) return true;

        return routes.includes(path.replace(/^\//, ''));
    }

    /**
     * Builds the home path of a version.
     *
     * @param version - The version label to build the home path for
     * @returns The path of that version's home, with a trailing slash
     *
     * @remarks
     * The path keeps the locale of the current page and drops every other segment.
     * The current version takes no version segment, so its home is the locale root.
     *
     * @example
     * ```ts
     * // on /de/v1.0.x/guide/index.md
     * versionHome('v0.9.x'); // '/de/v0.9.x/'
     * versionHome('v2.0.x'); // '/de/'
     * ```
     *
     * @since 2.1.0
     */

    function versionHome(version: string): string {
        const { currentVersion } = props.versioningPlugin;
        const baseSegments = removeVersionSegments(pathSegments.value);
        const locale = isLocaleFirst(baseSegments) ? baseSegments[0] : '';
        const segments = [ locale, version === currentVersion ? '' : version ].filter(Boolean);

        return segments.length ? `/${ segments.join('/') }/` : '/';
    }

    /**
     * Builds the path of the current page in another version.
     *
     * @param version - The version label to move the current page to
     * @returns The path of the page in that version, or that version's home when the page is missing there
     *
     * @remarks
     * The switcher drops every version segment first,
     * then puts the picked version behind the locale where the path carries one, and in front otherwise.
     * The current version takes no segment at all, since the site serves it at its root.
     *
     * A reader who leaves a page that the other version never published would land on a dead link,
     * so {@link routeExists} checks the path and {@link versionHome} takes over when the check fails.
     *
     * @example
     * ```ts
     * // on /de/v1.0.x/guide/index.md
     * buildVersionPath('v2.0.x'); // '/de/guide/index.md'
     * buildVersionPath('v0.9.x'); // '/de/v0.9.x/' when v0.9.x has no guide page
     * ```
     *
     * @see routeExists
     * @see versionHome
     *
     * @since 2.1.0
     */

    function buildVersionPath(version: string): string {
        const { currentVersion } = props.versioningPlugin;
        const baseSegments = removeVersionSegments(pathSegments.value);
        const hasLocale = isLocaleFirst(baseSegments);

        let newSegments: Array<string>;

        if (version === currentVersion) {
            newSegments = baseSegments;
        } else if (hasLocale) {
            newSegments = [ baseSegments[0], version, ...baseSegments.slice(1) ];
        } else {
            newSegments = [ version, ...baseSegments ];
        }

        const path = `/${ newSegments.join('/') }`;

        return routeExists(version, path) ? path : versionHome(version);
    }

    /**
     * Builds the menu entry that links to a version.
     *
     * @param version - The version label that the entry points at
     * @returns A {@link VersionMenuItemInterface} carrying the label and the path of that version
     *
     * @remarks
     * The template calls this for every entry it renders.
     *
     * @since 2.1.0
     */

    function createVersionMenuItem(version: string): VersionMenuItemInterface {
        return {
            text: versionText(version),
            link: buildVersionPath(version)
        };
    }

    /**
     * Opens or closes the mobile dropdown.
     *
     * @remarks
     * Only the mobile layout calls this.
     *
     * @since 2.1.0
     */

    function toggle(): void {
        isOpen.value = !isOpen.value;
    }

    return {
        isOpen,
        toggle,
        hasVersions,
        activeVersion,
        activeVersionText,
        availableVersions,
        createVersionMenuItem,
        shouldShowCurrentVersion
    };
}
