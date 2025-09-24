/**
 * Imports
 */

import { versionSwitcher } from '@components/switcher.component';

/**
 * Tests
 */

describe('versionSwitcher', () => {
    test('should return undefined if versionSwitcher is false', () => {
        const themeConfig: any = { versionSwitcher: false };
        const result = versionSwitcher(themeConfig, [ 'v1.0.0' ]);
        expect(result).toBeUndefined();
    });

    test('should include current version as "Latest" by default', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: true }
        };

        const result = versionSwitcher(themeConfig, [ 'v1.0.0', 'v0.9.0' ]);
        expect(result).toEqual({
            text: 'Versions',
            items: [
                { link: '/', text: 'Latest', skipVersioning: true },
                { text: 'v1.0.0', link: '/v1.0.0/', skipVersioning: true },
                { text: 'v0.9.0', link: '/v0.9.0/', skipVersioning: true }
            ]
        });
    });

    test('should include current version label when provided', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: true }
        };

        const result = versionSwitcher(themeConfig, [ 'v2.0.0', 'v1.5.0' ], 'v2.0.0');
        expect(result).toEqual({
            text: 'Versions',
            items: [
                { link: '/', text: 'v2.0.0 (latest)', skipVersioning: true },
                { text: 'v2.0.0', link: '/v2.0.0/', skipVersioning: true },
                { text: 'v1.5.0', link: '/v1.5.0/', skipVersioning: true }
            ]
        });
    });

    test('should return correct items when includeCurrentVersion is false', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: false }
        };

        const result = versionSwitcher(themeConfig, [ 'v2.0.0', 'v1.5.0' ]);
        expect(result).toEqual({
            text: 'Versions',
            items: [
                { text: 'v2.0.0', link: '/v2.0.0/', skipVersioning: true },
                { text: 'v1.5.0', link: '/v1.5.0/', skipVersioning: true }
            ]
        });
    });
});
