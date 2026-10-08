# @viteplus/versions

[![Documentation](https://img.shields.io/badge/Documentation-orange?logo=typescript&logoColor=f5f5f5)](https://viteplus.github.io/versions/)
[![npm version](https://img.shields.io/npm/v/@viteplus/versions.svg)](https://www.npmjs.com/package/@viteplus/versions)
[![downloads](https://img.shields.io/npm/dm/@viteplus/versions?label=npm%20downloads)](https://www.npmjs.com/package/@viteplus/versions)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![CI](https://github.com/viteplus/versions/actions/workflows/ci.yml/badge.svg)](https://github.com/viteplus/versions/actions/workflows/ci.yml)
[![Discord](https://img.shields.io/discord/1422908712116420659?logo=Discord&label=Discord)](https://discord.gg/6vgFhJTEGn)
[![Ask DeepWiki](https://img.shields.io/badge/Ask-DeepWiki-blue)](https://deepwiki.com/viteplus/versions)

A VitePress plugin for versioned documentation. Call `defineVersionedConfig` instead of VitePress's
`defineConfig` and it manages versioned routes, a per-version sidebar and navigation, and a `VersionSwitcher`
component - so a single site can serve your current docs alongside frozen copies of every previous version.

It is designed for documentation that evolves across releases, with version-aware localization, automatic URL
rewriting, and per-version configuration that lets each version keep its own navigation. It builds on the API
pioneered by [vitepress-versioning-plugin](https://github.com/IMB11/vitepress-versioning-plugin) and supports
VitePress v1.6.4 and the v2.x line.

## Key Features

- **Versioned routes**: serve the current docs from `src/` at the root and each `archive/` subfolder as a frozen, separately-routed version.
- **Per-version navigation**: give every version its own nav and sidebar, or share one configuration across all of them.
- **Version switcher**: a built-in `VersionSwitcher` component that lists every version and switches between them.
- **Version-aware localization**: full multi-language support, with locale and version combined into clean URLs.
- **Smart URL rewriting**: automatic, predictable paths, customizable through a `rewritesHook`.
- **Drop-in**: wraps VitePress's config and keeps every native VitePress feature.

## Installation

```bash
npm install @viteplus/versions
# or
pnpm add @viteplus/versions
# or
yarn add @viteplus/versions
```

@viteplus/versions requires Node.js 20 or later and works with VitePress v1.6.4 and the v2.x line.

## Quick start

```ts
// .vitepress/config.ts
import { defineVersionedConfig } from '@viteplus/versions';

export default defineVersionedConfig({
    title: 'My Project Documentation',
    description: 'Documentation with version control',
    versionsConfig: {
        current: 'v2.0.0',
        versionSwitcher: {
            text: 'Version',
            includeCurrentVersion: true
        }
    },
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/' },
            { component: 'VersionSwitcher' }
        ]
    }
});
```

Current-version content lives in `docs/src` and is served at the site root; each subfolder of `docs/archive`
becomes a frozen version. `defineVersionedConfig` wires the routing - you do not set `srcDir` yourself.

## Theme setup

Register the `VersionSwitcher` component in your theme so it can be placed in the nav or used directly.

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import VersionSwitcher from '@viteplus/versions/components/version-switcher.component.vue';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('VersionSwitcher', VersionSwitcher);
    }
};
```

## Project structure

```text
docs/
├── .vitepress/
│   └── config.ts
├── src/            // current version content (served at the root)
│   ├── index.md
│   └── guide/
└── archive/        // archived versions (each subfolder is one frozen version)
    └── v1.0.x/
        ├── index.md
        └── guide/
```

## Localization

Add locale subfolders under `src` and each `archive/<version>`; the default URL layout is `locale/version/source`.

```ts
export default defineVersionedConfig({
    locales: {
        root: { lang: 'en', label: 'English' },
        de:   { lang: 'de', label: 'Deutsch' }
    }
});
```

## Version-specific navigation

`nav` and `sidebar` each accept an array (shared by every version) or an object keyed by version, where `root`
is the current version. Version-specific entries are self-contained and do not inherit from `root`.

```ts
export default defineVersionedConfig({
    themeConfig: {
        nav: {
            // Default navigation for the current version
            root: [
                { text: 'Home', link: '/' },
                { text: 'Guide', link: '/guide/' }
            ],
            // Navigation only for v1.0.x
            'v1.0.x': [
                { text: 'Home', link: '/' },
                { text: 'Legacy API', link: '/legacy-api/' }
            ]
        }
    }
});
```

## Custom URL structure

Control how source paths map to URLs with `rewritesHook`.

```ts
export default defineVersionedConfig({
    versionsConfig: {
        hooks: {
            // version first, then locale
            rewritesHook: (source, version, locale) => `${version}/${locale}/${source}`
        }
    }
});
```

## Documentation

Full guides and the configuration reference live at
**[viteplus.github.io/versions](https://viteplus.github.io/versions/)**.

## Development with Docker

The `docker/` folder holds a `node:24-alpine` development environment, so working on the plugin needs only
Docker - no local Node.js or pnpm. The repo is mounted into the container, so edits on your machine are picked
up live, while the dependencies are installed inside the image and never touch your local `node_modules`.

Run every command from the repo root. One line installs, builds in watch mode, and serves the docs:

```bash
docker compose -f docker/compose.yml up
```

This starts two services:

- `watch` - `pnpm dev` (`xBuild -w`), rebuilding `dist/` on every change under `src/`.
- `docs` - `pnpm docs:dev`, serving the documentation at
  [http://localhost:5173/versions/](http://localhost:5173/versions/) with hot reload, including changes to
  the `VersionSwitcher` component. The site is served under its `/versions/` base path, and
  `http://localhost:5173/` redirects there.

To serve only the docs, without the watch build, start the `docs` service alone. It serves the last build in
`dist/`, so changes under `src/` are not rebuilt:

```bash
docker compose -f docker/compose.yml up docs
```

Run any other command through the `cli` service:

```bash
docker compose -f docker/compose.yml run --rm cli pnpm test
docker compose -f docker/compose.yml run --rm cli pnpm lint
docker compose -f docker/compose.yml run --rm cli pnpm build -w
docker compose -f docker/compose.yml run --rm cli pnpm docs:build
docker compose -f docker/compose.yml run --rm cli          # a shell inside the container
```

`run` publishes no ports, so a dev server started with it cannot be reached from your browser - serve the docs
with `up` as shown above. If you do need a server through `run`, publish the port and listen on every interface:

```bash
docker compose -f docker/compose.yml run --rm --service-ports docs
docker compose -f docker/compose.yml run --rm -p 5173:5173 cli pnpm docs:dev --host 0.0.0.0
```

The dependencies are part of the image, so rebuild it after changing `package.json` or `pnpm-lock.yaml`.
`-V` swaps the containers' `node_modules` for the freshly installed one:

```bash
docker compose -f docker/compose.yml up --build -V
```

The container runs as the image's unprivileged `node` user (uid 1000), and pnpm is pinned to the version that wrote the
lockfile - pass `--build-arg PNPM_VERSION=<version>` to `build` to change it.

### Using Podman

The same files work with [Podman](https://podman.io/). Use `podman compose` in place of `docker compose`,
which runs the compose file through `docker-compose` or `podman-compose`, whichever is installed:

```bash
podman compose -f docker/compose.yml up
podman compose -f docker/compose.yml run --rm cli pnpm test
```

On Linux, Podman runs rootless, so the container's `node` user is not your user and cannot write to the mounted
repo. Map your user onto it before running any command:

```bash
export PODMAN_USERNS=keep-id:uid=1000,gid=1000
```

On hosts with SELinux enforcing (Fedora, RHEL), the container is also denied access to the mounted repo until it
is relabeled - add `:z` to the repo mount in `docker/compose.yml`:

```yaml
- ${PWD}:/app:z
```

`podman-compose` may not support `-V`. After changing the dependencies, remove the containers and their
`node_modules` volumes instead, then rebuild:

```bash
podman compose -f docker/compose.yml down -v
podman compose -f docker/compose.yml up --build
```

## Contributing

Contributions are welcome! Open an [issue](https://github.com/viteplus/versions/issues) or a pull request on
GitHub. See the [contributing guidelines](CONTRIBUTING.md) for setup and conventions.

## Links

[Documentation](https://viteplus.github.io/versions/),
[GitHub Repository](https://github.com/viteplus/versions),
[Issue Tracker](https://github.com/viteplus/versions/issues),
[npm Package](https://www.npmjs.com/package/@viteplus/versions)

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.
