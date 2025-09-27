# Localization

Localization allows you to create multilingual documentation with @viteplus/versions.
This guide explains how to configure and structure localized content with proper version handling.

## Folder Structure

The @viteplus/versions plugin relies on a specific folder structure to organize localized documentation:

```text
src/
├── en/          # English documentation (default/root locale)
│   ├── index.md
│   └── guide/
│       └── ...
├── de/          # German documentation
│   ├── index.md
│   └── guide/
│       └── ...
└── ...

archive/
├── v1.0/
│   ├── en/      # Archived English v1.0 docs
│   │   └── ...
│   └── de/      # Archived German v1.0 docs
│       └── ...
└── ...
```

> Each locale has its own folder, and all documentation files for that language should be placed in that folder.
> This structure applies to both current (`src/`) and archived versions.

## Locale Configuration

Locales are configured in your VitePress configuration file:

```ts
export default defineVersionedConfig({
  // Other configuration...
  locales: {
    root: {
      lang: 'en',
      label: 'English',
      // Locale-specific theme configuration
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { component: 'VersionSwitcher' }
        ],
        sidebar: {
          root: {
            base: '/guide/',
            items: [
              { text: 'Guide', link: '/' }
            ]
          }
        }
      }
    },
    de: {
      lang: 'de',
      label: 'Deutsch',
      // Locale-specific theme configuration
      themeConfig: {
        nav: {
          'v1.0.x': [{ text: 'Home - de', link: '/' }]
        },
        sidebar: {
          root: {
            base: '/guide/',
            items: [
              { text: 'Anleitung', link: '/' }
            ]
          }
        }
      }
    }
  },
  
  // Global theme configuration (fallback)
  themeConfig: {
    // Global navigation for all locales and versions
    nav: [{ text: 'Global', link: '/' }],
    
    // Global sidebar for all locales and versions
    sidebar: {
      root: {
        base: '/docs/',
        items: [{ text: 'Documentation', link: '/' }]
      }
    },
    
    // Other theme settings
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/org/repo' }
    ]
  }
});
```

## Navigation and Sidebar Inheritance

@viteplus/versions uses a sophisticated inheritance system for navigation and sidebar configuration:

### Key Concepts

1. **Global vs Locale-specific Configuration**:
    - `themeConfig.nav` and `themeConfig.sidebar` define global configuration
    - `locales.*.themeConfig.nav` and `locales.*.themeConfig.sidebar` define locale-specific configuration

2. **Root vs Version-specific Configuration**:
    - `root` key is used for configuration that applies to all versions
    - Version-specific keys (e.g., `v1.0.x`) are used for version-specific configuration

3. **Inheritance Flow**:
    1. Global configuration is applied first
    2. Locale-specific configuration overrides global
    3. Version-specific configuration overrides both

### Root Key vs Lang Key

You can use either `root` or the language code as the key in your configuration.
If no explicit `root` key is provided in your `locales` configuration,
@viteplus/versions will automatically designate
the first locale key it encounters as the default root locale.
This locale will be served at the base URL path and treated as the primary language for your documentation.

```ts
const locales = {
    locales: {
        // Using 'root' key for default locale
        root: {
            lang: 'en',
            label: 'English',
            // ...
        },

        // Using language code as key
        de: {
            lang: 'de',
            label: 'Deutsch',
            // ...
        }
    }
}
```

The `root` key is special - it represents the default locale that will be served at the root URL path (`/`).

::: danger :rocket: Important
When the root key is missing, the configuration automatically uses the first key as the root.
:::

```ts
const locales = {
    locales: {
        en: { lang: 'en', label: 'English' },
        de: { lang: 'de', label: 'Deutsch' }
    }
}
```

The `en` locale would automatically be treated as the root locale since it appears first in the configuration object.
This automatic behavior simplifies configuration when you have a clear primary language, but for more explicit control, directly using the `root` key is recommended.

## Navigation Configuration

Navigation can be configured globally or per locale:

```ts
const config = {
    themeConfig: {
        nav: [{ text: 'Global Nav', link: '/' }]
    },

    locales: {
        root: {
            themeConfig: {
                nav: [{ text: 'English Nav', link: '/' }]
            }
        }
    }
}
```

You can also configure navigation for specific versions:

```ts
const locales = {
    locales: {
        de: {
            themeConfig: {
                nav: {
                    // For all versions
                    root: [{ text: 'German Home', link: '/' }],

                    // Only for v1.0.x
                    'v1.0.x': [{ text: 'German v1.0 Home', link: '/' }]
                }
            }
        }
    }
}
```

## Sidebar Configuration

Sidebar works similarly to navigation:

```ts
const themeConfig = {
    themeConfig: {
        sidebar: {
            // For all versions and locales
            root: {
                base: '/docs/',
                items: [{ text: 'Docs', link: '/' }]
            }
        }
    },

    locales: {
        de: {
            themeConfig: {
                sidebar: {
                    // For all versions in German
                    root: {
                        base: '/docs/',
                        items: [{ text: 'Dokumentation', link: '/' }]
                    }
                }
            }
        }
    }
}
```

## How Configuration is Applied

@viteplus/versions processes your configuration in this order:

1. Global `themeConfig` navigation and sidebar are applied first
2. Locale-specific configuration is merged on top
3. Version-specific configuration is applied
4. Path prefixes are added for versions and locales

This ensures that:

- Common navigation and sidebar elements are shared across locales and versions
- Locale-specific elements override global ones
- Version-specific elements override both

## URL Structure with Locales

When using locales with versioning, URLs are structured as:

```text
/{locale}/{version}/{path}
```

For example:

- `/en/v2.0/guide/` - English documentation for version 2.0
- `/de/v1.0/guide/` - German documentation for version 1.0

The default locale (root) might omit the locale part:

## Version-Specific Locale Configuration

You can define different navigation and sidebar for specific versions of a locale:

```ts
const locales = {
    locales: {
        de: {
            themeConfig: {
                nav: {
                    // For all versions
                    root: [
                        { text: 'Home', link: '/' },
                        { text: 'Guide', link: '/guide/' }
                    ],

                    // Only for v1.0 
                    'v1.0': [
                        { text: 'Home v1.0', link: '/' },
                        { text: 'Legacy Guide', link: '/legacy-guide/' }
                    ]
                }
            }
        }
    }
}
```

This allows complete customization of navigation and sidebar for each combination of locale and version.
