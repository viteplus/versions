# URL Path Rewrites

Rewrites map a content file on disk to the URL a reader sees. @viteplus/versions builds
VitePress's `rewrites` for you from the version and locale it detects in each path, and lets
you override the final shape through a hook.

## How a path is resolved

```text
src/de/guide/intro.md → rewritesHook('guide/intro.md', '', 'de') → de/guide/intro
```

Three things happen before your hook runs:

1. The [`sources`](./configuration#sources) or [`archive`](./configuration#archive) directory
   name is stripped from the front of the path.
2. For an archived file, the leading version segment is taken as `version`. Current-version
   files get an empty `version`, which is why they land at the root.
3. The next segment is taken as `locale` if it matches a configured locale. The root locale
   resolves to an empty string.

Whatever is left is passed as `source`.

::: tip
Because step 1 uses your configured directory names, renaming `sources` or `archive` does not
change any URL.
:::

## The hook

```ts
// Default implementation
function rewritesHook(source: string, version: string, locale: string): string {
    return join(locale, version, source);
}
```

| Argument  | Example          | Meaning                                                  |
|-----------|------------------|----------------------------------------------------------|
| `source`  | `guide/intro.md` | The path with directory, version, and locale removed     |
| `version` | `v2.0.0`         | Archived version, or `''` for the current version        |
| `locale`  | `de`             | Configured locale, or `''` for the root locale           |

Default output, given `sources: 'src'`, `archive: 'archive'`, and a root locale of `en`:

| File                                | URL                     |
|-------------------------------------|-------------------------|
| `src/en/guide/intro.md`             | `/guide/intro`          |
| `src/de/guide/intro.md`             | `/de/guide/intro`       |
| `archive/v1.0.0/en/guide/intro.md`  | `/v1.0.0/guide/intro`   |
| `archive/v1.0.0/de/guide/intro.md`  | `/de/v1.0.0/guide/intro`|

## Customizing the structure

Return a different order to put the version ahead of the locale:

```ts
export default defineVersionedConfig({
    versionsConfig: {
        hooks: { // [!code focus]
            rewritesHook: (source, version, locale) => join(version, locale, source) // [!code focus]
        } // [!code focus]
    }
});
```

That turns `/de/v1.0.0/guide/intro` into `/v1.0.0/de/guide/intro`.

::: warning
`version` is empty for the current version, and `locale` is empty for the root locale. Join
the segments rather than interpolating them, so empty values do not leave stray slashes in
the URL.
:::

Current-version files that carry no locale prefix — every file on a site with no `locales`
configured — are served at their own path and never reach the hook. The hook shapes versioned
and localized URLs; it cannot rewrite an unversioned, unlocalized site.

## See also

- [Configuration Options](./configuration)
- [Localization](../features/locales)
- [Getting Started](../)
