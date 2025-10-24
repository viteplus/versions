<script setup lang="ts">
/**
 * Imports
 */

import { computed, ref } from 'vue';
import { useData, useRouter } from 'vitepress';

/**
 * Imports from VitePress
 */

import VPFlyout from 'vitepress/dist/client/theme-default/components/VPFlyout.vue';
import VPMenuLink from 'vitepress/dist/client/theme-default/components/VPMenuLink.vue';

/**
 * Interfaces
 */

interface VersioningPlugin {
    versions: Set<string>;
    currentVersion: string;
}

/**
 * Defines
 */

const router = useRouter();
const isOpen = ref(false);
const { site } = useData();
const props = defineProps<{
    versioningPlugin: VersioningPlugin
    screenMenu?: boolean
}>();

const versionSet = computed(() => new Set([ ...props.versioningPlugin.versions ]));
const hasVersions = computed(() => versionSet.value.size > 0);

const getActiveVersion = computed(() => {
    const segments = router.route.data.relativePath.split('/');
    const { currentVersion } = props.versioningPlugin;
    const locale = site.value.locales[site.value.localeIndex].link.replace(/\//g, '');

    // Check if the first segment is locale, use the second segment if so, otherwise first
    const candidate = segments[0] === locale ? segments[1] : segments[0];

    return versionSet.value.has(candidate) ? candidate : currentVersion;
});

function createVersionMenuItem(version: string): { text: string, link: string } {
    const { currentVersion } = props.versioningPlugin;
    const segments = router.route.data.relativePath.split('/');
    const locale = site.value.locales[site.value.localeIndex].link.replace(/\//g, '');

    // Filter out version segments
    const baseSegments = segments.filter(seg => !versionSet.value.has(seg));

    // Check if first segment matches current locale
    const langIsFirst = baseSegments[0] === locale;

    let newSegments: string[];
    if (version === currentVersion) {
        newSegments = baseSegments;
    } else if (langIsFirst) {
        newSegments = [ baseSegments[0], version, ...baseSegments.slice(1) ];
    } else {
        newSegments = [ version, ...baseSegments ];
    }

    return { text: version, link: `/${ newSegments.join('/') }` };
}

function toggle() {
    isOpen.value = !isOpen.value;
}
</script>

<template>
    <!-- Only render if versions exist -->
    <template v-if="hasVersions">
        <!-- Desktop version flyout -->
        <VPFlyout
            v-if="!screenMenu"
            class="VPVersionSwitcher"
            icon="vpi-versioning"
            :button="getActiveVersion"
            label="Switch Version"
        >
            <div class="items">
                <!-- Only show latest version link if we're not already on latest -->
                <VPMenuLink
                    v-if="getActiveVersion !== versioningPlugin.currentVersion"
                    :item="createVersionMenuItem(versioningPlugin.currentVersion)"
                />
                <!-- Show all version links except current version -->
                <template v-for="version in versioningPlugin.versions" :key="version">
                    <VPMenuLink
                        v-if="getActiveVersion !== version"
                        :item="createVersionMenuItem(version)"
                    />
                </template>
            </div>
        </VPFlyout>

        <!-- Mobile version dropdown -->
        <div v-else class="VPScreenVersionSwitcher" :class="{ open: isOpen }">
            <button
                class="button"
                aria-controls="navbar-group-version"
                :aria-expanded="isOpen"
                @click="toggle"
            >
          <span class="button-text">
            <span class="vpi-versioning icon"/>Switch Version
          </span>
                <span class="vpi-plus button-icon"/>
            </button>

            <div id="navbar-group-version" class="items">
                <!-- Always show latest version link -->
                <VPMenuLink :item="createVersionMenuItem(versioningPlugin.currentVersion)"/>
                <!-- Show all version links -->
                <VPMenuLink
                    v-for="version in versioningPlugin.versions"
                    :key="version"
                    :item="createVersionMenuItem(version)"
                />
            </div>
        </div>
    </template>
</template>
<style>
/* Versioning icon styling */
.vpi-versioning.option-icon {
    margin-right: 2px !important;
}

.vpi-versioning {
    --icon: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iNjRweCIgaGVpZ2h0PSI2NHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHN0cm9rZS13aWR0aD0iMi4yIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNvbG9yPSIjMDAwMDAwIj48cGF0aCBkPSJNMTcgN0MxOC4xMDQ2IDcgMTkgNi4xMDQ1NyAxOSA1QzE5IDMuODk1NDMgMTguMTA0NiAzIDE3IDNDMTUuODk1NCAzIDE1IDMuODk1NDMgMTUgNUMxNSA2LjEwNDU3IDE1Ljg5NTQgNyAxNyA3WiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+PHBhdGggZD0iTTcgN0M4LjEwNDU3IDcgOSA2LjEwNDU3IDkgNUM5IDMuODk1NDMgOC4xMDQ1NyAzIDcgM0M1Ljg5NTQzIDMgNSAzLjg5NTQzIDUgNUM1IDYuMTA0NTcgNS44OTU0MyA3IDcgN1oiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyLjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPjxwYXRoIGQ9Ik03IDIxQzguMTA0NTcgMjEgOSAyMC4xMDQ2IDkgMTlDOSAxNy44OTU0IDguMTA0NTcgMTcgNyAxN0M1Ljg5NTQzIDE3IDUgMTcuODk1NCA1IDE5QzUgMjAuMTA0NiA1Ljg5NTQzIDIxIDcgMjFaIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD48cGF0aCBkPSJNNyA3VjE3IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD48cGF0aCBkPSJNMTcgN1Y4QzE3IDEwLjUgMTUgMTEgMTUgMTFMOSAxM0M5IDEzIDcgMTMuNSA3IDE2VjE3IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD48L3N2Zz4=")
}
</style>

<style scoped>
/* Component styling with minor optimizations */
.VPVersionSwitcher {
    display: flex;
    align-items: center;
}

.icon {
    padding: 8px;
}

.title {
    padding: 0 24px 0 12px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 700;
    color: var(--vp-c-text-1);
}

/* Mobile version switcher styles */
.VPScreenVersionSwitcher {
    border-bottom: 1px solid var(--vp-c-divider);
    height: 48px;
    overflow: hidden;
    transition: border-color 0.5s;
}

.VPScreenVersionSwitcher .items {
    visibility: hidden;
}

.VPScreenVersionSwitcher.open {
    padding-bottom: 10px;
    height: auto;
}

.VPScreenVersionSwitcher.open .items {
    visibility: visible;
}

.VPScreenVersionSwitcher.open .button {
    padding-bottom: 6px;
    color: var(--vp-c-brand-1);
}

.VPScreenVersionSwitcher.open .button-icon {
    /*rtl:ignore*/
    transform: rotate(45deg);
}

.VPScreenVersionSwitcher button .icon {
    margin-right: 8px;
}

.button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 4px 11px 0;
    width: 100%;
    line-height: 24px;
    font-size: 14px;
    font-weight: 500;
    color: var(--vp-c-text-1);
    transition: color 0.25s;
}

.button:hover {
    color: var(--vp-c-brand-1);
}

.button-icon {
    transition: transform 0.25s;
}

/* Group styling */
.group:first-child {
    padding-top: 0;
}

.group + .group,
.group + .item {
    padding-top: 4px;
}
</style>
