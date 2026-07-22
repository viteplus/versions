# @viteplus/versions

[![Documentation](https://img.shields.io/badge/Documentation-orange?logo=typescript&logoColor=f5f5f5)](https://viteplus.github.io/versions/)
[![npm version](https://img.shields.io/npm/v/@viteplus/versions.svg)](https://www.npmjs.com/package/@viteplus/versions)
[![downloads](https://img.shields.io/npm/dm/@viteplus/versions?label=npm%20downloads)](https://www.npmjs.com/package/@viteplus/versions)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![CI](https://github.com/viteplus/versions/actions/workflows/ci.yml/badge.svg)](https://github.com/viteplus/versions/actions/workflows/ci.yml)
[![Discord](https://img.shields.io/discord/1422908712116420659?logo=Discord&label=Discord)](https://discord.gg/6vgFhJTEGn)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/viteplus/versions)

A VitePress plugin for versioned documentation. Call `defineVersionedConfig` instead of VitePress's
`defineConfig` and it manages versioned routes, a per-version sidebar and navigation, and a `VersionSwitcher`
component - so a single site can serve your current docs alongside frozen copies of every previous version.

It is designed for documentation that evolves across releases, with version-aware localization, automatic URL
rewriting, and per-version configuration that lets each version keep its own navigation. It builds on the API
pioneered by [vitepress-versioning-plugin](https://github.com/IMB11/vitepress-versioning-plugin) and supports
VitePress v1.6.4 and the v2.x line.

## Key Features

- **Versioned routes**: serve the current docs from `src/` at the root and each `archive/` subfolder as a frozen, separately-routed version.
- **Per-version navigation**: give every version its own nav and sidebar, or share one configuration across all of them.
- **Version switcher**: a built-in `VersionSwitcher` component that lists every version and switches between them.
- **Version-aware localization**: full multi-language support, with locale and version combined into clean URLs.
- **Smart URL rewriting**: automatic, predictable paths, customizable through a `rewritesHook`.
- **Drop-in**: wraps VitePress's config and keeps every native VitePress feature.

## Installation

```bash
npm install @viteplus/versions
# or
pnpm add @viteplus/versions
# or
yarn add @viteplus/versions
```

@viteplus/versions requires Node.js 20 or later and works with VitePress v1.6.4 and the v2.x line.

## Quick start

```ts
// .vitepress/config.ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    title: 'My Project Documentation',
    description: 'Documentation with version control',
    versionsConfig: {
        current: 'v2.0.0',
        versionSwitcher: {
            text: 'Version',
            includeCurrentVersion: true
        }
    },
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/' },
            { component: 'VersionSwitcher' }
        ]
    }
});
```

Current-version content lives in `docs/src` and is served at the site root; each subfolder of `docs/archive`
becomes a frozen version. `defineVersionedConfig` wires the routing - you do not set `srcDir` yourself.

## Theme setup

Register the `VersionSwitcher` component in your theme so it can be placed in the nav or used directly.

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import VersionSwitcher from '@viteplus/versions/components/version-switcher.component.vue';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('VersionSwitcher', VersionSwitcher);
    }
};
```

## Project structure

```text
docs/
├── .vitepress/
│   └── config.ts
├── src/            // current version content (served at the root)
│   ├── index.md
│   └── guide/
└── archive/        // archived versions (each subfolder is one frozen version)
    └── v1.0.x/
        ├── index.md
        └── guide/
```

## Localization

Add locale subfolders under `src` and each `archive/<version>`; the default URL layout is `locale/version/source`.

```ts
export default defineVersionedConfig({
    locales: {
        root: { lang: 'en', label: 'English' },
        de:   { lang: 'de', label: 'Deutsch' }
    }
});
```

## Version-specific navigation

`nav` and `sidebar` each accept an array (shared by every version) or an object keyed by version, where `root`
is the current version. Version-specific entries are self-contained and do not inherit from `root`.

```ts
export default defineVersionedConfig({
    themeConfig: {
        nav: {
            // Default navigation for the current version
            root: [
                { text: 'Home', link: '/' },
                { text: 'Guide', link: '/guide/' }
            ],
            // Navigation only for v1.0.x
            'v1.0.x': [
                { text: 'Home', link: '/' },
                { text: 'Legacy API', link: '/legacy-api/' }
            ]
        }
    }
});
```

## Custom URL structure

Control how source paths map to URLs with `rewritesHook`.

```ts
export default defineVersionedConfig({
    versionsConfig: {
        hooks: {
            // version first, then locale
            rewritesHook: (source, version, locale) => `${version}/${locale}/${source}`
        }
    }
});
```

## Documentation

Full guides and the configuration reference live at
**[viteplus.github.io/versions](https://viteplus.github.io/versions/)**.

## Contributing

Contributions are welcome! Open an [issue](https://github.com/viteplus/versions/issues) or a pull request on
GitHub. See the [contributing guidelines](CONTRIBUTING.md) for setup and conventions.

## Links

[Documentation](https://viteplus.github.io/versions/),
[GitHub Repository](https://github.com/viteplus/versions),
[Issue Tracker](https://github.com/viteplus/versions/issues),
[npm Package](https://www.npmjs.com/package/@viteplus/versions)

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.
