/**
 * Import will remove at compile time
 */

import type { VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { assignMissingDeep } from '@components/object.component';
import { versionSwitcher } from '@components/switcher.component';

/**
 * Tests
 */

beforeEach(() => {
    xJet.clearAllMocks();
});

describe('versionSwitcher', () => {
    const mockAssignMissingDeep = xJet.mock(assignMissingDeep);

    test('adds dropdown with latest label and versions', () => {
        const themeConfig: VersionThemeInterface = { nav: [] } as any;

        versionSwitcher(themeConfig, [ 'v1', 'v2' ]);

        expect(themeConfig.nav?.[0]).toEqual({
            text: 'Switch Version',
            items: [
                { text: 'Latest', link: '/' },
                { text: 'v1', link: '/v1/' },
                { text: 'v2', link: '/v2/' }
            ]
        });
    });

    test('appends to existing nav items', () => {
        const themeConfig: any = {
            nav: [{ text: 'Home', link: '/' }]
        } as any;

        versionSwitcher(themeConfig, [ 'v1' ]);

        expect(themeConfig.nav?.length).toBe(2);
        expect(themeConfig.nav?.[1].text).toBe('Switch Version');
    });

    test('uses custom latestVersion label', () => {
        const themeConfig: any = { nav: [] } as any;

        versionSwitcher(themeConfig, [ 'v1' ], '2.0.0');

        expect(themeConfig.nav?.[0].items?.[0]).toEqual({
            text: '2.0.0 (latest)',
            link: '/'
        });
    });

    test('fills missing keys with defaults when versionSwitcher object exists', () => {
        const themeConfig: VersionThemeInterface = {
            versionSwitcher: { text: 'Versions' },
            nav: []
        } as any;

        versionSwitcher(themeConfig, [ 'v1' ]);

        expect(mockAssignMissingDeep).toHaveBeenCalledWith(
            themeConfig.versionSwitcher,
            { text: 'Switch Version', includeLatestVersion: true }
        );
    });

    test('exits early if versionSwitcher is false', () => {
        const themeConfig: VersionThemeInterface = {
            versionSwitcher: false,
            nav: []
        } as any;

        versionSwitcher(themeConfig, [ 'v1' ]);

        expect(themeConfig.nav).toEqual([]);
        expect(mockAssignMissingDeep).not.toHaveBeenCalled();
    });

    test('handles undefined nav by initializing array', () => {
        const themeConfig: any = {} as any;

        versionSwitcher(themeConfig, [ 'v1' ]);

        expect(Array.isArray(themeConfig.nav)).toBe(true);
        expect(themeConfig.nav?.[0].items?.length).toBe(2);
    });
});
