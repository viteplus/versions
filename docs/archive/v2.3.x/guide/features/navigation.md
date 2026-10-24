# Navigation Configuration

The nav bar accepts the same two forms as the [sidebar](../config/sidebar): one shared array,
or an object keyed by version.

## Shared navigation (array)

```ts
themeConfig: {
    nav: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'API', link: '/api/' },
        { component: 'VersionSwitcher' }
    ]
}
```

Every version shares these items, each link prefixed with the version being viewed.

## Version-specific navigation (object)

```ts
themeConfig: {
    nav: {
        root: [ // default for any version without its own entry
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },
            { text: 'API', link: '/api/' },
            { component: 'VersionSwitcher' }
        ],
        'v1.0': [ // only for v1.0
            { text: 'Home', link: '/' },
            { text: 'Access', link: '/access/' },
            { text: 'Old API', link: '/old-api/' },
            { component: 'VersionSwitcher' }
        ]
    }
}
```

`v1.0` uses its own items; every other version falls back to `root`.

::: danger Important
Version-specific entries do not inherit from `root`. Each key must be a complete tree.
:::

## The `skipVersioning` flag

Set `skipVersioning: true` on an item to leave its link untouched:

```ts
const navItem = {
    text: 'GitHub',
    link: 'https://github.com/viteplus/versions',
    skipVersioning: true // [!code focus]
};
```

::: tip
Links starting with `http` are already left alone, so the flag is only needed for internal
links that must always resolve to the same page.
:::

Without it, an internal link is rewritten to include the current version path.

## See also

- [Sidebar](../config/sidebar)
- [Version Switcher](./switchers)
- [Localization](./locales)
- [Getting Started](../)
