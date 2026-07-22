# URL Path Rewrites

When managing multiple versions and locales of documentation,
having a consistent and logical URL structure is critical.
@viteplus/versions provides a powerful path rewriting system that controls how file paths map to URLs.

## Understanding Path Rewrites

Path rewriting is the process of transforming:

1. A source file path in your project
2. Into a URL path that users see in the browser

This is especially important for versioned documentation where you need to balance:

- Clean URLs for users
- Logical file organization in your codebase
- Proper handling of multiple versions and languages

## How Rewriting Works in @viteplus/versions

The rewriting system uses a special hook function that transforms paths based on three `components`:

```text
source → rewritesHook(source, version, locale) → final URL
```

Where:

- `source`: The original file path (e.g., ) `guide/intro.md`
- `version`: The documentation version (e.g., ) `v2.0.0`
- `locale`: The language locale (e.g., `en`)

## Default Behavior

By default, @viteplus/versions uses a path structure of `locale/version/source`:

```ts
// Default rewritesHook implementation
function rewritesHook(source, version, locale) {
  return join(locale, version, source);
}
```

This creates URLs like:

- `/en/v2.0.0/guide/introduction`
- `/fr/v1.0.0/api/reference`
