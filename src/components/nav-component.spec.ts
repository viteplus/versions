/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';
import type { StateModel } from '@models/state.model';
import type { NavItemType, NavObjectType, NavType } from '@interfaces/nav.interface';

/**
 * Imports
 */

import { join } from 'path/posix';
import { inject } from '@symlinks/services/inject.service';
import { populateNav, normalizeNav, normalizeNavs, parseNavs } from '@components/nav.component';
import { isNavItemWithChildren, isNavItemWithLink, replaceLinksRecursive } from '@components/nav.component';

/**
 * Tests
 */

beforeEach(() => {
    xJet.restoreAllMocks();
});

describe('isNavItemWithChildren', () => {
    test('should return true when item has items array', () => {
        const item: NavItemType = { text: 'Docs', items: [] } as any;
        expect(isNavItemWithChildren(item)).toBe(true);
    });

    test('should return false when item has no items', () => {
        const item: NavItemType = { text: 'Home', link: '/' } as any;
        expect(isNavItemWithChildren(item)).toBe(false);
    });

    test('should return false when item.items is not an array', () => {
        const item: any = { text: 'Invalid', items: {} };
        expect(isNavItemWithChildren(item)).toBe(false);
    });
});

describe('isNavItemWithLink', () => {
    test('should return true when item has a link property', () => {
        const item: NavItemType = { text: 'Home', link: '/' } as any;
        expect(isNavItemWithLink(item)).toBe(true);
    });

    test('should return false when item does not have a link property', () => {
        const item: NavItemType = { text: 'Docs', items: [] } as any;
        expect(isNavItemWithLink(item)).toBe(false);
    });

    test('should return false when link is explicitly undefined', () => {
        const item: any = { text: 'Invalid', link: undefined };
        expect(isNavItemWithLink(item)).toBe(false);
    });
});

describe('replaceLinksRecursive', () => {
    test('should prepend version to link when item is a link and skipVersioning is not set', () => {
        const item: NavItemType = { text: 'Guide', link: '/guide/' } as any;
        const result = replaceLinksRecursive('v1.0', item) as any;

        expect(result.link).toBe(join('/', 'v1.0', '/guide/'));
    });

    test('should not modify link when skipVersioning is true', () => {
        const item: NavItemType = { text: 'Guide', link: '/guide/', skipVersioning: true } as any;
        const result = replaceLinksRecursive('v1.0', item) as any;

        expect(result.link).toBe('/guide/');
    });

    test('should recursively apply versioning to children when item has nested items', () => {
        const item: NavItemType = {
            text: 'Parent',
            items: [{ text: 'Child', link: '/child/' }]
        } as any;

        const result = replaceLinksRecursive('v2.0', item) as any;
        expect(result.items[0].link).toBe(join('/', 'v2.0', '/child/'));
    });

    test('should not recurse into children when skipVersioning is true', () => {
        const item: NavItemType = {
            text: 'Parent',
            skipVersioning: true,
            items: [{ text: 'Child', link: '/child/' }]
        } as any;

        const result = replaceLinksRecursive('v3.0', item) as any;
        expect(result.items[0].link).toBe('/child/');
    });

    test('should return the same item unchanged when it is neither a link nor has children', () => {
        const item: NavItemType = { text: 'Component', component: 'MyComponent' } as any;
        const result = replaceLinksRecursive('v1.0', item);

        expect(result).toBe(item);
    });
});

describe('populateNav', () => {
    beforeEach(() => {
        xJet.mock(inject).mockReturnValue({
            versionsList: [ 'v1.0', 'v2.0' ],
            versionsConfig: {
                current: 'v1.0'
            }
        });
    });

    test('should replace links with version prefix when version is provided', () => {
        const items: NavItemType[] = [
            { text: 'Guide', link: '/guide/' } as any,
            { text: 'Docs', link: '/docs/' } as any
        ];

        const result = populateNav(items, 'v1.0') as any[];

        expect(result[0].link).toBe(join('/', 'v1.0', '/guide/'));
        expect(result[1].link).toBe(join('/', 'v1.0', '/docs/'));
    });

    test('should not prepend version when version is "root"', () => {
        const items: NavItemType[] = [ { text: 'Guide', link: '/guide/' } as any ];

        const result = populateNav(items, 'root') as any[];
        expect(result[0].link).toBe('/guide/');
    });

    test('should recursively process nested items', () => {
        const items: NavItemType[] = [
            {
                text: 'Parent',
                items: [ { text: 'Child', link: '/child/' } as any ]
            } as any
        ];

        const result = populateNav(items, 'v2.0') as any[];
        expect(result[0].items[0].link).toBe(join('/', 'v2.0', '/child/'));
    });

    test('should skip versioning for items with skipVersioning set', () => {
        const items: NavItemType[] = [ { text: 'Guide', link: '/guide/', skipVersioning: true } as any ];

        const result = populateNav(items, 'v1.0') as any[];
        expect(result[0].link).toBe('/guide/');
    });

    test('should handle mixed children with and without skipVersioning', () => {
        const items: NavItemType[] = [
            {
                text: 'Parent',
                items: [
                    { text: 'Child1', link: '/child1/' } as any,
                    { text: 'Child2', link: '/child2/', skipVersioning: true } as any
                ]
            } as any
        ];

        const result = populateNav(items, 'v3.0') as any[];
        expect(result[0].items[0].link).toBe(join('/', 'v3.0', '/child1/'));
        expect(result[0].items[1].link).toBe('/child2/');
    });
});

describe('normalizeNav', () => {
    test('should merge root array nav directly into results.root', () => {
        const results: NavObjectType = { root: [] };
        const nav: NavType = [ { text: 'Guide', link: '/guide/' } as NavItemType ];

        normalizeNav(results, nav);
        expect(results.root).toEqual([{ text: 'Guide', link: '/guide/' }]);
    });

    test('should prepend root.root items when nav is array', () => {
        const results: NavObjectType = { root: [] };
        const nav: NavType = [ { text: 'Docs', link: '/docs/' } as NavItemType ];
        const root: NavObjectType = {
            root: [ { text: 'Shared', link: '/shared/' } as NavItemType ]
        };

        normalizeNav(results, nav, '', root);
        expect(results.root).toEqual([
            { text: 'Docs', link: '/docs/' },
            { text: 'Shared', link: '/shared/' }
        ]);
    });

    test('should create new key when nav is object', () => {
        const results: NavObjectType = { root: [] };
        const nav: NavType = {
            en: [ { text: 'Home', link: '/en/' } as NavItemType ]
        };

        normalizeNav(results, nav);

        expect(results['en']).toEqual([{ text: 'Home', link: '/en/' }]);
    });

    test('should merge items into existing index if it already exists', () => {
        const results: NavObjectType = { root: [], en: [ { text: 'Intro', link: '/en/intro/' } as NavItemType ] };
        const nav: NavType = {
            en: [ { text: 'Home', link: '/en/' } as NavItemType ]
        };

        normalizeNav(results, nav);

        expect(results['en']).toEqual([
            { text: 'Intro', link: '/en/intro/' },
            { text: 'Home', link: '/en/' }
        ]);
    });

    test('should prepend root[key] if exists', () => {
        const results: NavObjectType = { root: [] };
        const nav: NavType = {
            fr: [ { text: 'Accueil', link: '/fr/' } as NavItemType ]
        };
        const root: NavObjectType = {
            fr: [ { text: 'Global FR', link: '/fr/global/' } as NavItemType ]
        };

        normalizeNav(results, nav, '', root);

        expect(results['fr']).toEqual([
            { text: 'Accueil', link: '/fr/' },
            { text: 'Global FR', link: '/fr/global/' }
        ]);
    });

    test('should prepend root.root if key not found in root', () => {
        const results: NavObjectType = { root: [] };
        const nav: NavType = {
            he: [ { text: 'בית', link: '/he/' } as NavItemType ]
        };
        const root: NavObjectType = {
            root: [ { text: 'Global', link: '/global/' } as NavItemType ]
        };

        normalizeNav(results, nav, '', root);

        expect(results['he']).toEqual([
            { text: 'בית', link: '/he/' },
            { text: 'Global', link: '/global/' }
        ]);
    });

    test('should apply prefix when joining nested keys', () => {
        const results: NavObjectType = { root: [] };
        const nav: NavType = {
            docs: [ { text: 'API', link: '/docs/api/' } as NavItemType ]
        };

        normalizeNav(results, nav, 'en');

        expect(results['en/docs']).toEqual([{ text: 'API', link: '/docs/api/' }]);
    });
});

describe('normalizeNavs', () => {
    beforeEach(() => {
        xJet.resetAllMocks();
    });

    test('should return global nav if themeConfig.nav exists and no locales', () => {
        const state = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: false
            },
            configuration: {
                locales: {},
                themeConfig: {
                    nav: [{ text: 'Home', link: '/' }] as NavItemType[]
                }
            }
        } as unknown as StateModel;

        const result = normalizeNavs(state);

        expect(result.root).toEqual([{ text: 'Home', link: '/' }]);
    });

    test('should return empty root if no navs and no locales', () => {
        const state = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: false
            },
            configuration: {
                locales: {},
                themeConfig: {}
            }
        } as unknown as StateModel;

        const result = normalizeNavs(state);

        expect(result).toEqual({ root: [] });
    });

    test('should normalize navs per locale', () => {
        const state = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: false
            },
            localesMap: {
                'fr': 'root',
                'en': 'en'
            },
            configuration: {
                locales: {
                    fr: {
                        themeConfig: {
                            nav: [{ text: 'Accueil', link: '/fr/' }] as NavItemType[]
                        }
                    },
                    en: {
                        themeConfig: {
                            nav: [{ text: 'home', link: '/en/' }] as NavItemType[]
                        }
                    }
                },
                themeConfig: {}
            }
        } as unknown as StateModel;
        const result = normalizeNavs(state);


        expect(result.root).toEqual([{ text: 'Accueil', link: '/fr/' }]);
        expect(result.en).toEqual([{ text: 'home', link: '/en/' }]);
    });

    test('should prepend global nav into each locale nav', () => {
        const state = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: false
            },
            localesMap: {
                'fr': 'root'
            },
            configuration: {
                locales: {
                    fr: {
                        themeConfig: {
                            nav: [{ text: 'Accueil', link: '/fr/' }] as NavItemType[]
                        }
                    }
                },
                themeConfig: {
                    nav: [{ text: 'Global', link: '/' }] as NavItemType[]
                }
            }
        } as unknown as StateModel;

        const result = normalizeNavs(state);

        expect(result.root).toEqual([
            { text: 'Accueil', link: '/fr/' },
            { text: 'Global', link: '/' }
        ]);
    });

    test('should not duplicate global nav into root if locales exist', () => {
        const state = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: false
            },
            localesMap: {
                'en': 'root'
            },
            configuration: {
                locales: {
                    en: {
                        themeConfig: {
                            nav: [{ text: 'Docs', link: '/en/docs/' }] as NavItemType[]
                        }
                    }
                },
                themeConfig: {
                    nav: [{ text: 'Global', link: '/' }] as NavItemType[]
                }
            }
        } as unknown as StateModel;

        const result = normalizeNavs(state);
        expect(result.root).toEqual([
            { text: 'Docs', link: '/en/docs/' },
            { text: 'Global', link: '/' }
        ]);
    });
});

describe('parseNavs', () => {
    let mockInject: MockState<unknown, Parameters<typeof inject>>;

    beforeEach(() => {
        mockInject = xJet.mock(inject);
    });

    test('should populate navs for each locale using normalizeNavs result', () => {
        const mockState = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: false
            },
            localesMap: {
                'en': 'root'
            },
            configuration: {
                locales: {
                    en: { themeConfig: {} },
                    fr: { themeConfig: {} }
                },
                themeConfig: {
                    nav: [{ text: 'Global', link: '/' }] as NavItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    en: {},
                    fr: {}
                }
            }
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);

        parseNavs();
        expect(mockState.vitepressConfig.locales.en.themeConfig?.nav).toEqual([{ text: 'Global', link: '/en/' }]);
        expect(mockState.vitepressConfig.locales.fr.themeConfig?.nav).toEqual([{ text: 'Global', link: '/fr/' }]);
    });

    test('should fallback to root nav if locale key is missing in navs', () => {
        const mockState = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: false
            },
            localesMap: {
                'en': 'root'
            },
            configuration: {
                locales: {
                    en: { themeConfig: {} }
                },
                themeConfig: {
                    nav: [{ text: 'RootOnly', link: '/' }] as NavItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    en: {}
                }
            }
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);
        parseNavs();

        expect(mockState.vitepressConfig.locales.en.themeConfig?.nav).toEqual([{ text: 'RootOnly', link: '/en/' }]);
    });

    test('should initialize missing themeConfig for a locale', () => {
        const mockState = {
            versionsList: [ 'v1.0.0' ],
            versionsConfig: {
                current: 'v1.0.0',
                versionSwitcher: {
                    text: 'some text'
                }
            },
            localesMap: {
                'de': 'root'
            },
            configuration: {
                locales: {
                    root: {}
                },
                themeConfig: {
                    nav: [{ text: 'Docs', link: '/docs/' }] as NavItemType[]
                }
            },
            vitepressConfig: {
                locales: {
                    de: {} // no themeConfig here initially
                }
            }
        } as unknown as StateModel;

        mockInject.mockReturnValue(mockState);
        parseNavs();
        expect(mockState.vitepressConfig.locales.de.themeConfig).toBeDefined();
        expect(mockState.vitepressConfig.locales.de.themeConfig?.nav).toEqual([
            { text: 'some text', items: expect.any(Array) },
            { text: 'Docs', link: '/de/docs/' }
        ]);
    });
});
