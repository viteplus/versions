# Release Notes

What changed in the `v1.0.x` line of `@viteplus/versions`.

::: info
This line is archived and no longer maintained. See the current release notes for the `v2.0.x`
line, which replaced the `versioning` block with
[`versionsConfig`](https://viteplus.github.io/versions/guide/config/configuration).
:::

## v1.0.0

Initial release. A VitePress plugin for versioned documentation, modeled on the API of
[vitepress-versioning-plugin](https://github.com/IMB11/vitepress-versioning-plugin).

### Added

- `defineVersionedConfig` to wrap a VitePress configuration with versioning.
- A `versions/` folder whose subdirectories are treated as archived versions.
- Automatic versioned routes, per-version sidebar and navigation, and a version switcher component.

See the [guide](guide/) for setup.

## See also

- [Getting Started](guide/)
