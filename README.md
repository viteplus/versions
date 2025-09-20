# @viteplus/versions

[![Documentation](https://img.shields.io/badge/Documentation-orange?logo=typescript&logoColor=f5f5f5)](https://viteplus.github.io/versions/)
[![npm version](https://img.shields.io/npm/v/@viteplus/versions.svg)](https://www.npmjs.com/package/@viteplus/versions)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Node.js CI](https://github.com/viteplus/versions/actions/workflows/node.js.yml/badge.svg)](https://github.com/viteplus/versions/actions/workflows/node.js.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/viteplus/versions)

A plugin for VitePress that enables versioned documentation, including automatic versioned routes, sidebars, navigation, and a version switcher component.

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
1. Ensure Relative Links

All links in your `markdown` files must be relative. 
This is critical because the plugin relies on relative paths to determine the correct versioned file to link to.

- Example: Linking `docs/guide/advanced-setup.md` from `docs/guide/getting-started.md`:
```markdown
./advanced-setup.md
```

- Example: Linking `docs/help/faq.md` from `docs/guide/getting-started.md`:
```markdown
../help/faq.md
```

> [!CAUTION]
> Absolute links like /guide/getting-started will break versioned navigation.

2. Configure Versioning

Replace defineConfig in .vitepress/config.ts with `defineVersionedConfig`:

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

3. Version Switcher Component

To use a custom version switcher component:

1. Import and register it in your theme config:

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
import VersionSwitcher from '@viteplus/versions/components/version-switcher.component.vue';

export default {
    extends: DefaultTheme,
    Layout: (): VNode => {
        return h(DefaultTheme.Layout, null, {
        });
    },
    enhanceApp({ app }): Awaitable<void> {
        app.component('VersionSwitcher', VersionSwitcher);
    }
} satisfies Theme;
```

2. Add it to your navbar:

```ts
themeConfig: {
  versionSwitcher: false, // hide default switcher
  nav: [
    ...,
    {
      component: 'VersionSwitcher',
    },
  ]
}
```

## Troubleshooting
1. Sidebar Cannot Be an Array

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

## Acknowledgments

I would like to express my gratitude to those who inspired and supported this project:
- `@IMB11`, for the original vitepress-versioning-plugin


## Documentation

For complete API documentation, examples, and guides, visit: [Documentation](https://viteplus.github.io/versions/)

## Compatibility

- Node.js 20+
- All modern browsers (via bundlers)
- TypeScript 4.5+
- 
## Contributing

Contributions are welcome!\
Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the Mozilla Public License 2.0 see the [LICENSE](LICENSE) file for details.
