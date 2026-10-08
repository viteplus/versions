# Release Notes

What changed in each release of `@viteplus/versions`. The current line is `v2.3.x`; for
the previous lines see [Earlier releases](#earlier-releases).

## v2.3.0

A translatable label for the version switcher, and a Docker environment for working on the plugin.

- **Added**: The [`VersionSwitcher`](guide/features/switchers#changing-the-label) component takes a `label` prop,
  so its `Switch Version` text can be changed, for example to translate it. The text was written into the component,
  so a multilingual site showed it in English on every locale. The label is set on the nav item's `props`, and each
  locale can set its own, see [Translating the Switcher](guide/features/switchers#translating-the-switcher).
  Without it, the switcher reads `Switch Version` as before. ([#51](https://github.com/viteplus/versions/issues/51))

- **Added**: A [Docker development environment](https://github.com/viteplus/versions#development-with-docker) in
  `docker/`, for contributors. `docker compose -f docker/compose.yml up` builds the plugin in watch mode and serves
  these docs on port 5173 from a `node:24-alpine` container, so working on the plugin needs only Docker. The repo is
  mounted for live edits, while the dependencies are installed in the image and the local `node_modules` is never
  used. Nothing changes for sites that install the package.

## Earlier releases

- [v2.2.x](v2.2.x/release) - the 2.2 line (archived docs).
- [v2.1.x](v2.1.x/release) - the 2.1 line (archived docs).
- [v2.0.x](v2.0.x/release) - the 2.0 line (archived docs).
- [v1.0.0](v1.0.x/release) - initial release (archived docs).

## See also

- [Getting Started](guide/)
- [Configuration](guide/config/configuration)
