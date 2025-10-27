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
import { normalizeSidebar, normalizeSidebars, parseSidebars, populateSidebar } from '@components/sidebar.component';

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

    test('should skip items with external links', () => {
        const sidebar: Array<SidebarItemType> = [{ text: 'External', link: 'https://example.com' }];

        const result = populateSidebar(sidebar, 'v1');

        expect(result[0].base).toBeUndefined();
    });

    test('should handle base path properly', () => {
        const sidebar: Array<SidebarItemType> = [{ text: 'Docs', link: '/docs', base: '/api' }];

        const result = populateSidebar(sidebar, 'v1');

        expect(result[0].base).toBe('/v1/api/');
    });
});

describe('normalizeSidebar', () => {
    let mockState: StateModel;

    beforeEach(() => {
        mockState = {
            localesMap: { root: '', en: 'en', fr: 'fr' },
            versionsList: [ 'v1', 'v2' ]
        } as unknown as StateModel;
    });

    test('should normalize array sidebar with root prefix', () => {
        const results: Record<string, SidebarObjectType> = {};
        const sidebar: Array<SidebarItemType> = [{ text: 'Home', link: '/' }];

        normalizeSidebar(mockState, results, sidebar, 'root');

        expect(results.root).toEqual({
            '/': [{ text: 'Home', link: '/' }]
        });
    });

    test('should normalize array sidebar with locale prefix', () => {
        const results: Record<string, SidebarObjectType> = {};
        const sidebar: Array<SidebarItemType> = [{ text: 'Guide', link: '/guide/' }];

        normalizeSidebar(mockState, results, sidebar, 'en');

        expect(results.en).toEqual({
            'en': [{ text: 'Guide', link: '/guide/' }]
        });
    });

    test('should normalize object sidebar with multiple keys', () => {
        const results: Record<string, SidebarObjectType> = {};
        const sidebar: SidebarType = {
            '/': [{ text: 'Root', link: '/' }],
            '/guide/': [{ text: 'Guide', link: '/guide/' }]
        };

        normalizeSidebar(mockState, results, sidebar, 'root');

        expect(results.root).toEqual({
            '/': [{ text: 'Root', link: '/' }],
            'guide': [{ text: 'Guide', link: '/guide/' }]
        });
    });

    test('should handle single item in sidebar object', () => {
        const results: Record<string, SidebarObjectType> = {};
        const sidebar: any = {
            '/guide/': { text: 'Guide', link: '/guide/' }
        };

        normalizeSidebar(mockState, results, sidebar, 'root');
        expect(results.root['guide']).toEqual([{ text: 'Guide', link: '/guide/' }]);
    });

    test('should extract version from path keys', () => {
        const results: Record<string, SidebarObjectType> = {};
        const sidebar: SidebarType = {
            '/v1/guide/': [{ text: 'V1 Guide', link: '/v1/guide/' }]
        };

        normalizeSidebar(mockState, results, sidebar, 'root');

        expect(results.v1).toEqual({
            'v1/guide': [{ text: 'V1 Guide', link: '/v1/guide/' }]
        });
    });

    test('should extract locale from path keys', () => {
        const results: Record<string, SidebarObjectType> = {};
        const sidebar: SidebarType = {
            'fr/guide': [{ text: 'Guide FR', link: '/fr/guide/' }]
        };

        normalizeSidebar(mockState, results, sidebar, 'fr');

        expect(results.fr).toEqual({
            'fr/guide': [{ text: 'Guide FR', link: '/fr/guide/' }]
        });
    });

    test('should skip entries not matching locale prefix', () => {
        const results: Record<string, SidebarObjectType> = {};
        const sidebar: SidebarType = {
            '/fr/guide/': [{ text: 'Guide FR', link: '/fr/guide/' }],
            '/en/guide/': [{ text: 'Guide EN', link: '/en/guide/' }]
        };

        normalizeSidebar(mockState, results, sidebar, 'fr');

        expect(results.fr).toBeDefined();
        expect(results.en).toBeUndefined();
    });

    test('should handle undefined sidebar gracefully', () => {
        const results: Record<string, SidebarObjectType> = {};

        normalizeSidebar(mockState, results, undefined, 'root');

        expect(results).toEqual({});
    });

    test('should accumulate items in existing result keys', () => {
        const results: Record<string, SidebarObjectType> = {
            root: { '/': [{ text: 'Existing', link: '/' }] }
        };
        const sidebar: Array<SidebarItemType> = [{ text: 'New', link: '/' }];

        normalizeSidebar(mockState, results, sidebar, 'root');

        expect(results.root['/'].length).toBe(2);
        expect(results.root['/']).toContainEqual({ text: 'Existing', link: '/' });
        expect(results.root['/']).toContainEqual({ text: 'New', link: '/' });
    });
});

describe('normalizeSidebars', () => {
    let mockState: StateModel;

    beforeEach(() => {
        mockState = {
            configuration: {
                locales: {
                    root: { themeConfig: {} },
                    en: { themeConfig: { sidebar: [{ text: 'EnItem', link: '/en/' }] } },
                    fr: { themeConfig: { sidebar: [{ text: 'FrItem', link: '/fr/' }] } }
                },
                themeConfig: {
                    sidebar: [{ text: 'GlobalItem', link: '/global/' }]
                }
            },
            vitepressConfig: {
                locales: {
                    root: {},
                    en: {},
                    fr: {},
                    'v1': {},
                    'en/v1': {},
                    'fr/v1': {}
                }
            },
            localesMap: { root: '', en: 'en', fr: 'fr' },
            versionsList: [ 'v1', 'v2' ]
        } as unknown as StateModel;
    });

    test('should normalize all locale sidebars', () => {
        const result = normalizeSidebars(mockState);

        expect(result.root).toBeDefined();
        expect(result.en).toBeDefined();
        expect(result.fr).toBeDefined();
    });

    test('should merge global sidebar with locale sidebars', () => {
        const result = normalizeSidebars(mockState);

        expect(result.root['/']).toContainEqual({ text: 'GlobalItem', link: '/global/' });
        expect(result.en['en']).toContainEqual({ text: 'GlobalItem', link: '/global/' });
        expect(result.en['en']).toContainEqual({ text: 'EnItem', link: '/en/' });
    });

    test('should propagate parent sidebar to versioned locales', () => {
        const result = normalizeSidebars(mockState);

        expect(result.v1).toBeDefined();
        expect(result['en/v1']).toBeDefined();
        expect(result['fr/v1']).toBeDefined();
    });

    test('should adjust paths for inherited sidebars', () => {
        const result = normalizeSidebars(mockState);

        expect(result.v1['v1']).toBeDefined();
        expect(result['en/v1']['en/v1']).toBeDefined();
    });

    test('should handle missing parent sidebar gracefully', () => {
        mockState.vitepressConfig.locales['de/v1'] = {};
        delete mockState.configuration.themeConfig?.sidebar;
        const result = normalizeSidebars(mockState);

        expect(result['de/v1']).toBeUndefined();
    });
});

describe('parseSidebars', () => {
    let mockInject: MockState<any>;

    beforeEach(() => {
        xJet.restoreAllMocks();
        mockInject = xJet.mock(inject);
    });

    test('should populate sidebar for each locale', () => {
        const mockState = {
            configuration: {
                locales: {
                    root: { themeConfig: {} },
                    en: { themeConfig: {} }
                },
                themeConfig: {
                    sidebar: [{ text: 'GlobalItem', link: '/' }] as SidebarItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    root: {},
                    en: {}
                }
            },
            localesMap: { root: '', en: 'en' },
            versionsList: []
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseSidebars();

        expect(mockState.vitepressConfig.locales.root.themeConfig?.sidebar).toBeDefined();
        expect(mockState.vitepressConfig.locales.en.themeConfig?.sidebar).toBeDefined();
    });

    test('should initialize missing themeConfig for a locale', () => {
        const mockState = {
            configuration: {
                locales: {
                    de: { themeConfig: {} }
                },
                themeConfig: {
                    sidebar: [{ text: 'Docs', link: '/docs/' }] as SidebarItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    de: {}
                }
            },
            localesMap: { de: 'de' },
            versionsList: []
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseSidebars();

        expect(mockState.vitepressConfig.locales.de.themeConfig).toBeDefined();
        expect(mockState.vitepressConfig.locales.de.themeConfig?.sidebar).toBeDefined();
    });

    test('should create object sidebar from array if needed', () => {
        const mockState = {
            configuration: {
                locales: {
                    root: { themeConfig: {} }
                },
                themeConfig: {
                    sidebar: [{ text: 'Item', link: '/' }] as SidebarItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    root: {}
                }
            },
            localesMap: { root: '' },
            versionsList: []
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseSidebars();

        expect(typeof mockState.vitepressConfig.locales.root.themeConfig?.sidebar).toBe('object');
        expect(Array.isArray(mockState.vitepressConfig.locales.root.themeConfig?.sidebar)).toBe(false);
    });

    test('should apply version-specific base paths', () => {
        const mockState = {
            configuration: {
                locales: {
                    root: { themeConfig: {} }
                },
                themeConfig: {
                    sidebar: { '/': [{ text: 'Home', link: '/' }] } as SidebarObjectType
                }
            },
            vitepressConfig: {
                locales: {
                    v1: {}
                }
            },
            localesMap: { root: '' },
            versionsList: [ 'v1' ]
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseSidebars();

        const sidebar = mockState.vitepressConfig.locales.v1.themeConfig?.sidebar as SidebarObjectType;
        expect(sidebar['v1'][0].base).toBe('/v1/');
    });
});
