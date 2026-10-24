# Configuration Options

`versionsConfig` is the block `defineVersionedConfig` adds on top of a normal VitePress
configuration. It controls where your versioned content lives, which version is the stable one,
and how versions are labelled and switched.

```ts
// .vitepress/config.ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    title: 'My Documentation',
    versionsConfig: { // [!code focus]
        current: 'next', // [!code focus]
        latest: 'v2.x', // [!code focus]
        versions: { // [!code focus]
            'v1.x': { label: 'v1.x (LTS)' } // [!code focus]
        } // [!code focus]
    } // [!code focus]
});
```

## Options

| Option               | Type                                  | Purpose                                                   |
|----------------------|---------------------------------------|-----------------------------------------------------------|
| `current`            | `string`                              | Label of the version in `sources`                         |
| `latest`             | `string`                              | The stable version, served at the root URL                |
| `versions`           | `object`                              | Per-version settings: a switcher `label`, a source `path` |
| `sources`            | `string`                              | Directory holding the current version's content           |
| `archive`            | `string`                              | Directory whose subfolders are archived versions          |
| `versionSwitcher`    | `object` or `false`                   | The version dropdown, `false` disables it                 |
| `hooks.rewritesHook` | `(source, version, locale) => string` | Maps a content file to its final URL                      |

Every option has a default, listed under [Defaults](#defaults).

## How versions map to URLs

Every version is a name and a folder. The latest version is served at the root,
and every other version under its own name:

| Content                       | URL with `current: 'next'` and `latest: 'v2.x'` |
|-------------------------------|-------------------------------------------------|
| `archive/v2.x/guide.md`       | `/guide`                                        |
| `src/guide.md`                | `/next/guide`                                   |
| `archive/v1.x/guide.md`       | `/v1.x/guide`                                   |

Without `latest`, the current version is the stable one and is served at the root,
which is how every 2.x release worked.

## `current`

The label of the version that `sources` holds.

```ts
current: 'v2.0.x'  // or 'next', 'latest', ...
```

While it is also the [`latest`](#latest) version, its pages are served at the root.
Otherwise they are served under the label, so with `current: 'next'` the guide of the sources lives at `/next/guide`.
The label is a URL segment and a switcher entry, not a directory name, so nothing on disk has to match it.

## `latest`

The name of the stable version: the current label, or the name of an archive folder.
Its pages are served at the root, and the switcher tags it `(latest)`.

```ts
versionsConfig: {
    current: 'next',  // src holds the docs of the coming release
    latest: 'v2.x'    // archive/v2.x is what readers get at /
}
```

Leave it out, or set it to `''`, to keep the current version as the stable one.
Set it to an archive folder while `sources` holds documentation for a release that is not out yet,
the way release branching works: the coming version is reviewed at `/next/`, and readers keep landing on the stable one.

::: tip Links that name the latest version
A link written as `/v2.x/release` in your markdown points at the root while `v2.x` is the latest version,
since that is where its pages live. Once a newer version becomes the latest one, the same link points at `/v2.x/release` again.
Links in `config.ts`, such as nav and sidebar entries, are not rewritten.
:::

## `versions`

Settings for individual versions, keyed by version name.

```ts
versions: {
    'v1.x': { label: 'v1.x (LTS)' },
    'v0.x': { path: 'legacy/v0', label: 'v0.x (EOL)' }
}
```

### `label`

The text the version switchers show for the version. The URL keeps the version name,
so changing a label never moves a page.

### `path`

The folder that holds the version's pages, relative to the docs root. Use it for a version that lives outside `archive`,
for example a worktree of a release branch checked out inside `docs/`.

```text
docs/
├── src/          → /next/
├── archive/
│   └── v1.x/     → /v1.x/
└── legacy/
    └── v0/       → /v0.x/   (versions: { 'v0.x': { path: 'legacy/v0' } })
```

VitePress builds only the files inside the docs root, so the folder has to exist inside it.
A `path` on the current version is rejected, since [`sources`](#sources) already places it.

## Errors that stop the build

A version setup that would publish the wrong pages fails while the configuration loads, with a message that names the problem:

| Message                                                    | Cause                                                                      |
|------------------------------------------------------------|----------------------------------------------------------------------------|
| `Version v2.x is published from both src and archive/v2.x` | Two versions share a name, such as an archive folder named after `current` |
| `Version v3.x is neither the current version nor ...`      | `latest`, or a key of `versions`, names no version                         |
| `Path ../v0 of version v0.x has to be an existing folder`  | A `path` is missing, or lies outside the docs root                         |

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
that version's name: its URL prefix and its key in the per-version [`nav`](../features/navigation) and
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
`sources` and `archive` are filesystem locations only. With `sources: 'content'` the current version
is still served at the root, or under its `current` label when another version is the latest one.
:::

The version switcher builds its list from `current`, the `archive` subfolders, and the versions with a `path`,
so adding a version needs no further configuration.

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
        latest: '',
        sources: 'src',
        archive: 'archive',
        versions: {},
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
- [Release Notes](../../release)
