# Release Notes

What changed in the `v2.2.x` line of `@viteplus/versions`. For the lines before it see
[Earlier releases](#earlier-releases).

::: info
This line is archived and no longer maintained. See the [current release notes](/release) for the
`v2.3.x` line, which added a translatable label to the
[version switcher](/guide/features/switchers).
:::

## v2.2.0

Versioned links to the current version, a `(latest)` tag in the version switcher, and a fix for sites whose
TypeScript no longer exposes `ts.sys`.

- **Added**: A URL that names the [`current`](guide/config/configuration#current) version now lands on the page.
  The current version is served at the root, so `/v2.2.x/guide/` named no page and answered 404. A one-line script in
  the page `<head>` now replaces it with `/guide/`, keeping the locale, the query string and the hash. Once the
  version is archived, the archive serves that path itself, so a link in a README or a changelog keeps pointing at
  the version it was written for. On a built site the script runs on `404.html`, so the host must serve that page for
  unknown paths, as GitHub Pages, Netlify, Vercel and Cloudflare Pages do. It is left out when an archived version
  carries the same label as `current`.
  ([#43](https://github.com/viteplus/versions/issues/43))

- **Added**: The [`VersionSwitcher`](guide/features/switchers#marking-the-latest-version) component tags the
  current version as the latest one, so `v2.2.x` reads as `v2.2.x (latest)` on the flyout button and in both menus.
  A `latestLabel` prop on the nav item changes the tag, for example to translate it, and an empty string turns it
  off. A current version that already reads as the tag, such as the default `current: 'latest'`, is shown as it is.
  ([#44](https://github.com/viteplus/versions/issues/44))

- **Added**: `useVersionSwitcher` exposes `activeVersionText`, the active version with the tag applied, so a custom
  switcher built on the composable shows the same label.

- **Fixed**: The `VersionSwitcher` component compiles again under TypeScript 7, or with no TypeScript installed.
  `defineProps<PropsInterface>()` imports its type from another file, and `@vue/compiler-sfc` reads that file
  through `ts.sys` when it is given no `fs` option. TypeScript 7 no longer ships `ts.sys`, so the build failed with
  `No fs option provided to compileScript`. `defineVersionedConfig` now passes Node's file system as `vue.script.fs`,
  and a site that sets its own keeps it. ([#42](https://github.com/viteplus/versions/issues/42))

- **Changed**: `vue` and `vitepress` are added to `vite.resolve.dedupe`, so a linked copy of the package resolves
  both from the site and shares its Vue app and router.

::: tip 🏷️ Upgrading
The `(latest)` tag is on by default. Pass `props: { latestLabel: '' }` on the `VersionSwitcher` nav item to keep
the switcher as it was.
:::

## Earlier releases

- [v2.1.x](/v2.1.x/release) - the 2.1 line (archived docs).
- [v2.0.x](/v2.0.x/release) - the 2.0 line (archived docs).
- [v1.0.0](/v1.0.x/release) - initial release (archived docs).

## See also

- [Getting Started](guide/)
- [Configuration](guide/config/configuration)
