# Release Notes

What changed in each release of `@viteplus/versions`. The current line is `v2.1.x`; for
the previous line see [Earlier releases](#earlier-releases).

## v2.1.1

A peer dependency fix for VitePress 2 prereleases under npm.

- **Fixed**: Installing alongside a `vitepress@2.0.0-alpha.*` release no longer fails under npm. The optional peer
  range was `^1.6.4 || ^2.0.0`, and semver excludes prereleases from a range whose comparators carry none, so
  `2.0.0-alpha.20` did not match. npm then fell back to `vitepress@1.6.4`, which conflicts with the VitePress 2
  prerelease in the project root, and refused the install with `ERESOLVE`. The range is now
  `^1.6.4 || ^2.0.0-0`, which admits the 2.0.0 prereleases while keeping the same `<3.0.0` ceiling. pnpm and yarn
  were unaffected, since they only warn about an unmet peer.

## v2.1.0

Two version switcher fixes - blank pages on reload under `vitepress@2.0.0-alpha.20`, and 404s when switching to a
version that does not carry the page you are reading - plus a reworked switcher component and a shared injection
container.

- **Fixed**: The [`VersionSwitcher`](guide/features/switchers#advanced-component-method) component no longer sends you
  to a missing page. It rewrote the version in the current URL and linked there without checking the target, so
  switching away from a page the other version never had returned a 404. The plugin now lists the routes each version
  publishes, and the switcher falls back to that version's home page when the current page is absent. Routes come from
  the same resolver that builds `rewrites`, so a listed route always matches a served URL.
- **Fixed**: The [`VersionSwitcher`](guide/features/switchers#advanced-component-method) component no longer blanks
  the page content on a full reload. VitePress has wrapped every nav item in its own `<li>` since `alpha.20`
  turned `VPMenuLink` into an `<li>` as well. The switcher's `<div class="items">` wrapper then left one
  list item nested inside another with only `div` elements between them. The HTML parser closes the outer `<li>`
  when it reaches the inner one, so the DOM that the browser builds no longer matches the server-rendered HTML, and
  hydration fails from the nav bar down through the article. The wrapper is now a `<ul>`, which matches VitePress's
  own menu markup. VitePress up to and including `2.0.0-alpha.19` was never affected, and neither was moving between
  pages within the site, which does not hydrate.
- **Added**: The [`VersionSwitcher`](guide/features/switchers#advanced-component-method) logic is published as a
  composable. `useVersionSwitcher` and the interfaces it works with live in
  `@viteplus/versions/components/version-switcher.component`, so a custom switcher can reuse the version list, the
  active version and the path building without copying the component. Styles moved to
  `components/styles/`, and the `.vue` file keeps the template alone.
- **Changed**: Dependency injection now comes from `@remotex-labs/xinject` rather than a vendored copy of the
  container under `src/modules/symlinks`. The package is dependency-free and joins `@remotex-labs/xansi` as the
  second runtime dependency, and the published bundle no longer carries its own copy of the container.
- **Changed**: Updated `eslint`, `typescript-eslint`, `eslint-plugin-tsdoc`, `eslint-plugin-perfectionist`,
  `@types/node`, and `@remotex-labs/xbuild` to their current releases.

## Earlier releases

- [v2.0.x](v2.0.x/release) - the 2.0 line (archived docs).
- [v1.0.0](v1.0.x/release) - initial release (archived docs).

## See also

- [Getting Started](guide/)
- [Configuration](guide/config/configuration)
