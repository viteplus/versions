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
        const result = versionSwitcher(themeConfig, [ 'v1.0.0' ], 'v1.0.0');
        expect(result).toBeUndefined();
    });

    test('should not tag a stable version whose label already reads latest', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: true }
        };

        const result = versionSwitcher(themeConfig, [ 'latest', 'v1.0.0' ], 'latest');
        expect(result?.items[0]).toEqual({ link: '/', text: 'latest', skipVersioning: true });
    });

    test('should link the latest version to the root and list it once', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: true }
        };

        const result = versionSwitcher(themeConfig, [ 'v2.0.0', 'v1.5.0' ], 'v2.0.0');
        expect(result).toEqual({
            text: 'Versions',
            items: [
                { link: '/', text: 'v2.0.0 (latest)', skipVersioning: true },
                { text: 'v1.5.0', link: '/v1.5.0/', skipVersioning: true }
            ]
        });
    });

    test('should tag an archived stable version and list the current version after it', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: true }
        };

        const result = versionSwitcher(themeConfig, [ 'next', 'v2.0.0', 'v1.5.0' ], 'v2.0.0');
        expect(result?.items).toEqual([
            { link: '/', text: 'v2.0.0 (latest)', skipVersioning: true },
            { text: 'next', link: '/next/', skipVersioning: true },
            { text: 'v1.5.0', link: '/v1.5.0/', skipVersioning: true }
        ]);
    });

    test('should show the label of a version and keep its name in the link', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: true }
        };

        const labels = { 'v2.0.0': 'Two', 'v1.5.0': 'v1.5.0 (LTS)' };
        const result = versionSwitcher(themeConfig, [ 'v2.0.0', 'v1.5.0' ], 'v2.0.0', labels);
        expect(result?.items).toEqual([
            { link: '/', text: 'Two (latest)', skipVersioning: true },
            { text: 'v1.5.0 (LTS)', link: '/v1.5.0/', skipVersioning: true }
        ]);
    });

    test('should leave the current version out when includeCurrentVersion is false', () => {
        const themeConfig: any = {
            versionSwitcher: { text: 'Versions', includeCurrentVersion: false }
        };

        const result = versionSwitcher(themeConfig, [ 'v2.0.0', 'v1.5.0' ], 'v2.0.0');
        expect(result).toEqual({
            text: 'Versions',
            items: [{ text: 'v1.5.0', link: '/v1.5.0/', skipVersioning: true }]
        });
    });
});
