# Getting Started with @viteplus/versions

@viteplus/versions is a powerful VitePress plugin that enables versioned documentation with seamless navigation, localization support, and automatic route generation.
This guide will help you set up and configure the plugin for your documentation needs.

## Installation

Install the package using your preferred package manager:

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

### 1. Initialize Your VitePress Project

If you haven't already, create a VitePress project:

```bash
npm init vitepress
```

### 2. Configure Versioning

Create or modify your VitePress configuration file (): `.vitepress/config.ts`

```ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
  title: 'My Documentation',
  description: 'Versioned documentation with VitePress',
  
  // Versioning configuration
  versionsConfig: {
    current: 'latest',  // Label for current version
    sources: 'src',     // Current version source directory
    archive: 'versions', // Archive directory for older versions
    versionSwitcher: {
      text: 'Version',
      includeCurrentVersion: true
    }
  },
  
  // Other VitePress configuration...
  themeConfig: {
    // ...
  }
});
```

## Project Structure

Organize your documentation files following this structure:

```text
docs/
├── .vitepress/
│   └── config.ts
├── src/            // Current version docs  ← sources
│   ├── index.md
│   ├── guide/
│   │   └── ...
│   └── api/
│       └── ...
└── archive/       // Archived versions      ← archive
    ├── v1.0/
    │   ├── index.md
    │   └── ...
    └── v2.0/
        ├── index.md
        └── ...
```

Both directory names are configurable through [`sources`](./config/configuration#sources) and
[`archive`](./config/configuration#archive). They are filesystem locations only — renaming them
does not change a single URL.

## Core Features

### Version Switching

The plugin automatically adds a version switcher that allows users to navigate between documentation versions:

- **Simple Configuration**: Enable with minimal setup via `versionSwitcher` option
- **Custom Component**: For advanced needs, use the `VersionSwitcher` component directly

### Localization

Support multiple languages with version-aware localization:

```ts
export default defineVersionedConfig({
  // ...
  locales: {
    root: {
      lang: 'en',
      label: 'English'
    },
    fr: {
      lang: 'fr',
      label: 'Français'
    }
  }
});
```

### Version-Specific Navigation

Define different navigation structures for each version:

```ts
export default defineVersionedConfig({
  // ...
  themeConfig: {
    nav: {
      root: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' }
      ],
      'v1.0': [
        { text: 'Home', link: '/' },
        { text: 'Legacy API', link: '/legacy-api/' }
      ]
    }
  }
});
```

### Automatic Path Rewriting

URLs are automatically structured based on versions and locales, creating clean,
predictable paths.

## Advanced Configuration

### Custom URL Structure

Customize how URLs are generated with the `rewritesHook`:

```ts
export default defineVersionedConfig({
  // ...
  versionsConfig: {
    // ...
    hooks: {
      rewritesHook: (source, version, locale) => {
        // Custom URL structure
        return `${version}/${locale}/${source}`;
      }
    }
  }
});
```

### Enhanced Theme Integration

Integrate the version switcher into your custom theme:

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

## Key Configuration Options

| Option                              | Description                                    |
|-------------------------------------|------------------------------------------------|
| `versionsConfig.current`            | Label for the current version (e.g., "latest") |
| `versionsConfig.sources`            | Directory containing current version docs      |
| `versionsConfig.archive`            | Directory containing archived versions         |
| `versionsConfig.versionSwitcher`    | Configuration for the version switcher         |
| `versionsConfig.hooks.rewritesHook` | Customize URL structure                        |

## See also

- [Configuration Options](./config/configuration) - every `versionsConfig` option
- [Sidebar](./config/sidebar) - customize the sidebar per version
- [URL Path Rewrites](./config/rewrites) - control how URLs are generated
- [Navigation](./features/navigation) - customize the nav bar per version
- [Localization](./features/locales) - set up multilingual documentation
- [Version Switcher](./features/switchers) - customize the switcher component
- [Release Notes](../release) - what changed in each release
