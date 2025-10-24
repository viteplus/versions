/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { join } from 'path/posix';
import { parseLocale } from '@components/locale.component';
import { inject } from '@symlinks/services/inject.service';

/**
 * Tests
 */

describe('parseLocale', () => {
    let mockInject: MockState<any>;

    beforeEach(() => {
        xJet.resetAllMocks();
        mockInject = xJet.mock(inject);
    });

    test('should populate root locale and version sub-locales with key-based locale map', () => {
        const mockState: any = {
            localesMap: { '/': 'root', '/de/': 'de' },
            versionsList: [ 'v1.0', 'v2.0' ],
            configuration: {
                locales: {
                    '/': { lang: 'en-US', label: 'English' },
                    '/de/': { lang: 'de-DE', label: 'Germany' }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Root locale
        expect(mockState.vitepressConfig.locales.root).toEqual({
            link: '/',
            lang: 'en-US',
            label: 'English'
        });

        // Non-root locale
        expect(mockState.vitepressConfig.locales.de).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: 'Germany'
        });

        // Root locale versions
        expect(mockState.vitepressConfig.locales['v1.0']).toEqual({
            link: '/',
            lang: 'en-US',
            label: ' '
        });
        expect(mockState.vitepressConfig.locales['v2.0']).toEqual({
            link: '/',
            lang: 'en-US',
            label: ' '
        });

        // Non-root locale versions
        expect(mockState.vitepressConfig.locales[join('/de/', 'v1.0')]).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: ' '
        });
        expect(mockState.vitepressConfig.locales[join('/de/', 'v2.0')]).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: ' '
        });
    });

    test('should populate root locale and version sub-locales with index-based locale map (root key in userLocales)', () => {
        const mockState: any = {
            localesMap: { '/': 'root', '/de/': 'de' },
            versionsList: [ 'v1.0', 'v2.0' ],
            configuration: {
                locales: {
                    root: { lang: 'en-US', label: 'English' },
                    de: { lang: 'de-DE', label: 'Germany' }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Root locale
        expect(mockState.vitepressConfig.locales.root).toEqual({
            link: '/',
            lang: 'en-US',
            label: 'English'
        });

        // Non-root locale
        expect(mockState.vitepressConfig.locales.de).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: 'Germany'
        });

        // Root locale versions
        expect(mockState.vitepressConfig.locales['v1.0']).toEqual({
            link: '/',
            lang: 'en-US',
            label: ' '
        });
        expect(mockState.vitepressConfig.locales['v2.0']).toEqual({
            link: '/',
            lang: 'en-US',
            label: ' '
        });

        // Non-root locale versions
        expect(mockState.vitepressConfig.locales[join('/de/', 'v1.0')]).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: ' '
        });
        expect(mockState.vitepressConfig.locales[join('/de/', 'v2.0')]).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: ' '
        });
    });

    test('should handle empty versionsList', () => {
        const mockState: any = {
            localesMap: { '/': 'root' },
            versionsList: [],
            configuration: {
                locales: {
                    '/': { lang: 'en-US', label: 'English' }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        expect(mockState.vitepressConfig.locales.root).toEqual({
            link: '/',
            lang: 'en-US',
            label: 'English'
        });

        // No version keys should be created
        expect(Object.keys(mockState.vitepressConfig.locales)).toEqual([ 'root' ]);
    });

    test('should sanitize themeConfig by removing nav and sidebar', () => {
        const mockState: any = {
            localesMap: { '/': 'root' },
            versionsList: [ 'v1.0' ],
            configuration: {
                locales: {
                    '/': {
                        lang: 'en-US',
                        label: 'English',
                        themeConfig: {
                            nav: [{ text: 'Home', link: '/' }],
                            sidebar: { '/guide/': [] },
                            footer: 'Copyright 2024'
                        }
                    }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Root locale should not have a nav or sidebar
        expect(mockState.vitepressConfig.locales.root.themeConfig?.nav).toBeUndefined();
        expect(mockState.vitepressConfig.locales.root.themeConfig?.sidebar).toBeUndefined();
        expect(mockState.vitepressConfig.locales.root.themeConfig?.footer).toBe('Copyright 2024');

        // Versioned locale should also not have a nav or sidebar
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig?.nav).toBeUndefined();
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig?.sidebar).toBeUndefined();
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig?.footer).toBe('Copyright 2024');
    });

    test('should handle multiple non-root locales', () => {
        const mockState: any = {
            localesMap: {
                '/': 'root',
                '/fr/': 'fr',
                '/es/': 'es',
                '/de/': 'de'
            },
            versionsList: [ 'v1.0' ],
            configuration: {
                locales: {
                    '/': { lang: 'en-US', label: 'English' },
                    '/fr/': { lang: 'fr-CA', label: 'Français' },
                    '/es/': { lang: 'es-MX', label: 'Español' },
                    '/de/': { lang: 'de-DE', label: 'Deutsch' }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Check all base locales
        expect(mockState.vitepressConfig.locales.root.lang).toBe('en-US');
        expect(mockState.vitepressConfig.locales.fr.lang).toBe('fr-CA');
        expect(mockState.vitepressConfig.locales.es.lang).toBe('es-MX');
        expect(mockState.vitepressConfig.locales.de.lang).toBe('de-DE');

        // Check all versioned locales
        expect(mockState.vitepressConfig.locales['v1.0'].lang).toBe('en-US');
        expect(mockState.vitepressConfig.locales[join('/fr/', 'v1.0')].lang).toBe('fr-CA');
        expect(mockState.vitepressConfig.locales[join('/es/', 'v1.0')].lang).toBe('es-MX');
        expect(mockState.vitepressConfig.locales[join('/de/', 'v1.0')].lang).toBe('de-DE');
    });

    test('should extract language code from complex locale strings', () => {
        const mockState: any = {
            localesMap: { '/': 'root', '/zh/': 'zh' },
            versionsList: [ 'v1.0' ],
            configuration: {
                locales: {
                    '/': { lang: 'en-US', label: 'English' },
                    '/zh/': { lang: 'zh-Hans-CN', label: '简体中文' }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Chinese locale should use 'zh' in link (not 'zh-Hans-CN')
        expect(mockState.vitepressConfig.locales.zh.link).toBe('/zh/');
        expect(mockState.vitepressConfig.locales[join('/zh/', 'v1.0')].link).toBe('/zh/');
    });

    test('should handle locale without lang property', () => {
        const mockState: any = {
            localesMap: { '/': 'root' },
            versionsList: [ 'v1.0' ],
            configuration: {
                locales: {
                    '/': { label: 'English' }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Should still work with missing lang
        expect(mockState.vitepressConfig.locales.root.link).toBe('/');
        expect(mockState.vitepressConfig.locales.root.label).toBe('English');
    });

    test('should not mutate original locale configuration', () => {
        const originalThemeConfig = {
            nav: [{ text: 'Home', link: '/' }],
            sidebar: { '/guide/': [{ text: 'Intro', link: '/guide/intro' }] },
            footer: 'Copyright 2024'
        };

        const mockState: any = {
            localesMap: { '/': 'root' },
            versionsList: [ 'v1.0' ],
            configuration: {
                locales: {
                    '/': {
                        lang: 'en-US',
                        label: 'English',
                        themeConfig: originalThemeConfig
                    }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // The original configuration should remain unchanged
        expect(mockState.configuration.locales['/'].themeConfig.nav).toEqual([{ text: 'Home', link: '/' }]);
        expect(mockState.configuration.locales['/'].themeConfig.sidebar).toEqual({
            '/guide/': [{ text: 'Intro', link: '/guide/intro' }]
        });
        expect(mockState.configuration.locales['/'].themeConfig.footer).toBe('Copyright 2024');

        // Processed locale should have nav and sidebar removed
        expect(mockState.vitepressConfig.locales.root.themeConfig?.nav).toBeUndefined();
        expect(mockState.vitepressConfig.locales.root.themeConfig?.sidebar).toBeUndefined();
        expect(mockState.vitepressConfig.locales.root.themeConfig?.footer).toBe('Copyright 2024');
    });

    test('should create independent copies for each locale version', () => {
        const mockState: any = {
            localesMap: { '/': 'root' },
            versionsList: [ 'v1.0', 'v2.0' ],
            configuration: {
                locales: {
                    '/': {
                        lang: 'en-US',
                        label: 'English',
                        themeConfig: {
                            footer: 'Copyright 2024',
                            customData: { count: 0 }
                        }
                    }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Modify one locale's themeConfig
        if (mockState.vitepressConfig.locales.root.themeConfig) {
            mockState.vitepressConfig.locales.root.themeConfig.footer = 'Modified Root';
            if (mockState.vitepressConfig.locales.root.themeConfig.customData) {
                mockState.vitepressConfig.locales.root.themeConfig.customData = { count: 100 };
            }
        }

        // Other locales should remain unchanged
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig?.footer).toBe('Copyright 2024');
        expect(mockState.vitepressConfig.locales['v2.0'].themeConfig?.footer).toBe('Copyright 2024');
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig?.customData?.count).toBe(0);
        expect(mockState.vitepressConfig.locales['v2.0'].themeConfig?.customData?.count).toBe(0);

        // The original configuration should also remain unchanged
        expect(mockState.configuration.locales['/'].themeConfig.footer).toBe('Copyright 2024');
        expect(mockState.configuration.locales['/'].themeConfig.customData.count).toBe(0);
    });

    test('should preserve functions in themeConfig without cloning them', () => {
        const transformPageData = (pageData: any) => pageData;
        const customFunction = () => 'test';

        const mockState: any = {
            localesMap: { '/': 'root' },
            versionsList: [ 'v1.0' ],
            configuration: {
                locales: {
                    '/': {
                        lang: 'en-US',
                        label: 'English',
                        themeConfig: {
                            transformPageData,
                            customFunction,
                            footer: 'Copyright 2024'
                        }
                    }
                }
            },
            vitepressConfig: {
                locales: {}
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        // Functions should be preserved by reference (same function instance)
        expect(mockState.vitepressConfig.locales.root.themeConfig?.transformPageData).toBe(transformPageData);
        expect(mockState.vitepressConfig.locales.root.themeConfig?.customFunction).toBe(customFunction);
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig?.transformPageData).toBe(transformPageData);
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig?.customFunction).toBe(customFunction);

        // Functions should still work
        expect(mockState.vitepressConfig.locales.root.themeConfig?.customFunction()).toBe('test');
    });
});
