/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { join } from 'path/posix';
import { inject } from '@symlinks/services/inject.service';
import { normalizeNav, populateNav, parseLocaleNav, parseNavs } from '@components/nav.component';
import { isNavItemWithChildren, isNavItemWithLink, replaceLinksRecursive } from '@components/nav.component';

/**
 * Tests
 */

describe('nav.component', () => {
    let mockInject: MockState<unknown, Parameters<typeof inject>>;

    beforeEach(() => {
        xJet.resetAllMocks();
        mockInject = xJet.mock(inject);
    });

    describe('type guards', () => {
        test('isNavItemWithChildren should return true if item has items', () => {
            const item: any = { text: 'Docs', items: [] };
            expect(isNavItemWithChildren(item)).toBe(true);
        });

        test('isNavItemWithLink should return true if item has link', () => {
            const item: any = { text: 'Home', link: '/home' };
            expect(isNavItemWithLink(item)).toBe(true);
        });
    });

    describe('replaceLinksRecursive', () => {
        test('should prepend version to link when not skipped', () => {
            const item = { text: 'Guide', link: '/guide/' };
            const result: any = replaceLinksRecursive('v1.0', item);
            expect(result.link).toBe(join('/', 'v1.0', '/guide/'));
        });

        test('should not modify link if skipVersioning is true', () => {
            const item = { text: 'Guide', link: '/guide/', skipVersioning: true };
            const result: any = replaceLinksRecursive('v1.0', item);
            expect(result.link).toBe('/guide/');
        });

        test('should recurse through children', () => {
            const item: any = {
                text: 'Parent',
                items: [{ text: 'Child', link: '/child/' }]
            };
            const result: any = replaceLinksRecursive('v2.0', item);
            expect(result.items[0].link).toBe(join('/', 'v2.0', '/child/'));
        });
    });

    describe('normalizeNav', () => {
        test('should return empty object if nav is undefined', () => {
            expect(normalizeNav(undefined)).toEqual({});
        });

        test('should wrap array in root key', () => {
            const arr = [{ text: 'Home', link: '/' }];
            expect(normalizeNav(arr)).toEqual({ root: arr });
        });

        test('should return record as-is', () => {
            const rec = { root: [{ text: 'Home', link: '/' }] };
            expect(normalizeNav(rec)).toBe(rec);
        });
    });

    describe('populateNav', () => {
        test('should inject versioningPlugin props if component is set', () => {
            const state: any = {
                versionsList: [ 'v1.0' ],
                versionsConfig: { current: 'v1.0', versionSwitcher: false }
            };
            mockInject.mockReturnValue(state);

            const target: any = {};
            const items = [{ text: 'Switcher', component: 'SwitcherComponent' }];

            populateNav(target, items, 'v1.0');

            expect(target.nav[0].props.versioningPlugin).toEqual({
                versions: [ 'v1.0' ],
                currentVersion: 'v1.0'
            });
        });

        test('should replace links recursively for normal items', () => {
            const state: any = {
                versionsList: [ 'v1.0' ],
                versionsConfig: { current: 'v1.0', versionSwitcher: false }
            };
            mockInject.mockReturnValue(state);

            const target: any = {};
            const items = [{ text: 'Guide', link: '/guide/' }];

            populateNav(target, items, 'v1.0');

            expect(target.nav[0].link).toBe(join('/', 'v1.0', '/guide/'));
        });
    });

    describe('parseLocaleNav', () => {
        test('should populate locale and version navs', () => {
            const mockState: any = {
                vitepressConfig: {
                    locales: { root: {}, fr: {}, 'fr/v1.0': {}, 'fr/v2.0': {} }
                },
                configuration: {
                    locales: {
                        fr: {
                            themeConfig: {
                                nav: [{ text: 'Home', link: '/' }]
                            }
                        }
                    }
                },
                localesMap: { fr: 'fr' },
                versionsList: [ 'v1.0', 'v2.0' ]
            };

            parseLocaleNav(mockState);

            expect(mockState.vitepressConfig.locales.fr.themeConfig.nav[0].link)
                .toBe(join('/', 'fr', '/'));
            expect(mockState.vitepressConfig.locales['fr/v1.0'].themeConfig.nav[0].link)
                .toBe(join('/', 'fr/v1.0', '/'));
            expect(mockState.vitepressConfig.locales['fr/v2.0'].themeConfig.nav[0].link)
                .toBe(join('/', 'fr/v2.0', '/'));
        });
    });

    describe('parseNavs', () => {
        test('should delegate to parseLocaleNav if locales exist', () => {
            const mockState: any = {
                vitepressConfig: { locales: {} },
                configuration: { locales: { en: {} } },
                versionsList: []
            };
            const spy = xJet.mock(parseLocaleNav);
            mockInject.mockReturnValue(mockState);

            parseNavs();

            expect(spy).toHaveBeenCalledWith(mockState);
        });

        test('should populate root and version navs if no locales', () => {
            const mockState: any = {
                versionsList: [ 'v1' ],
                vitepressConfig: {
                    locales: { root: {}, v1: {} }
                },
                configuration: {
                    locales: {},
                    themeConfig: { nav: [{ text: 'Home', link: '/' }] }
                },
                versionsConfig: { current: '', versionSwitcher: false }
            };
            mockInject.mockReturnValue(mockState);

            parseNavs();

            expect(mockState.vitepressConfig.locales.root.themeConfig.nav[0].link)
                .toBe(join('/', '', '/'));
            expect(mockState.vitepressConfig.locales.v1.themeConfig.nav[0].link)
                .toBe(join('/', '', '/'));
        });
    });
});
