# Addresses Without a Version

Every page is published under its version, such as `/v2.x/guide`. An address that names no version, such as
`/guide`, opens the same page of the [`latest`](../config/configuration#latest) version, so links written before
the site was versioned, bookmarks, and links from other sites keep working.

No setup is needed. `defineVersionedConfig` wires it up in both `vitepress dev` and `vitepress build`.

## What opens where

With `latest: 'v2.x'`, a German locale `de`, and the default `cleanUrls: false`:

| Address               | Opens                      | Why                                               |
|-----------------------|----------------------------|---------------------------------------------------|
| `/`                   | `/v2.x/`                   | The root opens the latest home page               |
| `/guide`              | `/v2.x/guide.html`         | No version named, v2.x has `guide.md`             |
| `/guide/`             | `/v2.x/guide.html`         | A trailing slash names the same page              |
| `/config`             | `/v2.x/config/`            | v2.x has `config/index.md`                        |
| `/guide.html?q=1#top` | `/v2.x/guide.html?q=1#top` | The query and the hash are kept                   |
| `/de/`                | `/de/v2.x/`                | The locale home page of the latest version        |
| `/de/guide`           | `/de/v2.x/guide.html`      | The locale is kept, the version is added after it |
| `/missing`            | 404                        | v2.x has no such page                             |
| `/de/missing`         | 404                        | v2.x has no such German page                      |
| `/v1.x/missing`       | 404                        | The address names a version, so it is left alone  |

The address bar shows the versioned address, so a reader who copies it gets a link that keeps pointing at the
same version after a newer one becomes the latest.

The root locale has no prefix, so its pages are reached without one, as `/guide`. A prefix that is not the `link`
of a configured locale, such as `/fr/guide` without a French locale, is read as part of the page and shows the
not-found page.

## How it works

VitePress publishes every page at exactly one path. Serving `/guide` as well as `/v2.x/guide` would build each page of
the latest version twice, list it twice in the local search, and give search engines two addresses for one page.
The plugin builds nothing twice. It relies on what every static host already does with an address that has no file:
it serves `404.html`, which starts the full VitePress app.

```text
reader opens /guide
  → the host has no /guide.html, so it serves 404.html
  → a script at the top of <head> runs before the app:
      /guide names no version, and v2.x publishes v2.x/guide.md
      → history.replaceState to /v2.x/guide.html
  → the VitePress router starts, reads /v2.x/guide.html, and opens that page
```

The script does not reload the page or send a second request. VitePress's router only reads the address when the app
starts, so it sees the versioned address and loads that page as if the reader had opened it directly.

### The script

When the build ends, the plugin adds one inline script to:

- `404.html`, for every address that has no page;
- the root `index.html` of the site and of every locale, a copy of the latest home page, so `/` opens it with
  content and without waiting for the app.

The dev server adds the same script to every page it serves. On an address that names a version it does nothing.

The script carries the site base, the locale prefixes, the version names, `cleanUrls`, and the routes of the latest
version only, around 1 KB plus one entry per page. For an address, it:

1. drops the site base, and leaves an address outside the base alone;
2. takes off a leading locale prefix, such as `de`;
3. leaves the address alone when the next segment names a version;
4. reads the rest as a page, so `guide`, `guide/`, `guide.html`, and `guide/index` are the same page;
5. looks for `<locale>/<latest>/<page>.md`, then `<locale>/<latest>/<page>/index.md`, among the routes of the latest
   version;
6. moves the address to that page, keeping the query and the hash, or else does nothing.

When it does nothing, the not-found page shows as before, so a broken link stays visible.

### Links inside the site

A link the reader clicks inside the site does not reload the page, so the script does not run.
Nav, sidebar, and absolute markdown links already carry the version of the page, and so does every `link` in the
frontmatter, such as the buttons and cards of a home page:

```yaml
hero:
  actions:
    - text: Get Started
      link: /guide        # published as /v2.x/guide in v2.x, and /v1.x/guide in v1.x
```

See [Moving from v2](../config/configuration#moving-from-v2).
For a link without a version in your own Vue components, install
[`installVersionFallback`](./switchers#step-1b-catch-switches-onto-missing-pages). It sends that link to the latest
version the same way, through `router.onBeforeRouteChange`.

## Hosting

The host has to serve `404.html` for an address without a file. GitHub Pages, Netlify, Cloudflare Pages, Vercel, and
`vitepress preview` do this by default. A server you configure yourself needs a rule for it, such as this one for
nginx:

```nginx
error_page 404 /404.html;
```

The host answers `/guide` with status 404, even though the reader sees the page. Search engines skip it and index
only the versioned address, which is the one that stays valid.

## Limits

- A page that exists only in an older version does not open from an address without a version. Name the version.
- An address without a version opens the latest version, never the current one when `latest` names another.
  Link `/next/...` to show the docs of a release that is not out yet.
- The routes are read when the configuration loads, so a page added while `vitepress dev` runs opens from an address
  without a version only after a restart.
