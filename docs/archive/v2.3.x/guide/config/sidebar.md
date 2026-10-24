# Sidebar Configuration

The sidebar helps readers find content within a version. @viteplus/versions lets you share one
sidebar across every version, or give each version its own.

## Shared sidebar (array)

An array applies the same sidebar to all versions, with version prefixes added to each link:

```ts
themeConfig: {
    sidebar: [
        { text: 'Guide', link: '/' },
        { text: 'Log', link: '/log' },
        {
            text: 'Configuration',
            collapsed: false,
            items: [
                { text: 'CLI Options', link: '/configuration/cli' },
                { text: 'Configuration File', link: '/configuration/file' }
            ]
        }
    ]
}
```

## Version-specific sidebars (object)

Key the object by version. `root` is the current version; each archived version uses its
[`archive`](./configuration#archive) subfolder name as the key:

```ts
themeConfig: {
    sidebar: {
        root: [
            { text: 'Guide', link: '/' },
            { text: 'Log', link: '/log' },
            {
                text: 'Configuration',
                collapsed: false,
                items: [
                    { text: 'CLI Options', link: '/configuration/cli' },
                    { text: 'Configuration File', link: '/configuration/file' }
                ]
            }
        ],
        'v1.0': [
            { text: 'Guide', link: '/' },
            { text: 'Legacy Log', link: '/log' },
            { text: 'Legacy Config', link: '/legacy-config' }
        ]
    }
}
```

::: danger Important
Version-specific entries do not inherit from `root`. Each key must be a complete tree.
:::

## The `skipVersioning` flag

Any sidebar item can set `skipVersioning: true` to opt out of version prefixing:

```ts
themeConfig: {
    sidebar: {
        root: [
            { text: 'Guide', link: '/', skipVersioning: true }, // [!code focus]
            { text: 'Log', link: '/log' }
        ]
    }
}
```

The link is then left exactly as written, whichever version the reader is on. Use it for links
that must always point at the same page.

::: tip
External links starting with `http` are left alone automatically — no flag needed.
:::

Without the flag, a link is rewritten to include the current version path.

### Nested items

On a group, the version prefix is applied to the group's `base`, which carries down to every
child link:

```ts
const sidebar = {
    text: 'Configuration',
    collapsed: false,
    base: '/configuration/',  // the version is added here
    items: [
        { text: 'CLI Options', link: '/configuration/cli' },
        { text: 'Configuration File', link: '/configuration/file' }
    ]
};
```

So `skipVersioning` belongs on the parent only. Children inherit it, and setting it on a child
of a flagged parent has no effect.

## See also

- [Configuration Options](./configuration)
- [Navigation](../features/navigation)
- [URL Path Rewrites](./rewrites)
- [Getting Started](../)
