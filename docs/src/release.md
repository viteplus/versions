# Release Notes

What changed in each release of `@viteplus/versions`. The current line is `v2.0.x`; for
the previous line see [Earlier releases](#earlier-releases).

## v2.0.9

A packaging fix so installing `@viteplus/versions` no longer pulls VitePress into your project.

- **Fixed**: `vitepress` is no longer a runtime dependency. It was listed in both `dependencies`
  (pinned to a `2.0.0-alpha` build) and `peerDependencies`, so installing `@viteplus/versions`
  fetched its own copy of VitePress alongside the one your site already had. It is now dev-only
  here, and the supported range is the optional peer `^1.6.4 || ^2.0.0` alone.
- **Changed**: Updated `vitepress`, `eslint`, `typescript-eslint`, `eslint-plugin-perfectionist`,
  `@types/node`, and `@remotex-labs/xbuild` to their current releases.

## v2.0.8

A fix so custom content directory names stay out of the URL.

- **Fixed**: Renaming [`sources`](guide/config/configuration#sources) or
  [`archive`](guide/config/configuration#archive) no longer prefixes every URL with the directory
  name. Route rewriting matched the literal strings `src/` and `archive/`, so any other name fell
  through unrewritten — `sources: 'latest'` served the home page at `/latest/` instead of `/`. Both
  prefixes are now read from your configuration.
- **Fixed**: A locale prefix is stripped by length rather than by substring match, so a path that
  repeats the directory or locale name deeper in the tree is no longer mangled.
- **Changed**: Updated `vitepress`, `eslint`, `typescript-eslint`, `eslint-plugin-perfectionist`,
  and `@types/node` to their current releases.

## v2.0.7

Packaging correctness and toolchain modernization, plus a fix so external nav links are no longer version-prefixed.

- **Added**: A `package.json` [`exports`](guide/config/configuration) map for the entry point and the `./components/*`
  subpath, so `@viteplus/versions` and its Vue components resolve correctly under modern ESM bundlers.
- **Fixed**: External links in the [navigation](guide/features/navigation) are left untouched — `isNavItemWithLink`
  now excludes `http(s)` links, so they are no longer rewritten with a version path prefix.
- **Changed**: Migrated the toolchain from npm to pnpm, refactored CI/CD into dedicated workflows, modernized the
  ESLint config, and switched `tsconfig` to project references emitting declarations only.

## v2.0.6

Sidebar and routing robustness, plus a documentation "suggest changes" edit link.

- **Added**: An edit link on every docs page that opens a pre-filled GitHub issue for suggesting changes.
- **Changed**: Route rewriting resolves the active locale through a shared `extractLocale` helper.
- **Changed**: The [sidebar](guide/config/sidebar) falls back gracefully when a locale has no entries, and path
  joining uses a safe utility so versioned links stay correct across platforms.

## v2.0.5

Multi-locale, multi-version support across the [sidebar](guide/config/sidebar),
[navigation](guide/features/navigation), and [rewrites](guide/config/rewrites).

- **Added**: Per-locale navigation resolution, so each language can define its own [nav](guide/features/navigation).
- **Added**: Language-and-region locale keys such as `fr-FR` are matched to their base language.
- **Added**: External links (starting with `http`) in nav and sidebar are left untouched, as if marked
  [`skipVersioning`](guide/config/sidebar).
- **Changed**: `parseSidebar` renamed to `parseSidebars`.
- **Changed**: Sidebar and route parsing reworked to resolve the active locale and version dynamically.

## v2.0.4

- **Changed**: The [version switcher](guide/features/switchers) renders only when archived versions exist.
- **Changed**: Locale handling in `themeConfig` refined.

## v2.0.3

- **Added**: Compatibility with the stable `vitepress@2.0.0` release.
- **Fixed**: Navbar icon rendering.

## v2.0.2

- **Fixed**: The [version switcher](guide/features/switchers) no longer chains version prefixes when switching repeatedly.

## v2.0.1

- **Changed**: Default [version switcher](guide/features/switchers) placement in the nav bar.

## v2.0.0

Full rewrite around a new `defineVersionedConfig` API, a `src` + `archive` layout, and
per-version [navigation](guide/features/navigation) and [sidebars](guide/config/sidebar).

```ts
// .vitepress/config.ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    versionsConfig: {
        current: 'v2.0.x',
        versionSwitcher: { text: 'Version', includeCurrentVersion: true }
    }
});
```

- **Added**: [Localization](guide/features/locales) with version-aware locales.
- **Added**: [Version-specific navigation](guide/features/navigation) and [sidebars](guide/config/sidebar).
- **Added**: Custom URL structure through the [`rewritesHook`](guide/config/rewrites).
- **Added**: The [`VersionSwitcher`](guide/features/switchers) component.
- **Added**: Markdown linting and support for `vitepress@2.0.0-alpha.12`.
- **Changed**: Configuration moved from the old `versioning` block to [`versionsConfig`](guide/config/configuration),
  and archived content moved from `versions/` to `archive/`.

## Earlier releases

- [v1.0.0](v1.0.x/release) - initial release (archived docs).

## See also

- [Getting Started](guide/)
- [Configuration](guide/config/configuration)
