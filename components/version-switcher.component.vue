<script setup lang="ts">

/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { PropsInterface } from './version-switcher.component';

/**
 * Imports
 */

import { useVersionSwitcher } from './version-switcher.component';
import VPFlyout from 'vitepress/dist/client/theme-default/components/VPFlyout.vue';
import VPMenuLink from 'vitepress/dist/client/theme-default/components/VPMenuLink.vue';

/**
 * The props that the theme layout passed to the switcher.
 *
 * @see PropsInterface
 * @since 2.1.0
 */

const props = defineProps<PropsInterface>();

/**
 * The reactive state and the handlers that the template renders.
 *
 * @see useVersionSwitcher
 * @since 2.1.0
 */

const {
    isOpen,
    toggle,
    hasVersions,
    activeVersion,
    availableVersions,
    createVersionMenuItem,
    shouldShowCurrentVersion
} = useVersionSwitcher(props);
</script>

<template>
    <template v-if="hasVersions">
        <!-- Desktop flyout -->
        <VPFlyout
            v-if="!screenMenu"
            class="VPVersionSwitcher"
            icon="vpi-versioning"
            :button="activeVersion"
            label="Switch Version"
        >
            <ul class="items">
                <VPMenuLink
                    v-if="shouldShowCurrentVersion"
                    :item="createVersionMenuItem(versioningPlugin.currentVersion)"
                />
                <VPMenuLink
                    v-for="version in availableVersions"
                    :key="version"
                    :item="createVersionMenuItem(version)"
                />
            </ul>
        </VPFlyout>

        <!-- Mobile dropdown -->
        <div v-else class="VPScreenVersionSwitcher" :class="{ open: isOpen }">
            <button
                class="button"
                type="button"
                aria-controls="navbar-group-version"
                :aria-expanded="isOpen"
                @click="toggle"
            >
        <span class="button-text">
          <span class="vpi-versioning icon" />
          Switch Version
        </span>
                <span class="vpi-plus button-icon" />
            </button>

            <ul id="navbar-group-version" class="items">
                <VPMenuLink :item="createVersionMenuItem(versioningPlugin.currentVersion)" />
                <VPMenuLink
                    v-for="version in versioningPlugin.versions"
                    :key="version"
                    :item="createVersionMenuItem(version)"
                />
            </ul>
        </div>
    </template>
</template>

<style scoped src="./styles/scoped.css"></style>
<style src="./styles/version-switcher.css"></style>
