---
name: 🐞 Bug Report
title: 🐞 Bug Report
about: Something is broken
labels: [ "bug", "needs triage" ]
---

**Describe the bug**

A clear and concise description of what is wrong.

**Reproduction**

A minimal VitePress config and the setup that triggers the problem.

```ts
// .vitepress/config.ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    title: 'My Project Documentation',
    versionsConfig: {
        current: 'v2.0.0'
        /* ... */
    }
});
```

**Expected behavior**

What you expected to happen.

**Actual behavior**

What actually happened. Include the full error message and stack trace if there is one.

```text
Error: ...
    at ...
```

**Environment**

|                                 | |
|---------------------------------|-|
| `@viteplus/versions` version    | |
| VitePress version               | |
| Node.js version                 | |
| TypeScript version              | |
| OS                              | |

**Checklist**

- [ ] I have searched for existing issues, and this is not a duplicate.
- [ ] I am using the latest published version.
- [ ] I have included a minimal reproduction above.
