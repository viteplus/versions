/**
 * Imports
 */

import { defineVersionedConfig } from '@viteplus/versions';

/**
 * Doc config
 */

export default defineVersionedConfig({
    title: 'versions',
    base: '/versions/',
    description: 'A versioning plugin for VitePress',
    head: [
        [ 'link', { rel: 'icon', type: 'image/png', href: '/xJet/logo.png' }],
        [ 'meta', { name: 'theme-color', content: '#ff7e17' }],
        [ 'script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-ZSH55Z9478' }],
        [
            'script', {},
            'window.dataLayer = window.dataLayer || [];function gtag(){ dataLayer.push(arguments); }gtag(\'js\', new Date());gtag(\'config\', \'G-ZSH55Z9478\');'
        ]
    ],
    versionsConfig: {
        current: 'v2.0.x',
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
            root: [
                { text: 'Locales', link: '/guide/locales' },
                { text: 'Sidebar', link: '/guide/sidebar' },
                { text: 'Rewrites', link: '/guide/rewrites' },
                { text: 'Navigation', link: '/guide/navigation' },
                { text: 'Configuration', link: '/guide/configuration' },
                { text: 'Version Switchers', link: '/guide/switchers' }
            ],
            'v1.0.x': []
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/viteplus/versions' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/@viteplus/versions' }
        ],

        docFooter: {
            prev: false,
            next: false
        },
        footer: {
            message: 'Released under the Mozilla Public License 2.0',
            copyright: `Copyright © ${ new Date().getFullYear() } @viteplus/versions Contributors`
        }
    }
});
