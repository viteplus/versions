/**
 * Import will remove at compile time
 */

import type { ConfigInterface, VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { defineVersionedConfig } from './index';
import { themeConfig } from '@providers/theme.provider';
import { versionRoutes } from '@components/routes.component';
import { assignMissingDeep } from '@components/object.component';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';

/**
 * Tests
 */
beforeEach(() => {
    xJet.clearAllMocks();
});

describe('defineVersionedConfig', () => {
    const mockExistsSync = xJet.mock(existsSync);
    const mockMkdirSync = xJet.mock(mkdirSync);
    const mockWriteFileSync = xJet.mock(writeFileSync);
    const mockReaddirSync = xJet.mock(readdirSync);
    const mockAssignMissingDeep = xJet.mock(assignMissingDeep);
    const mockThemeConfig = xJet.mock(themeConfig);
    const mockVersionRoutes = xJet.mock(versionRoutes);

    const baseConfig: ConfigInterface<VersionThemeInterface> = {
        root: '.',
        srcDir: 'docs',
        versioning: {},
        themeConfig: { sidebar: {} }
    } as any;

    test('creates versions folder if it does not exist', () => {
        mockExistsSync.mockReturnValue(false);
        mockReaddirSync.mockReturnValue([]);

        defineVersionedConfig(baseConfig);

        expect(mockMkdirSync).toHaveBeenCalled();
        expect(mockWriteFileSync).toHaveBeenCalledWith(
            expect.stringContaining('.gitkeep'),
            ''
        );
    });

    test('reads existing version directories', () => {
        mockExistsSync.mockReturnValue(true);
        mockReaddirSync.mockReturnValue([
            { name: '1.0.0', isDirectory: () => true },
            { name: 'README.md', isDirectory: () => false }
        ] as any);

        const result: any = defineVersionedConfig(baseConfig);

        expect(result.versioning).toBeDefined();
        expect(result.versioning).not.toBeNull();
    });

    test('merges defaultConfig into user versioning config', () => {
        mockExistsSync.mockReturnValue(true);
        mockReaddirSync.mockReturnValue([]);

        defineVersionedConfig(baseConfig);

        expect(mockAssignMissingDeep).toHaveBeenCalledWith(
            baseConfig.versioning,
            expect.any(Object)
        );
    });

    test('calls themeConfig and versionRoutes with correct arguments', () => {
        mockExistsSync.mockReturnValue(true);
        mockReaddirSync.mockReturnValue([{ name: '1.0.0', isDirectory: () => true }] as any);

        const config = { ...baseConfig };
        defineVersionedConfig(config);

        expect(mockThemeConfig).toHaveBeenCalledWith(
            config,
            [ '1.0.0' ],
            expect.any(String)
        );
        expect(mockVersionRoutes).toHaveBeenCalledWith(
            config,
            [ '1.0.0' ],
            expect.any(String)
        );
    });

    test('returns the same config object', () => {
        mockExistsSync.mockReturnValue(true);
        mockReaddirSync.mockReturnValue([]);

        const config = { ...baseConfig };
        const result = defineVersionedConfig(config);

        expect(result).toBe(config);
    });
});
