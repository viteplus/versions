/**
 * Imports
 */

import { StateModel } from '@models/state.model';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { getAllMarkdownFilesRelative } from '@components/object.component';

/**
 * Tests
 */

describe('StateModel', () => {
    const mockMkdirSync = xJet.mock(mkdirSync);
    const mockExistsSync = xJet.mock(existsSync);
    const mockWriteFileSync = xJet.mock(writeFileSync);

    mockMkdirSync.mockImplementation(<any> (() => {}));
    mockWriteFileSync.mockImplementation(<any> (() => {}));

    beforeEach(() => {
        xJet.resetAllMocks();
    });

    test('should throw if sourcesPath does not exist', () => {
        mockExistsSync.mockReturnValueOnce(false);
        expect(() => new StateModel()).toThrow(/Source directory/);
    });

    test('should create archive directory if it does not exist', () => {
        mockExistsSync.mockReturnValueOnce(true);
        mockExistsSync.mockReturnValueOnce(false);

        new StateModel();

        expect(mockMkdirSync).toHaveBeenCalled();
        expect(mockWriteFileSync).toHaveBeenCalledWith(expect.stringContaining('.gitkeep'), '');
    });

    test('init should populate fileMap and versionsList', () => {
        const mockReaddirSync = xJet.mock(readdirSync);
        const mockGetAllMarkdownFilesRelative = xJet.mock(getAllMarkdownFilesRelative);

        mockExistsSync.mockReturnValue(true);
        mockGetAllMarkdownFilesRelative.mockReturnValue([ 'file1.md', 'file2.md' ]);
        mockReaddirSync.mockReturnValue([
            { parentPath: '', name: 'v1.0', isDirectory: () => true },
            { parentPath: '', name: 'v2.0', isDirectory: () => true }
        ] as any);

        const state = new StateModel().init();

        expect(state.fileMap['']).toEqual([ 'file1.md', 'file2.md' ]);
        expect(state.fileMap['v1.0']).toEqual([ 'file1.md', 'file2.md' ]);
        expect(state.fileMap['v2.0']).toEqual([ 'file1.md', 'file2.md' ]);
        expect(state.versionsList).toEqual([ 'v1.0', 'v2.0' ]);
    });

    test('vitepressConfig should include non-excluded properties from configuration', () => {
        mockExistsSync.mockReturnValue(true);
        const customConfig = {
            customKey: 'customValue',
            versionsConfig: {
                current: 'latest',
                sources: 'src',
                archive: 'archive',
                hooks: {
                    rewritesHook: () => ''
                },
                versionSwitcher: {
                    text: 'Switch Version',
                    includeCurrentVersion: true
                }
            }
        };

        const state = new StateModel(customConfig as any);
        expect(state.vitepressConfig).toEqual({ customKey: 'customValue' });
    });

    test('vitepressConfig should include non-excluded properties from configuration', () => {
        mockExistsSync.mockReturnValue(true);
        const customConfig = {
            customKey: 'customValue',
            versionsConfig: {
                current: 'latest',
                sources: 'src',
                archive: 'archive',
                hooks: {
                    rewritesHook: () => ''
                },
                versionSwitcher: {
                    text: 'Switch Version',
                    includeCurrentVersion: true
                }
            }
        };

        const state = new StateModel(customConfig as any);
        expect(state.vitepressConfig).toEqual({ customKey: 'customValue' });
    });

    test('getLanguageOnly should extract language code from locale string', () => {
        mockExistsSync.mockReturnValue(true);
        const state = new StateModel();

        // Test with hyphen separator
        expect((state as any).getLanguageOnly('en-US')).toBe('en');

        // Test with underscore separator
        expect((state as any).getLanguageOnly('fr_FR')).toBe('fr');

        // Test with no separator
        expect((state as any).getLanguageOnly('de')).toBe('de');

        // Test with complex locale
        expect((state as any).getLanguageOnly('zh-Hans-CN')).toBe('zh');
    });
});
