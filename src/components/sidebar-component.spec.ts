/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';
import type { StateModel } from '@models/state.model';
import type { SidebarItemType, SidebarObjectType, SidebarType } from '@interfaces/sidebar.interface';

/**
 * Imports
 */

import { inject } from '@symlinks/services/inject.service';
import { normalizeSidebar, normalizeSidebars, parseSidebar, populateSidebar } from '@components/sidebar.component';

/**
 * Tests
 */

describe('populateSidebar', () => {
    test('should prepend version to base when item has a link', () => {
        const sidebar: Array<SidebarItemType> = [{ text: 'Intro', link: '/intro' }];

        const result = populateSidebar(sidebar, 'v1');

        expect(result[0].base).toBe('/v1/');
    });

    test('should prepend version to base when item has nested items', () => {
        const sidebar: Array<SidebarItemType> = [
            {
                text: 'Guide',
                items: [{ text: 'Setup', link: '/setup' }]
            }
        ];

        const result = populateSidebar(sidebar, 'v2');

        expect(result[0].base).toBe('/v2/');
    });

    test('should skip versioning if skipVersioning is true', () => {
        const sidebar: Array<SidebarItemType> = [{ text: 'Docs', link: '/docs', skipVersioning: true }];

        const result = populateSidebar(sidebar, 'v1');

        expect(result[0].base).toBeUndefined();
    });

    test('should normalize "root" version to empty string', () => {
        const sidebar: Array<SidebarItemType> = [{ text: 'Intro', link: '/intro' }];

        const result = populateSidebar(sidebar, 'root');

        expect(result[0].base).toBeUndefined();
    });

    test('should preserve other properties of the sidebar item', () => {
        const sidebar: Array<any> = [{ text: 'Intro', link: '/intro', collapsible: true }];

        const result: any = populateSidebar(sidebar, 'v1');

        expect(result[0].text).toBe('Intro');
        expect(result[0].collapsible).toBe(true);
        expect(result[0].base).toBe('/v1/');
    });
});

describe('normalizeSidebar', () => {
    test('should wrap array sidebar in root key when prefix is empty', () => {
        const results: SidebarObjectType = {};
        const sidebar: Array<SidebarItemType> = [{ text: 'Home', link: '/' }];

        normalizeSidebar(results, sidebar);

        expect(results.root).toEqual([{ text: 'Home', link: '/' }]);
    });

    test('should use prefix as key when provided', () => {
        const results: SidebarObjectType = {};
        const sidebar: Array<SidebarItemType> = [{ text: 'Guide', link: '/guide/' }];

        normalizeSidebar(results, sidebar, 'en');

        expect(results.en).toEqual([{ text: 'Guide', link: '/guide/' }]);
    });

    test('should merge with root items if root exists', () => {
        const results: SidebarObjectType = {};
        const sidebar: Array<SidebarItemType> = [{ text: 'Child', link: '/child/' }];
        const root: SidebarObjectType = { root: [{ text: 'RootItem', link: '/' }] };

        normalizeSidebar(results, sidebar, '', root); // <-- pass root here

        expect(results.root).toEqual([
            { text: 'RootItem', link: '/' },
            { text: 'Child', link: '/child/' }
        ]);
    });

    test('should handle sidebar object with multiple keys', () => {
        const results: SidebarObjectType = {};
        const sidebar: SidebarType = {
            root: [{ text: 'Root', link: '/' }],
            guide: [{ text: 'Guide', link: '/guide/' }]
        };

        normalizeSidebar(results, sidebar);

        expect(results.root).toEqual([{ text: 'Root', link: '/' }]);
        expect(results['guide']).toEqual([{ text: 'Guide', link: '/guide/' }]);
    });

    test('should handle single item in sidebar object', () => {
        const results: SidebarObjectType = {};
        const sidebar: any = {
            guide: { text: 'Guide', link: '/guide/' } // single item
        };

        normalizeSidebar(results, sidebar);

        expect(results['guide']).toEqual([{ text: 'Guide', link: '/guide/' }]);
    });

    test('should merge with root or specific root key from root object', () => {
        const results: SidebarObjectType = {};
        const sidebar: SidebarType = {
            guide: [{ text: 'Child', link: '/child/' }]
        };
        const root: SidebarObjectType = { guide: [{ text: 'RootGuide', link: '/root-guide/' }] };

        normalizeSidebar(results, sidebar, '', root);

        expect(results['guide']).toEqual([{ text: 'RootGuide', link: '/root-guide/' }, { text: 'Child', link: '/child/' }]);
    });
});

describe('normalizeSidebars', () => {
    let mockState: StateModel;

    beforeEach(() => {
        mockState = {
            configuration: {
                locales: {
                    en: { themeConfig: { sidebar: [{ text: 'EnItem', link: '/en/' }] } },
                    fr: { themeConfig: { sidebar: [{ text: 'FrItem', link: '/fr/' }] } }
                },
                themeConfig: {
                    sidebar: [{ text: 'GlobalItem', link: '/global/' }]
                }
            },
            localesMap: { en: 'root', fr: 'fr' }
        } as unknown as StateModel;
    });

    test('should normalize locale sidebars with prefix', () => {
        const result = normalizeSidebars(mockState);

        expect(result.root).toEqual([
            { text: 'GlobalItem', link: '/global/' },
            { text: 'EnItem', link: '/en/' }
        ]);

        expect(result.fr).toEqual([
            { text: 'GlobalItem', link: '/global/' },
            { text: 'FrItem', link: '/fr/' }
        ]);
    });

    test('should fallback to root if locale sidebar is empty', () => {
        mockState.configuration.locales['de'] = { themeConfig: {} };

        const result = normalizeSidebars(mockState);

        expect(result.de).toEqual([{ text: 'GlobalItem', link: '/global/' }]);
    });
});

describe('parseSidebar', () => {
    let mockInject: MockState<unknown, Parameters<typeof inject>>;

    beforeEach(() => {
        xJet.restoreAllMocks();
        mockInject = xJet.mock(inject);
    });

    test('should populate sidebar for each locale using normalizeSidebars result', () => {
        const mockState = {
            configuration: {
                locales: {
                    en: { themeConfig: {} },
                    fr: { themeConfig: {} }
                },
                themeConfig: {
                    sidebar: [{ text: 'GlobalItem', link: '/' }] as SidebarItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    en: {},
                    fr: {}
                }
            },
            localesMap: { en: 'en', fr: 'fr' }
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseSidebar();

        expect(mockState.vitepressConfig.locales.en.themeConfig?.sidebar).toEqual([{ text: 'GlobalItem', link: '/', base: '/en/' }]);
        expect(mockState.vitepressConfig.locales.fr.themeConfig?.sidebar).toEqual([{ text: 'GlobalItem', link: '/', base: '/fr/' }]);
    });

    test('should fallback to root sidebar if locale key is missing in sidebars', () => {
        const mockState = {
            configuration: {
                locales: {
                    he: { themeConfig: {} }
                },
                themeConfig: {
                    sidebar: [{ text: 'RootOnly', link: '/' }] as SidebarItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    he: {}
                }
            },
            localesMap: { he: 'he' }
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseSidebar();

        expect(mockState.vitepressConfig.locales.he.themeConfig?.sidebar).toEqual([{ text: 'RootOnly', link: '/', base: '/he/' }]);
    });

    test('should initialize missing themeConfig for a locale', () => {
        const mockState = {
            configuration: {
                locales: {
                    de: {}
                },
                themeConfig: {
                    sidebar: [{ text: 'Docs', link: '/docs/' }] as SidebarItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    de: {} // no themeConfig here initially
                }
            },
            localesMap: { de: 'de' }
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseSidebar();

        expect(mockState.vitepressConfig.locales.de.themeConfig).toBeDefined();
        expect(mockState.vitepressConfig.locales.de.themeConfig?.sidebar).toEqual([{ text: 'Docs', link: '/docs/', base: '/de/' }]);
    });
});
