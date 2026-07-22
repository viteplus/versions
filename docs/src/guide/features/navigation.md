# Navigation Configuration

When using @viteplus/versions, the navigation configuration
provides special features to support version-specific navigation items.
This allows you to customize the navigation bar based on the documentation version the user is viewing.

## The `skipVersioning` Flag

In @viteplus/versions, each navigation item can include a special property: . `skipVersioning: true`

```ts
const navItem = { 
    text: 'GitHub', 
    link: 'https://github.com/viteplus/versions', 
    skipVersioning: true 
}
```

When this flag is set:

- The link will **not** be processed by the versioning system
- The link will remain unchanged regardless of which version the user is viewing
- This is useful for external links or links that should always point to the same location

> [!IMPORTANT]
> If you don't include `skipVersioning: true`, links will be automatically processed to include the current version in the URL path.

## Navigation Configuration Options

### Option 1: Global Navigation (Array Format)

You can define a single navigation configuration that
applies to all versions by using an array:

```ts
themeConfig: {
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
    { text: 'API', link: '/api/' },
    { component: 'VersionSwitcher' }  // Add version switcher component
  ]
}
```

> With this configuration, all versions of your documentation will share the same navigation items.

### Option 2: Version-specific Navigation (Object Format)

For more flexibility, you can define different navigation items for specific versions using an object format:

::: danger :rocket: Important
Version-specific configurations do not inherit properties from the root configuration
:::

```ts
const themeConfig = {
    themeConfig: {
        nav: {
            root: [ // Default navigation for versions without specific configuration
                { text: 'Home', link: '/' },
                { text: 'Guide', link: '/guide/' },
                { text: 'API', link: '/api/' },
                { component: 'VersionSwitcher' }
            ],
            'v1.0': [ // Navigation specifically for version 1.0
                { text: 'Home', link: '/' },
                { text: 'Access', link: '/access/' }, // Version 1.0-specific link
                { text: 'Old API', link: '/old-api/' }, // Version 1.0-specific link
                { component: 'VersionSwitcher' }
            ]
        }
    }
}
```

> In this example:
>
> - Versions and `v3.0` will use the navigation defined in `root` `v2.0`
> - Version will use its own custom navigation `v1.0`
> - The `root` configuration serves as the default for any version that doesn't have a specific configuration
