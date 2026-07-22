# Sidebar Configuration

The sidebar is a critical navigation element that helps users find content within each version of your documentation.
With @viteplus/versions, you can create version-specific sidebars or use a single sidebar for all versions.

## The `skipVersioning` Flag

In @viteplus/versions, each sidebar item can include a special property: . `skipVersioning: true`

```ts
themeConfig: {
    sidebar: {
        root: [
            { text: 'Guide', link: '/', skipVersioning: true },
            { text: 'Log', link: '/log' }
        ]
    }
}

```

When this flag is set:

- The link will **not** be processed by the versioning system
- The link will remain unchanged regardless of which version the user is viewing
- This is useful for external links or links that should always point to the same location

> [!IMPORTANT]
> If you don't include `skipVersioning: true`, links will be automatically processed to include the current version in the URL path.

### Parent-Child Versioning Behavior

When working with nested sidebar items, it's important to understand how versioning applies:

```ts
const sidebar = {
    text: 'Configuration',
    collapsed: false,
    base: '/configuration/',  // The version will be added here
    items: [
        { text: 'CLI Options', link: '/configuration/cli' },
        { text: 'Configuration File', link: '/configuration/file' }
    ]
};
```

> In nested structures:
>
> 1. The `skipVersioning` flag only needs to be set on the parent item
> 2. All child items inherit this behavior automatically
> 3. Version path prefixes are added to the `base` property, which affects all child links
> 4. Setting on individual child items has no effect when the parent uses this flag `skipVersioning: true`

::: danger :rocket: Important
Setting on individual child items has no effect `skipVersioning: true` it set by the parent!
:::

## Sidebar Configuration Options

### 1. Global Sidebar (Array Format)

You can define a single sidebar configuration that
applies to all versions by using an array:

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

> This format applies the same sidebar to all documentation versions.

### 2. Version-specific Sidebars (Object Format)

For more flexibility, you can define different sidebar items for specific versions using an object format:

::: danger :rocket: Important
Version-specific configurations do not inherit properties from the root configuration
:::

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
