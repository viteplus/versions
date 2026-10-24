# Release Notes

What changed in each release of `@viteplus/versions`. The current line is `v3.0.x`; for
the previous lines see [Earlier releases](#earlier-releases).

## v3.0.0

Release branching: draft the next release in `src` while readers keep landing on the stable version.
([#55](https://github.com/viteplus/versions/issues/55))

```ts
versionsConfig: {
    current: 'next',     // src is served at /next/
    latest: 'v2.x',      // archive/v2.x is served at /
    versions: {
        'v1.x': { label: 'v1.x (LTS)' }
    }
}
```

- **Added**: The [`latest`](guide/config/configuration#latest) option names the stable version, the one served at the root.
  Every other version, the current one included, is served under its own name, so the sources can hold the docs of a
  release that is not out yet. Without `latest`, the current version is the stable one and URLs stay as in 2.x,
  see [How versions map to URLs](guide/config/configuration#how-versions-map-to-urls).

- **Added**: [`versions`](guide/config/configuration#versions) holds per-version settings. A
  [`label`](guide/config/configuration#label) changes the text both version switchers show, such as `v1.x (LTS)`,
  without moving any page.

- **Added**: A version's [`path`](guide/config/configuration#path) publishes it from a folder outside `archive`,
  such as a worktree of a release branch checked out inside the docs root.

- **Added**: Absolute links in markdown stay inside the version of the page that holds them, so `/guide/` in an
  archived page leads to that version's guide. A link that names the latest version, such as `/v2.x/release`,
  points at the root while that version is the latest one. VitePress's dead link check sees the rewritten links.

- **Added**: A sidebar or nav keyed by the latest version's name applies to the root pages, where that version is
  served, see [Sidebar](guide/config/sidebar#version-specific-sidebars-object).

- **Added**: A version setup that would publish the wrong pages fails the build with a message that names the
  problem: two versions with one name, a misspelled `latest` or `versions` key, or a `path` outside the docs root,
  see [Errors that stop the build](guide/config/configuration#errors-that-stop-the-build).

- **Changed**: The switchers tag the [`latest`](guide/features/switchers#marking-the-latest-version) version with
  `(latest)`, and the basic `versionSwitcher` dropdown links it to `/`.

- **Changed**: Every page of every version runs through the
  [`rewritesHook`](guide/config/rewrites#the-hook), including pages of the sources without a locale folder,
  which 2.x served at their own path without calling the hook.

- **Removed**: The script that sent `/<current>/…` to the root, added in 2.2.0. A link to the latest version's name
  inside your markdown is now rewritten at build time instead, and nothing runs in the browser.

- **Migration**: An archive folder that carries the `current` label now stops the build, since both would publish
  under one URL. Set `current` to the version that the sources hold, or rename the folder.

- **Migration**: A custom theme that renders the `VersionSwitcher` component by hand passes `latestVersion` instead of
  `currentVersion`, and `versions` as an array. The plugin fills these props for every `VersionSwitcher` nav item.

## Earlier releases

- [v2.3.x](v2.3.x/release) - the 2.3 line (archived docs).
- [v2.2.x](v2.2.x/release) - the 2.2 line (archived docs).
- [v2.1.x](v2.1.x/release) - the 2.1 line (archived docs).
- [v2.0.x](v2.0.x/release) - the 2.0 line (archived docs).
- [v1.0.0](v1.0.x/release) - initial release (archived docs).

## See also

- [Getting Started](guide/)
- [Configuration](guide/config/configuration)
