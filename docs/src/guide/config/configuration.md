# Configuration Options

`versionsConfig` is the block `defineVersionedConfig` adds on top of a normal VitePress
configuration. It controls where your versioned content lives, how the current version is
labelled, and how versions are switched.

```ts
// .vitepress/config.ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    title: 'My Documentation',
    versionsConfig: { // [!code focus]
        current: 'v2.0.x', // [!code focus]
        sources: 'src', // [!code focus]
        archive: 'archive', // [!code focus]
        versionSwitcher: { // [!code focus]
            text: 'Switch Version', // [!code focus]
            includeCurrentVersion: true // [!code focus]
        } // [!code focus]
    } // [!code focus]
});
```

## Options

| Option               | Type                                  | Purpose                                           |
|----------------------|---------------------------------------|---------------------------------------------------|
| `current`            | `string`                              | Label for the live version served at the root URL |
| `sources`            | `string`                              | Directory holding the current version's content   |
| `archive`            | `string`                              | Directory whose subfolders are archived versions  |
| `versionSwitcher`    | `object` or `false`                   | The version dropdown; `false` disables it         |
| `hooks.rewritesHook` | `(source, version, locale) => string` | Maps a content file to its final URL              |

Every option has a default, listed under [Defaults](#defaults).

## `current`

The label for the version served from `sources`. It appears at the root URL and is
highlighted in the switcher.

```ts
current: 'v2.0.x'  // or 'latest', 'v3', ...
```

This is a display label, not a directory name — nothing on disk has to match it.

## `sources`

The directory holding the current version's content, relative to the docs root.

```ts
sources: 'src'  // or 'latest', 'content', ...
```

```text
docs/
└── src/          ← sources
    ├── index.md
    └── guide/
```

## `archive`

The directory whose subfolders are treated as archived versions. Each subfolder name becomes
that version's URL prefix and its key in the per-version [`nav`](../features/navigation) and
[`sidebar`](./sidebar) maps.

```ts
archive: 'archive'  // or 'versions', 'old', ...
```

```text
docs/
└── archive/      ← archive
    ├── v1.0.x/   → /v1.0.x/
    └── v1.5.x/   → /v1.5.x/
```

The directory is created for you, with a `.gitkeep`, if it does not exist.

::: tip Directory names never reach the URL
`sources` and `archive` are filesystem locations only. Whatever you name them, the current
version is served at the root and archived versions at `/<subfolder>/`. With
`sources: 'latest'` the home page is still `/`, not `/latest/`.
:::

The version switcher builds its list from the `archive` subfolders plus `current`, so
renaming either directory needs no further configuration.

## `hooks`

See [URL Path Rewrites](./rewrites) for customizing how content files map to URLs.

## `versionSwitcher`

See [Version Switcher](../features/switchers) for the dropdown and the `VersionSwitcher`
component.

## Defaults

Anything you omit falls back to:

```ts
const defaultConfiguration = {
    versionsConfig: {
        current: 'latest',
        sources: 'src',
        archive: 'archive',
        hooks: {
            rewritesHook: rewritesHook
        },
        versionSwitcher: {
            text: 'Switch Version',
            includeCurrentVersion: true
        }
    }
};
```

## See also

- [Getting Started](../)
- [URL Path Rewrites](./rewrites)
- [Sidebar](./sidebar)
- [Version Switcher](../features/switchers)
