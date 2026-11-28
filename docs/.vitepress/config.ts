/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { DefaultTheme, PageData } from 'vitepress';

/**
 * Imports
 */

import { defineVersionedConfig } from '@viteplus/versions';

/**
 * The sidebar of every version since v2.0.x, with the feature pages that only some versions hold.
 *
 * @param features - The feature pages of the version beyond the shared ones
 * @returns The sidebar of the version
 */

function sidebar(features: Array<DefaultTheme.SidebarItem> = []): Array<DefaultTheme.SidebarItem> {
    return [
        { text: 'Getting Started', link: '/guide/' },
        { text: 'Release Notes', link: '/release' },
        {
            text: 'Features',
            collapsed: false,
            items: [
                { text: 'Locales', link: '/guide/features/locales' },
                { text: 'Navigation', link: '/guide/features/navigation' },
                { text: 'Version Switchers', link: '/guide/features/switchers' },
                ...features
            ]
        },
        {
            text: 'Configuration',
            collapsed: false,
            items: [
                { text: 'Configuration', link: '/guide/config/configuration' },
                { text: 'Sidebar', link: '/guide/config/sidebar' },
                { text: 'Rewrites', link: '/guide/config/rewrites' }
            ]
        }
    ];
}

/**
 * Doc config
 */

export default defineVersionedConfig({
    title: 'versions',
    base: '/versions/',
    description: 'A versioning plugin for VitePress',
    head: [
        [ 'link', { rel: 'icon', type: 'image/png', href: '/versions/logo.png' }],
        [ 'meta', { name: 'theme-color', content: '#ff7e17' }],
        [
            'script', {
                async: '',
                src: 'https://cloud.umami.is/script.js',
                'data-website-id': 'fe8ff4ea-17b8-4c20-b35f-81dd1311dce0'
            }
        ],
        [
            'script', {
                async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-ZSH55Z9478'
            }
        ],
        [
            'script', {},
            'window.dataLayer = window.dataLayer || [];function gtag(){ dataLayer.push(arguments); }gtag(\'js\', new Date());gtag(\'config\', \'G-ZSH55Z9478\');'
        ]
    ],
    versionsConfig: {
        current: 'v3.1.x',
        versionSwitcher: false
    },
    themeConfig: {
        logo: '/logo.png',

        search: {
            provider: 'local'
        },

        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },
            { component: 'VersionSwitcher' }
        ],

        sidebar: {
            root: sidebar([{ text: 'Addresses Without a Version', link: '/guide/features/unversioned' }]),
            'v3.0.x': sidebar(),
            'v1.0.x': [
                { text: 'Getting Started', link: '/guide/' },
                { text: 'Release Notes', link: '/release' }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/viteplus/versions' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/@viteplus/versions' }
        ],

        docFooter: {
            prev: true,
            next: true
        },
        footer: {
            message: 'Released under the Mozilla Public License 2.0',
            copyright: `Copyright © ${ new Date().getFullYear() } @viteplus/versions Contributors`
        },
        editLink: {
            pattern: ({ filePath, relativePath }: PageData) => {
                const owner = 'viteplus';
                const repo = 'versions';
                const branch = 'master';

                // GitHub blob link to the specific file
                const fileUrl = `https://github.com/${ owner }/${ repo }/blob/${ branch }/docs/${ filePath }`;

                // Pre-filled issue parameters
                const title = encodeURIComponent(`Suggestion for: ${ relativePath }`);
                const body = encodeURIComponent(
                    '### Suggested changes\n\n' +
                    `File: [${ relativePath }](${ fileUrl })\n\n` +
                    '---\n\n' +
                    '**Describe your suggestion:**\n\n'
                );
                const labels = encodeURIComponent('enhancement,documentation');

                return `https://github.com/${ owner }/${ repo }/issues/new?title=${ title }&body=${ body }&labels=${ labels }`;
            },

            text: 'Suggest changes to this page'
        }
    }
});
