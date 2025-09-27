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
        versionSwitcher: {
            text: 'Switch Version',           // The display label for the dropdown
            includeCurrentVersion: true       // Whether to include current version in the dropdown
        }
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
import VersionSwitcher from '@viteplus/versions/components/version-switcher.component.vue';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Custom layout slots if needed
    });
  },
  enhanceApp({ app }) {
    // Register the component
    app.component('VersionSwitcher', VersionSwitcher);
  }
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

1. **Preserves Navigation Context**: When switching versions, it attempts to maintain your position in the documentation by preserving the current page path.
2. **Locale Support**: Maintains the current locale when switching between versions.
3. **Responsive Design**: Adapts to both desktop and mobile viewports with appropriate styling.
4. **Custom Styling**: Can be styled to match your theme's design system.
5. **Dynamic Behavior**: Shows only relevant version options based on the current context.
