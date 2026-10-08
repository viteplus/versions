# Version Switcher Configuration

The version switcher is a key component in @viteplus/versions that
allows users to navigate between different documentation versions.
This document explains the two methods for implementing version switching in your documentation.

## Basic Configuration Method

The simplest way to add version switching is through the `versionSwitcher` property in your `versionsConfig`.
This method provides a straightforward dropdown menu in your navigation bar.

### Configuration Options

```ts
const config = {
    versionsConfig: {
        // other version settings...
        versionSwitcher: { // [!code focus]
            text: 'Switch Version',           // [!code focus] The display label for the dropdown
            includeCurrentVersion: true       // [!code focus] Whether to include current version in the dropdown
        } // [!code focus]
    }
}
```

You can also disable the version switcher completely:

```ts
versionsConfig: {
  // other version settings...
  versionSwitcher: false
}
```

### How It Works

When enabled, the plugin automatically:

- Builds a list of all available versions from your documentation
- Creates a dropdown menu in your navigation bar with the specified label
- Lists all versions as menu items
- Optionally includes the current version in the dropdown (controlled by `includeCurrentVersion`)

### Limitations

The basic version switcher has some limitations:

- It doesn't preserve the user's current page position when switching versions
- It doesn't maintain locale settings when changing versions
- It uses a generic dropdown style that might not match custom themes

## Advanced Component Method

For more control over version switching, @viteplus/versions provides a custom Vue component: `VersionSwitcher`.
This component offers enhanced functionality and can be styled to match your theme.

### Step 1: Register the Component

First, register the component in your theme setup:

```ts
// docs/.vitepress/theme/index.ts
import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import VersionSwitcher from '@viteplus/versions/components/version-switcher.component.vue'; // [!code focus]

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Custom layout slots if needed
    });
  },
  enhanceApp({ app }) { // [!code focus]
    // Register the component
    app.component('VersionSwitcher', VersionSwitcher); // [!code focus]
  } // [!code focus]
};
```

### Step 2: Add to Navigation

Then, include the component in your navigation configuration:

```ts
// docs/.vitepress/config.ts
export default defineVersionedConfig({
  // Other configuration...
  themeConfig: {
    nav: {
      root: [ 
        { text: 'Home', link: '/' },
        // Add the version switcher component
        { component: 'VersionSwitcher' }
      ]
    }
  }
});
```

### Benefits of the Component Approach

The `VersionSwitcher` component offers significant advantages:

1. **Preserves Navigation Context**: When switching versions, it keeps your position in the documentation by carrying
   the current page path across.
2. **Locale Support**: Maintains the current locale when switching between versions.
3. **Responsive Design**: Adapts to both desktop and mobile viewports with appropriate styling.
4. **Custom Styling**: Can be styled to match your theme's design system.
5. **Dynamic Behavior**: Shows only relevant version options based on the current context.

### Marking the Latest Version

The switcher tags the current version as the latest one, both on the flyout button and in the menu,
so `v2.1.x` reads as `v2.1.x (latest)`. Set `latestLabel` in the nav item's `props` to change the tag,
for example to translate it, or set it to an empty string to turn it off:

```ts
nav: [
    { component: 'VersionSwitcher', props: { latestLabel: 'neueste' } } // [!code focus]
]
```

A current version that already reads as the tag, such as the default `current: 'latest'`, is shown
as it is rather than as `latest (latest)`.

### Changing the Label

The switcher reads `Switch Version` on the mobile menu button and in the accessible label of the
desktop flyout. Set `label` in the nav item's `props` to change it:

```ts
nav: [
    { component: 'VersionSwitcher', props: { label: 'Version wechseln' } } // [!code focus]
]
```

### Translating the Switcher

Each locale has its own `nav`, so give each one its own `VersionSwitcher` with its own `label` and
`latestLabel`:

```ts
export default defineVersionedConfig({
    versionsConfig: {
        current: 'v2.3.x',
        versionSwitcher: false // [!code focus]
    },
    locales: {
        root: {
            lang: 'en',
            label: 'English',
            themeConfig: {
                nav: [
                    { component: 'VersionSwitcher' } // [!code focus]
                ]
            }
        },
        de: {
            lang: 'de',
            label: 'Deutsch',
            themeConfig: {
                nav: [
                    { component: 'VersionSwitcher', props: { label: 'Version wechseln', latestLabel: 'neueste' } } // [!code focus]
                ]
            }
        }
    }
});
```

::: warning 🌐 Keep the switcher out of the global nav
Items of the global `themeConfig.nav` are added to the nav of every locale, and so is the
[basic dropdown](#basic-configuration-method). Set `versionSwitcher: false` and place the component
only in each locale's `nav`, or every language shows the same untranslated switcher.
:::

::: danger 🏠 Missing pages
A version rarely carries every page of the one before it. The plugin lists the routes each version
publishes, so when the page you are reading is absent from the version you pick, the switcher links
to that version's home page instead of a URL that would answer 404. Routes come from the same
resolver that builds the [rewrites](../config/rewrites), so a listed route is always a served one.
:::

::: tip
The version list is built from the [`archive`](../config/configuration#archive) subfolders plus
[`current`](../config/configuration#current), so you never list versions by hand. The switcher
stays hidden until at least one version is archived.
:::

## See also

- [Configuration Options](../config/configuration)
- [Navigation](./navigation)
- [Localization](./locales)
- [Getting Started](../)
