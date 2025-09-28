# @viteplus/versions

A plugin for VitePress that enables versioned documentation,
including automatic versioned routes, sidebars, navigation, and a version switcher component.

> This is based on same API like [vitepress-versioning-plugin](https://github.com/IMB11/vitepress-versioning-plugin)

## Installation

Install the plugin using your preferred package manager:

```bash
pnpm install @viteplus/versions
# or
npm install @viteplus/versions
# or
yarn add @viteplus/versions
```

## Basic Setup

### Ensure Relative Links

All links in your `markdown` files must be relative.
This is critical because the plugin relies on relative paths to determine the correct versioned file to link to.

Example: Linking docs/guide/advanced-setup.md from docs/guide/getting-started.md:

```text
./advanced-setup.md
```

Example: Linking docs/help/faq.md from docs/guide/getting-started.md:

```text
../help/faq.md
```

> [!CAUTION]
> Absolute links like /guide/getting-started will break versioned navigation.

### Configure Versioning

Replace defineConfig in .vitepress/config.ts with defineVersionedConfig:

```ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    root: 'docs', // root folder 
    title: 'SomeProject',
    base: '/SomeProject/', // in case github page that have prefix 
    srcDir: 'src',
    versioning: {
        latestVersion: '1.0.0',
    }
});
```

### Version Switcher Component

To use a custom version switcher component:

Import and register it in your theme config:

```ts
/**
 * Import will remove at compile time
 */

import type { VNode } from '@vue/runtime-core';
import type { Awaitable, Theme } from 'vitepress';

/**
 * Styles
 */

import './style.css';

/**
 * Imports
 */

import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import VersionSwitcher from '@viteplus/versions/components/version-switcher.component.vue'; // [!code focus]

export default {
    extends: DefaultTheme,
    Layout: (): VNode => {
        return h(DefaultTheme.Layout, null, {
        });
    },
    enhanceApp({ app }): Awaitable<void> { // [!code focus]
        app.component('VersionSwitcher', VersionSwitcher); // [!code focus]
    } // [!code focus]
} satisfies Theme;
```

Add it to your navbar:

```ts
themeConfig: {
  versionSwitcher: false, // hide default switcher
  nav: [
    ...,
    {
      component: 'VersionSwitcher', // [!code focus]
    },
  ]
}
```

## Troubleshooting:

Sidebar Cannot Be an Array:

```ts
// ❌ Incorrect
sidebar: [
  { text: '1.0.0', link: '/' },
]

// ✅ Correct
sidebar: {
  '/': [
    { text: '1.0.0', link: '/' },
  ]
}
```
