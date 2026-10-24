# URL Path Rewrites

Rewrites map a content file on disk to the URL a reader sees. @viteplus/versions builds
VitePress's `rewrites` for you from the version and locale it detects in each path, and lets
you override the final shape through a hook.

## How a path is resolved

```text
src/de/guide/intro.md → rewritesHook('guide/intro.md', 'next', 'de') → de/next/guide/intro
```

Three things happen before your hook runs:

1. The folder of the version is stripped from the front of the path: [`sources`](./configuration#sources)
   for the current version, `archive/<name>` for an archived one, or its [`path`](./configuration#path).
2. The version's name is taken as `version`, so every version, the [`latest`](./configuration#latest)
   one included, lands under its name.
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
| `version` | `v2.0.0`         | The version's name                                       |
| `locale`  | `de`             | Configured locale, or `''` for the root locale           |

Default output, given `current: 'next'`, `latest: 'v2.0.0'`, and a root locale of `en`:

| File                                | URL                      |
|-------------------------------------|--------------------------|
| `archive/v2.0.0/en/guide/intro.md`  | `/v2.0.0/guide/intro`    |
| `archive/v2.0.0/de/guide/intro.md`  | `/de/v2.0.0/guide/intro` |
| `src/en/guide/intro.md`             | `/next/guide/intro`      |
| `src/de/guide/intro.md`             | `/de/next/guide/intro`   |
| `archive/v1.0.0/de/guide/intro.md`  | `/de/v1.0.0/guide/intro` |

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
`locale` is empty for the root locale. Join
the segments rather than interpolating them, so an empty value does not leave stray slashes in
the URL.
:::

Every page of every version runs through the hook, including sites without `locales`.
Keep the version as the first segment, or the first one after the locale,
since the version switcher, the link rewriting, and the [root URL](./configuration#the-root-url) script look for it there.

## See also

- [Configuration Options](./configuration)
- [Localization](../features/locales)
- [Getting Started](../)
