# Configuration Options

The `versionsConfig` option is a central part of @viteplus/versions that controls how multiple
versions of your documentation are organized, displayed, and navigated.
This guide explains each configuration property in detail.

## Basic Structure

The `versionsConfig` object has the following structure:

```ts
const versionsConfig = {
    versionsConfig: {
        current: string,
        sources: string,
        archive: string,
        hooks: {
            rewritesHook: Function
        },
        versionSwitcher: boolean | {
            text: string,
            includeCurrentVersion: boolean
        }
    }
}
```

## Core Properties

### `current`

```ts
current: 'latest'  // or '2.0', 'v3', etc.
```

- **Purpose**: Defines the currently active version of your documentation
- **Default**: `'latest'`
- **Usage**: This version is served at the root URL path and is highlighted in the version switcher
- **Example**: If set to, this version becomes the primary documentation shown to users `'v2.0'`

### `sources`

```ts
sources: 'src'  // or 'docs', 'content', etc.
```

- **Purpose**: Specifies the directory containing your current version's documentation files
- **Default**: `'src'`
- **Usage**: This is where the plugin looks for the latest version of documentation
- **Example**: Setting this to `'docs'` would make the plugin read files from the `docs/` directory

### `archive`

```ts
archive: 'archive'  // or 'versions', 'old', etc.
```

- **Purpose**: Defines the directory where archived versions of documentation are stored
- **Default**: `'archive'`
- **Usage**: Each subdirectory in this folder represents a different version of documentation
- **Example**: With `archive: 'versions'`, your project might have `versions/v1.0/`, `versions/v1.5/`, etc.

## Advanced Configuration

### `hooks`

[Rewrites](./rewrites) - Customize the `rewrites` routes

### `versionSwitcher`

[Version Switcher](./switchers) - Customize the version switcher component

## Default Configuration

@viteplus/versions comes with sensible defaults:

```ts
const config = {
    versionsConfig: {
        current: 'latest',
        sources: 'src',
        archive: 'archive',
        hooks: {
            rewritesHook: rewritesHook  // Default implementation
        },
        versionSwitcher: {
            text: 'Switch Version',
            includeCurrentVersion: true
        }
    }
}

```
