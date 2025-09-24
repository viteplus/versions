# @viteplus/versions

[![Documentation](https://img.shields.io/badge/Documentation-orange?logo=typescript&logoColor=f5f5f5)](https://viteplus.github.io/versions/)
[![npm version](https://img.shields.io/npm/v/@viteplus/versions.svg)](https://www.npmjs.com/package/@viteplus/versions)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Node.js CI](https://github.com/viteplus/versions/actions/workflows/node.js.yml/badge.svg)](https://github.com/viteplus/versions/actions/workflows/node.js.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/viteplus/versions)

A **VitePress plugin** that enables versioned documentation, including:

- Automatic versioned routes
- Sidebar & navigation per version
- Version switcher component

---

## Installation

Install via your preferred package manager:

```bash
pnpm add @viteplus/versions
# or
npm install @viteplus/versions
# or
yarn add @viteplus/versions
```

## Quick Start

1. **Add the plugin to your VitePress config:**

    ```js
    // .vitepress/config.js
    import { withVersions } from '@viteplus/versions';

    export default withVersions({
      // your VitePress config here
    });
    ```

2. **Configure navigation and sidebar:**
    - Define them at the root-level to apply for all versions.
    - Or, define them for specific versions (e.g., `v1.0` or `v2.0`) to customize per version.

    ```js
    themeConfig: {
      nav: {
        root: [ /* Global navigation */ ],
        'v1.0': [ /* Navigation for version 1.0 */ ],
        'v2.0': [ /* Navigation for version 2.0 */ ]
      },
      sidebar: {
        root: [ /* Global sidebar */ ],
        'v1.0': [ /* Sidebar for version 1.0 */ ],
        'v2.0': [ /* Sidebar for version 2.0 */ ]
      }
    }
    ```

## Sidebar & Navigation Configuration

Both the navigation (`nav`) and sidebar (`sidebar`) can be defined in your VitePress configuration in two flexible ways:

- **As an Array:** Simply provide an array to apply a global navigation or sidebar for all versions.

    ```ts
    themeConfig: {
        nav: [ /* Global navigation for all versions */ ],
        sidebar: [ /* Global sidebar for all versions */ ]
    }
    ```

- **As a Mapping/Object:** Provide an object to specify different navigation or sidebar options for each version.

    ```ts
    themeConfig: {
        nav: {
          root: [ /* Navigation for all versions */ ],
          'v1.0': [ /* Navigation for version 1.0 */ ]
        },
        sidebar: {
          root: [ /* Sidebar for all versions */ ],
          'v2.0': [ /* Sidebar for version 2.0 */ ]
        }
    }
    ```

## customize navigation (`nav`) and sidebar (`sidebar`)

You can fully customize your documentation's navigation (`nav`) and sidebar (`sidebar`) according to your needs:

- **Global:**  
  Use an array to apply a navigation or sidebar structure for all locales and all versions.

- **Per-Version:**  
  Use an object mapping to specify different navigation/sidebar for each version
  while still supporting a global (`root`) fallback.

- **Per-Locale:**  
  Use the `locales` property to define locale-specific structure.
  Each locale can individually specify its own nav and sidebar
  as either an array (for that locale) or as a mapping of versions.

### Example: Per-locale, per-version, and global navigation/sidebar

```ts
    locales: {
        'root': {
            label: 'English',
            lang: 'en',
            themeConfig: {
                nav: [
                    { text: 'Home', link: '/' },
                    { text: 'Examples', link: '/api' }
                ],
                sidebar: [
                    {
                        text: 'Examples',
                        items: [
                            { text: 'Markdown Examples', link: '/guide' },
                            { text: 'Runtime API Examples', link: '/guide/getting-started' },
                        ]
                    }
                ]
            }
        },
        'fr': {
            label: 'fr',
            lang: 'fr',
            themeConfig: {
                nav: [
                    { text: 'Sākums', link: '/' },
                    { text: 'Piemēri', link: '/api' }
                ],
                sidebar: [
                    {
                        text: 'Examples',
                        items: [
                            { text: 'fr - Markdown Examples', link: '/guide' },
                            { text: 'fr - Runtime API Examples', link: '/guide/getting-started' },
                        ]
                    }
                ]
            }
        },
        'fr/xs': {
            label: 'fr-xs',
            lang: 'fr-xs',
            base: 'fr',
            themeConfig: {
                nav: [
                    { text: 'Sākums', link: '/' },
                    { text: 'Piemēri', link: '/api' }
                ],
                sidebar: [
                    {
                        text: 'Examples',
                        items: [
                            { text: 'fr - Markdown Examples', link: '/guide' },
                            { text: 'fr - Runtime API Examples', link: '/guide/getting-started' },
                        ]
                    }
                ]
            }
        }
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
