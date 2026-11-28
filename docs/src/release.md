# Release Notes

What changed in each release of `@viteplus/versions`. The current line is `v3.1.x`; for
the previous lines see [Earlier releases](#earlier-releases).

## v3.1.0

- **Fixed**: A `link` in the frontmatter, such as a `hero.actions` button of a home page, `features`, or `prev` and
  `next`, left the version, so `link: /guide` answered 404. Every `link` in the frontmatter now goes into the version
  of its page, as absolute markdown links do.

- **Added**: An address that names no version, such as `/guide` or `/de/guide`, opens the same page of the latest
  version instead of answering 404, without building any page twice, see
  [Addresses Without a Version](guide/features/unversioned).
  ([#61](https://github.com/viteplus/versions/issues/61))

- **Added**: [`installVersionFallback`](guide/features/switchers#step-1b-catch-switches-onto-missing-pages) also sends
  an in-app link without a version, such as `/guide` in a Vue component, to the latest version.

- **Changed**: The switchers list the versions newest first, the current one on top, so `v2.3.x` comes before
  `v2.2.x`. Numbers in a name compare by value, so `v2.10.x` comes before `v2.9.x`. They were listed in the order of
  the archive folders on disk, oldest first.

## Earlier releases

- [v3.0.x](/v3.0.x/release) - the 3.0 line (archived docs).
- [v2.3.x](/v2.3.x/release) - the 2.3 line (archived docs).
- [v2.2.x](/v2.2.x/release) - the 2.2 line (archived docs).
- [v2.1.x](/v2.1.x/release) - the 2.1 line (archived docs).
- [v2.0.x](/v2.0.x/release) - the 2.0 line (archived docs).
- [v1.0.0](/v1.0.x/release) - initial release (archived docs).

## See also

- [Getting Started](guide/)
- [Configuration](guide/config/configuration)
