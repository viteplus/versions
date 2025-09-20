/**
 * Import will remove at compile time
 */

import type { ConfigInterface, SidebarOptionsInterface, SidebarItemInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { replaceLinksRecursive, loadSidebar, versioningSidebar } from '@components/sidebar.component';

/**
 * Tests
 */

beforeEach(() => {
    xJet.clearAllMocks();
});

describe('replaceLinksRecursive', () => {
    test('updates links recursively and skips skipVersioning items', () => {
        const sidebarOptions: SidebarOptionsInterface = {
            sidebarUrlProcessor: (link, ver) => `/${ ver }${ link }`
        };

        const sidebar: SidebarItemInterface[] = [
            { text: 'A', link: '/a' },
            { text: 'B', skipVersioning: true, link: '/b' },
            {
                text: 'C',
                items: [{ text: 'C1', link: '/c1' }]
            }
        ];

        const result = replaceLinksRecursive(sidebarOptions, '1.0.0', sidebar);

        expect(result[0].link).toBe('/1.0.0/a');
        expect(result[1].link).toBe('/b'); // unchanged
        expect(result[2].items?.[0].link).toBe('/1.0.0/c1');
    });
});

describe('loadSidebar', () => {
    const mockExistsSync = xJet.mock(existsSync);
    const mockReadFileSync = xJet.mock(readFileSync);
    const mockResolve = xJet.mock(resolve);

    const sidebarOptions: SidebarOptionsInterface = {
        sidebarPathResolver: (v) => `${ v }-sidebar.json`,
        sidebarUrlProcessor: (link, ver) => `/${ ver }${ link }`
    };

    beforeEach(() => {
        xJet.clearAllMocks();
        mockResolve.mockImplementation((...parts: string[]) => parts.join('/'));
    });

    test('returns empty array if file does not exist', () => {
        mockExistsSync.mockReturnValue(false);

        const result = loadSidebar(sidebarOptions, '1.0.0', 'root', '/root');

        expect(result).toEqual([]);
        expect(mockExistsSync).toHaveBeenCalled();
    });

    test('loads and processes single-array sidebar', () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue(
            JSON.stringify([{ text: 'Intro', link: '/intro' }])
        );

        const result = loadSidebar(sidebarOptions, '1.0.0', 'root', '/root');

        expect(Array.isArray(result)).toBe(true);
        expect((result as SidebarItemInterface[])[0].link).toBe('/1.0.0/intro');
    });

    test('loads and processes multi-sidebar object with locale prefix', () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue(
            JSON.stringify({
                '/guide/': [{ text: 'Guide', link: '/guide/intro' }]
            })
        );

        const result = loadSidebar(sidebarOptions, '2.0.0', 'en', '/root');

        expect((result as any)['/guide/'][0].link).toBe('/en/2.0.0/guide/intro');
    });
});

describe('versioningSidebar', () => {
    const mockLoadSidebar = xJet.mock(loadSidebar);

    test('returns empty object when sidebarOptions is false', () => {
        const config = {
            versioning: { sidebarOptions: false }
        } as unknown as ConfigInterface;

        const result = versioningSidebar(config, [ '1.0.0' ], [ 'root' ], '/root');

        expect(result).toEqual({});
    });

    test('builds sidebar mapping for versions and locales', () => {
        const config = {
            versioning: {
                sidebarOptions: {
                    sidebarPathResolver: (v: string) => `${ v }.json`,
                    sidebarUrlProcessor: (link: string, ver: string) => `/${ ver }${ link }`
                }
            }
        } as unknown as ConfigInterface;

        mockLoadSidebar
            .mockReturnValueOnce([{ text: 'Intro', link: '/intro' }])
            .mockReturnValueOnce({
                '/guide/': [{ text: 'Guide', link: '/guide' }]
            });

        const result = versioningSidebar(config, [ '1.0.0' ], [ 'root', 'en' ], '/root');

        expect(result['/1.0.0/']).toBeDefined();
        expect(result['/en/1.0.0/guide/']).toBeDefined();
    });
});
