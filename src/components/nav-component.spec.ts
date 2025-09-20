/**
 * Import will remove at compile time
 */

import type { DefaultTheme } from 'vitepress';
import type { VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { addVersioningToNavItem, versioningNav } from '@components/nav.component';

/**
 * Tests
 */

describe('addVersioningToNavItem', () => {
    test('adds versioningPlugin props when component exists', () => {
        const navItem: DefaultTheme.NavItem = {
            text: 'Docs',
            component: 'CustomComponent'
        } as any;

        const versions = [ '1.0.0', '2.0.0' ];
        const latest = '2.0.0';

        const result = addVersioningToNavItem(navItem, versions, latest);

        expect(result).toHaveProperty('props.versioningPlugin', {
            versions,
            latestVersion: latest
        });
    });

    test('recursively processes nested items', () => {
        const navItem: DefaultTheme.NavItem = {
            text: 'Root',
            items: [ { text: 'Child', component: 'ChildComponent' } as any ]
        } as any;

        const result = <DefaultTheme.NavItemWithChildren> addVersioningToNavItem(navItem, [ 'v1' ], 'v1');

        expect(result.items?.[0]).toHaveProperty('props.versioningPlugin', {
            versions: [ 'v1' ],
            latestVersion: 'v1'
        });
    });

    test('does nothing when no component and no items', () => {
        const navItem: DefaultTheme.NavItem = { text: 'Plain' } as any;
        const result = addVersioningToNavItem(navItem, [ 'v1' ], 'v1');

        expect(result).toEqual({ text: 'Plain' });
    });

    test('merges with existing props instead of overwriting', () => {
        const navItem: DefaultTheme.NavItem = {
            text: 'Docs',
            component: 'WithProps',
            props: { custom: true }
        } as any;

        const result = <DefaultTheme.NavItemComponent> addVersioningToNavItem(navItem, [ 'v1' ], 'v1');

        expect(result.props).toEqual({
            custom: true,
            versioningPlugin: {
                versions: [ 'v1' ],
                latestVersion: 'v1'
            }
        });
    });
});

describe('versioningNav', () => {
    test('applies addVersioningToNavItem to each nav item', () => {
        const themeConfig: VersionThemeInterface = {
            nav: [
                { text: 'Docs', component: 'Comp' } as any,
                { text: 'About' } as any
            ]
        } as any;

        versioningNav(themeConfig, [ '1.0.0' ], '1.0.0');

        expect(themeConfig.nav?.[0]).toHaveProperty('props.versioningPlugin', {
            versions: [ '1.0.0' ],
            latestVersion: '1.0.0'
        });
        // Second item without component should remain unchanged
        expect(themeConfig.nav?.[1]).toEqual({ text: 'About' });
    });

    test('returns early when nav is not an array', () => {
        const themeConfig: VersionThemeInterface = {} as any;
        expect(() => versioningNav(themeConfig, [ 'v' ], 'v')).not.toThrow();
        expect(themeConfig.nav).toBeUndefined();
    });
});
