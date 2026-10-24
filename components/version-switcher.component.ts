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
 * The plugin builds this object at configuration time and passes it to every `VersionSwitcher` nav item,
 * so the switcher reads the published versions from its prop instead of the site configuration.
 *
 * @example
 * ```ts
 * const versioningPlugin: VersioningPluginInterface = {
 *     routes: { 'v1.0.x': [ 'v1.0.x/guide/index.md' ] },
 *     labels: { 'v1.0.x': 'v1.0.x (LTS)' },
 *     versions: [ 'next', 'v2.0.x', 'v1.0.x' ],
 *     latestVersion: 'v2.0.x'
 * };
 * ```
 *
 * @since 2.1.0
 */

export interface VersioningPluginInterface {
    /**
     * The routes that every version publishes, keyed by version name.
     *
     * @remarks
     * A route is written exactly as VitePress serves it, with its version prefix and the `.md` extension.
     * Without this record, the switcher trusts every path it builds.
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
     * The text to show for each version, keyed by version name.
     *
     * @remarks
     * A version missing from the record shows its name.
     *
     * @example
     * ```ts
     * const { labels } = versioningPlugin;
     * labels; // { 'v1.0.x': 'v1.0.x (LTS)' }
     * ```
     *
     * @since 3.0.0
     */

    labels?: Record<string, string>;

    /**
     * The names of every published version, in menu order.
     *
     * @example
     * ```ts
     * const { versions } = versioningPlugin;
     * versions; // [ 'next', 'v2.0.x', 'v1.0.x' ]
     * ```
     *
     * @since 2.1.0
     */

    versions: Array<string>;

    /**
     * The name of the stable version.
     *
     * @remarks
     * The switcher tags it with {@link PropsInterface.latestLabel},
     * and a page with no version segment, such as the home page at the root, belongs to it.
     *
     * @example
     * ```ts
     * const { latestVersion } = versioningPlugin;
     * latestVersion; // 'v2.0.x'
     * ```
     *
     * @since 3.0.0
     */

    latestVersion: string;
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
     * versioningPlugin; // { versions: [ 'v2.0.x', 'v1.0.x' ], latestVersion: 'v2.0.x' }
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
     * The tag that marks the stable version as the latest one.
     *
     * @remarks
     * The switcher appends the tag in parentheses to the label of the stable version.
     * When omitted, the tag reads `latest`, and an empty string turns it off.
     * A label that already equals the tag is left as it is.
     *
     * @example
     * ```ts
     * const nav = [{ component: 'VersionSwitcher', props: { latestLabel: 'neueste' } }];
     * // the stable version reads 'v2.0.x (neueste)'
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
 * `VPMenuLink` of the default theme consumes this shape as it is.
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
     * @example
     * ```ts
     * const { text } = item;
     * text; // 'v1.0.x (LTS)'
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
     * @example
     * ```ts
     * isOpen.value; // false while the dropdown is collapsed
     * ```
     *
     * @since 2.1.0
     */

    isOpen: Ref<boolean>;

    /**
     * Whether the site publishes more than one version.
     *
     * @remarks
     * The component renders nothing otherwise, so a site with a single version keeps its navigation bar unchanged.
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
     * The version that the current page belongs to.
     *
     * @remarks
     * The version sits in the first segment of the page path, or in the second one when a locale leads it.
     * A page with no version segment, such as the home page at the root, belongs to the stable version.
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
     * The label of the active version as the switcher button shows it.
     *
     * @example
     * ```ts
     * // on /de/v2.0.x/guide/index.md
     * activeVersionText.value; // 'v2.0.x (latest)'
     * ```
     *
     * @since 2.2.0
     */

    activeVersionText: ComputedRef<string>;

    /**
     * The versions that the reader can switch to, without the active one.
     *
     * @example
     * ```ts
     * // on /de/v1.0.x/guide/index.md
     * availableVersions.value; // [ 'next', 'v2.0.x' ]
     * ```
     *
     * @since 2.1.0
     */

    availableVersions: ComputedRef<Array<string>>;

    /**
     * Builds the menu entry that links to a version.
     *
     * @param version - The name of the version that the entry points at
     * @returns A {@link VersionMenuItemInterface} with the label of the version and the path of the current page in it
     *
     * @remarks
     * The link keeps the locale and the page of the reader.
     * When the version never published that page, the link falls back to the home page of the version.
     *
     * @example
     * ```ts
     * // on /de/v2.0.x/guide/index.md
     * createVersionMenuItem('v1.0.x'); // { text: 'v1.0.x (LTS)', link: '/de/v1.0.x/guide/index.md' }
     * ```
     *
     * @since 2.1.0
     */

    createVersionMenuItem(version: string): VersionMenuItemInterface;

    /**
     * Opens or closes the mobile dropdown.
     *
     * @example
     * ```ts
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
 * The composable reads the router and the site data, so only the setup function of the component may call it.
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

    const versions = computed(() => new Set(props.versioningPlugin.versions));
    const locale = computed(() => site.value.locales[site.value.localeIndex ?? '']?.link?.replace(/\//g, '') || '');
    const segments = computed(() => router.route.data.relativePath.split('/'));

    const activeVersion = computed(() => {
        const [ first, second ] = segments.value;
        const candidate = first === locale.value ? second : first;

        return versions.value.has(candidate) ? candidate : props.versioningPlugin.latestVersion;
    });

    function versionText(version: string): string {
        const tag = props.latestLabel ?? 'latest';
        const label = props.versioningPlugin.labels?.[version] ?? version;
        const tagged = tag && version === props.versioningPlugin.latestVersion && label.toLowerCase() !== tag.toLowerCase();

        return tagged ? `${ label } (${ tag })` : label;
    }

    function createVersionMenuItem(version: string): VersionMenuItemInterface {
        const page = segments.value.filter((segment: string) => !versions.value.has(segment));
        const index = page[0] === locale.value ? 1 : 0;
        const home = `/${ [ ...page.slice(0, index), version, '' ].join('/') }`;

        page.splice(index, 0, version);
        const path = page.join('/');
        const routes = props.versioningPlugin.routes?.[version];

        return { text: versionText(version), link: !routes || routes.includes(path) ? `/${ path }` : home };
    }

    return {
        isOpen,
        hasVersions: computed(() => versions.value.size > 1),
        activeVersion,
        activeVersionText: computed(() => versionText(activeVersion.value)),
        availableVersions: computed(() => [ ...versions.value ].filter(version => version !== activeVersion.value)),
        createVersionMenuItem,
        toggle: () => (isOpen.value = !isOpen.value)
    };
}
