# @viteplus/versions

[![Documentation](https://img.shields.io/badge/Documentation-orange?logo=typescript&logoColor=f5f5f5)](https://viteplus.github.io/versions/)
[![npm version](https://img.shields.io/npm/v/@viteplus/versions.svg)](https://www.npmjs.com/package/@viteplus/versions)
[![downloads](https://img.shields.io/npm/dm/@viteplus/versions?label=npm%20downloads)](https://www.npmjs.com/package/@viteplus/versions)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![CI](https://github.com/viteplus/versions/actions/workflows/ci.yml/badge.svg)](https://github.com/viteplus/versions/actions/workflows/ci.yml)
[![Discord](https://img.shields.io/discord/1422908712116420659?logo=Discord&label=Discord)](https://discord.gg/6vgFhJTEGn)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/viteplus/versions)

@viteplus/versions is a powerful VitePress plugin that enables versioned documentation with built-in localization support,
seamless navigation between versions, and intelligent URL routing.

## ✨ Features

- **Version Management**: Effortlessly manage multiple documentation versions
- **Localization**: Full multi-language support with version-aware localization
- **Smart URL Routing**: Automatic path rewriting for clean, predictable URLs
- **Version Switcher**: Built-in component for navigating between versions
- **Flexible Configuration**: Customize navigation, sidebar, and URL structures per version/locale
- **VitePress**: support 2.0.0-alpha.12

## 📦 Installation

```bash
npm install @viteplus/versions
# or
yarn add @viteplus/versions
# or
pnpm add @viteplus/versions
```

## 🚀 Quick Start

1. Create a VitePress project
2. Install @viteplus/versions
3. Configure your documentation using `defineVersionedConfig`

```ts
// .vitepress/config.ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
  title: 'My Project Documentation',
  description: 'Documentation with version control',
  
  // Version configuration
  versionsConfig: {
    current: 'v2.0.0',
    versionSwitcher: {
      text: 'Version',
      includeCurrentVersion: true
    }
  },
  
  // Standard VitePress configuration
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { component: 'VersionSwitcher' }
    ],
    // ...
  }
});
```

## 📂 Project Structure

```text
docs/
├── .vitepress/
│   └── config.ts
├── src/            // Current version docs
│   ├── en/         // English (default locale)
│   │   ├── index.md
│   │   └── guide/
│   └── de/         // German locale
│       ├── index.md
│       └── guide/
└── archive/       // Archived versions
    └── v1.0/
        ├── en/
        │   ├── index.md
        │   └── guide/
        └── de/
            ├── index.md
            └── guide/

```

## 🌐 Localization Support

```ts
export default defineVersionedConfig({
  // ...
  locales: {
    root: {
      lang: 'en',
      label: 'English',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/' }
        ]
      }
    },
    de: {
      lang: 'de',
      label: 'Deutsch',
      themeConfig: {
        nav: [
          { text: 'Startseite', link: '/' },
          { text: 'Anleitung', link: '/guide/' }
        ]
      }
    }
  }
});

```

## 🔄 Version-Specific Navigation

```ts
export default defineVersionedConfig({
  themeConfig: {
    nav: {
      // Default navigation for all versions
      root: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' }
      ],
      
      // Navigation only for v1.0
      'v1.0': [
        { text: 'Home', link: '/' },
        { text: 'Legacy API', link: '/legacy-api/' }
      ]
    }
  }
});

```

## 🛠️ Custom URL Structure

```ts
export default defineVersionedConfig({
  versionsConfig: {
    // ...
    hooks: {
      rewritesHook: (source, version, locale) => {
        // Custom URL structure (version first, then locale)
        return `${version}/${locale}/${source}`;
      }
    }
  }
});
```

## 📚 Documentation

For comprehensive guides and reference, check our [documentation](https://viteplus.github.io/versions/).

- [Localization](https://viteplus.github.io/versions//guide/locales.html)
- [URL Path Rewrites](https://viteplus.github.io/versions//guide/rewrites.html)
- [Version Switcher](https://viteplus.github.io/versions//guide/switcher.html)
- [Configuration Guide](https://viteplus.github.io/versions//guide/configuration.html)

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 💖 Acknowledgements

- [VitePress](https://vitepress.dev/) - The amazing static site generator this plugin extends
- [Vue.js](https://vuejs.org/) - The progressive JavaScript framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- `@IMB11` - for the original vitepress-versioning-plugin

Made with ❤️ by the @viteplus team
