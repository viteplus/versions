/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { join } from 'path/posix';
import { inject } from '@symlinks/services/inject.service';
import { parseSidebar } from '@components/sidebar.component';

/**
 * Tests
 */

describe('parseSidebar', () => {
    let mockInject: MockState<unknown, Parameters<typeof inject>>;

    beforeEach(() => {
        xJet.restoreAllMocks();
        mockInject = xJet.mock(inject);
    });

    test('should parse sidebar for locales when locales are defined', () => {
        const mockState: any = {
            configuration: {
                locales: {
                    en: {
                        themeConfig: {
                            sidebar: {
                                root: [
                                    { text: 'Guide', link: '/guide' },
                                    { text: 'Skip', link: '/skip', skipVersioning: true }
                                ]
                            }
                        }
                    }
                }
            },
            vitepressConfig: {
                locales: {
                    root: {},
                    'v1.0': {}
                }
            },
            localesMap: { en: 'root' },
            versionsList: [ 'v1.0' ]
        };

        mockInject.mockReturnValue(mockState);
        parseSidebar();

        // Root sidebar
        expect(mockState.vitepressConfig.locales.root.themeConfig.sidebar).toEqual([
            { text: 'Guide', link: '/guide', base: join('/', '', '', '/', '/') },
            { text: 'Skip', link: '/skip', skipVersioning: true }
        ]);

        // Version sidebar
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig.sidebar).toEqual([
            { text: 'Guide', link: '/guide', base: join('/', 'v1.0', '', '/', '/') },
            { text: 'Skip', link: '/skip', skipVersioning: true }
        ]);
    });

    test('should parse sidebar from root themeConfig when no locales defined', () => {
        const mockState: any = {
            configuration: {
                locales: {},
                themeConfig: {
                    sidebar: {
                        root: [{ text: 'Overview', link: '/overview' }]
                    }
                }
            },
            vitepressConfig: {
                locales: { root: {}, 'v1.0': {} }
            },
            versionsList: [ 'v1.0' ]
        };

        mockInject.mockReturnValue(mockState);
        parseSidebar();

        // Root sidebar
        expect(mockState.vitepressConfig.locales.root.themeConfig.sidebar).toEqual([{ text: 'Overview', link: '/overview', base: join('/', '', '', '/', '/') }]);

        // Version sidebar
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig.sidebar).toEqual([{ text: 'Overview', link: '/overview', base: join('/', 'v1.0', '', '/', '/') }]);
    });

    test('should handle empty sidebar gracefully', () => {
        const mockState: any = {
            configuration: {
                locales: {},
                themeConfig: { sidebar: { root: [] } }
            },
            vitepressConfig: {
                locales: { root: {}, 'v1.0': {} }
            },
            versionsList: [ 'v1.0' ]
        };

        mockInject.mockReturnValue(mockState);
        parseSidebar();

        // Expect sidebar not to throw and remain empty
        expect(mockState.vitepressConfig.locales.root.themeConfig.sidebar).toBeUndefined();
        expect(mockState.vitepressConfig.locales['v1.0'].themeConfig.sidebar).toBeUndefined();
    });
});
