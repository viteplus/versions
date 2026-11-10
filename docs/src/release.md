# Release Notes

What changed in each release of `@viteplus/versions`. The current line is `v3.0.x`; for
the previous lines see [Earlier releases](#earlier-releases).

## v3.0.0

Release branching: draft the next release in `src` while readers keep landing on the stable version.
([#55](https://github.com/viteplus/versions/issues/55))

```ts
versionsConfig: {
    current: 'next',     // src is served at /next/
    latest: 'v2.x',      // archive/v2.x is served at /v2.x/ and opened at /
    versions: {
        'v1.x': { label: 'v1.x (LTS)' }
    }
}
```

- **Migration**: The current version's pages move from the root to `/<current>/`, so an old link such as `/guide`
  now answers 404. Only `/` still opens the latest version.

- **Migration**: An archive folder that carries the `current` label now stops the build, since both would publish
  under one URL. Set `current` to the version that the sources hold, or rename the folder.

- **Migration**: The `VersionSwitcher` component reads its versions from `themeConfig.versioning`, so a custom theme
  that renders it by hand drops the `versioningPlugin` prop. A theme that still passes one gives `latestVersion`
  instead of `currentVersion`, and `versions` as an array.

- **Migration**: Every page now has its version in its path, so a nav `activeMatch` such as `^/guide/` no longer
  matches. Write it as `^/[^/]+/guide/` to match the guide of every version, or `^/v2\.x/guide/` for one.

- **Migration**: The [`rewritesHook`](guide/config/rewrites#the-hook) has to keep `<locale>/<version>/` at the front
  of every route, and a hook that puts the version first now stops the build. Only the part after the version is
  yours to reshape.

- **Fixed**: A locale with a `link` such as `/de/` published its pages under `<version>/de/` and added a second
  set of locale entries. The slashes are now dropped, so the link gives the prefix `de`.

- **Fixed**: A nav link whose path contains `http`, such as `/guide/http-client`, was taken for an external link
  and left out of its version.

- **Fixed**: The `VersionSwitcher` component dropped every folder of the page that carried the name of a version,
  so switching from `v2.x/guide/next/setup` lost the `next` folder.
  It also linked `/de/<version>/` for a version without German pages, which answered 404, and now links that
  version's own home page.

- **Fixed**: A locale whose `themeConfig` was empty shared one object among all its versions, so the last nav
  written won.

- **Fixed**: `sources` written as `./src` or `src/` published every current page unversioned at `/src/...`.

- **Fixed**: A nav link that already names a version, such as `/v1.x/release`, or points at a public file, such as
  `/files/a.pdf`, is no longer prefixed with the version of the page.

- **Fixed**: An object in the user configuration was merged into a default array instead of replacing it,
  since the merge checked the user value twice instead of both values.

- **Added**: The [`latest`](guide/config/configuration#latest) option names the stable version, the one readers open at
  the root. The sources can then hold the docs of a release that is not out yet, under their `current` label,
  see [How versions map to URLs](guide/config/configuration#how-versions-map-to-urls).

- **Added**: [`versions`](guide/config/configuration#versions) holds per-version settings. A
  [`label`](guide/config/configuration#label) changes the text both version switchers show, such as `v1.x (LTS)`,
  without moving any page.

- **Added**: A version's [`path`](guide/config/configuration#path) publishes it from a folder outside `archive`,
  such as a worktree of a release branch checked out inside the docs root.

- **Added**: Absolute links in markdown stay inside the version of the page that holds them, so `/guide/` in an
  archived page leads to that version's guide. VitePress's dead link check sees the rewritten links.

- **Added**: A version setup that would publish the wrong pages fails the build with a message that names the
  problem: two versions with one name, a misspelled `latest` or `versions` key, or a `path` outside the docs root,
  see [Errors that stop the build](guide/config/configuration#errors-that-stop-the-build).

- **Added**: [`installVersionFallback`](guide/features/switchers#step-1b-catch-switches-onto-missing-pages)
  catches a switch of version or language onto a page that does not exist there, such as the language menu on an
  untranslated page, and opens the home page of that version or language instead. Any other missing address keeps
  its 404 page. Add it to `enhanceApp` next to the `VersionSwitcher` component.

- **Added**: A version whose [`path`](guide/config/configuration#path) lies inside `sources` or an archive folder,
  or holds one, stops the build. Its pages used to go to the version of the outer folder, so the version
  published nothing.

- **Added**: Locales whose prefixes clash stop the build: two locales with one language and no `link`, a `link` of more
  than one segment, or a prefix that is also the name of a version.

- **Changed**: Every version is served under its own name, the current one included, so a link always names the version
  it was written for. The root opens the latest version's home page and shows `/v2.x/` in the address bar without
  reloading the page, see [The root URL](guide/config/configuration#the-root-url). This replaces the 2.2.0 script that
  reloaded `/<current>/…` at the root.

- **Changed**: The site title links to the home page of the version the reader is on, instead of `/`, which no version
  publishes. A `logoLink` of your own is kept.

- **Changed**: The versions, labels, and routes that the `VersionSwitcher` reads are published once as
  `themeConfig.versioning`, instead of in the props of the switcher in every locale entry. On this site that
  removes two thirds of the site data, and the saving grows with every locale and version.

- **Changed**: The switchers tag the [`latest`](guide/features/switchers#marking-the-latest-version) version with
  `(latest)`.

- **Changed**: Every page of every version runs through the
  [`rewritesHook`](guide/config/rewrites#the-hook), including pages of the sources without a locale folder,
  which 2.x served at their own path without calling the hook.

## Earlier releases

- [v2.3.x](/v2.3.x/release) - the 2.3 line (archived docs).
- [v2.2.x](/v2.2.x/release) - the 2.2 line (archived docs).
- [v2.1.x](/v2.1.x/release) - the 2.1 line (archived docs).
- [v2.0.x](/v2.0.x/release) - the 2.0 line (archived docs).
- [v1.0.0](/v1.0.x/release) - initial release (archived docs).

## See also

- [Getting Started](guide/)
- [Configuration](guide/config/configuration)
