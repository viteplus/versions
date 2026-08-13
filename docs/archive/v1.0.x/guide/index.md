# Getting Started with @viteplus/versions

A plugin for VitePress that enables versioned documentation, including automatic versioned
routes, sidebars, navigation, and a version switcher component.

::: info
This line follows the same API as
[vitepress-versioning-plugin](https://github.com/IMB11/vitepress-versioning-plugin).
:::

## Installation

Install the plugin using your preferred package manager:

::: code-group

```bash [npm]
npm install @viteplus/versions
```

```bash [pnpm]
pnpm add @viteplus/versions
```

```bash [yarn]
yarn add @viteplus/versions
```

:::

## Basic Setup

### Ensure Relative Links

All links in your markdown files must be relative. The plugin relies on relative paths to
resolve the correct versioned file.

Linking `docs/guide/advanced-setup.md` from `docs/guide/getting-started.md`:

```text
./advanced-setup.md
```

Linking `docs/help/faq.md` from `docs/guide/getting-started.md`:

```text
../help/faq.md
```

::: danger
Absolute links such as `/guide/getting-started` break versioned navigation.
:::

### Configure Versioning

Replace `defineConfig` in `.vitepress/config.ts` with `defineVersionedConfig`:

```ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    root: 'docs', // root folder
    title: 'SomeProject',
    base: '/SomeProject/', // for GitHub Pages, which serves under a prefix
    srcDir: 'src',
    versioning: {
        latestVersion: '1.0.0'
    }
});
```

### Version Switcher Component

To use a custom version switcher, register it in your theme config:

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

Then add it to your navbar:

```ts
themeConfig: {
    versionSwitcher: false, // hide the default switcher
    nav: [
        // ...
        {
            component: 'VersionSwitcher' // [!code focus]
        }
    ]
}
```

## Troubleshooting

### The sidebar cannot be an array

```ts
// ❌ Incorrect
sidebar: [
    { text: '1.0.0', link: '/' }
]

// ✅ Correct
sidebar: {
    '/': [
        { text: '1.0.0', link: '/' }
    ]
}
```

## See also

- [Release Notes](../release)
