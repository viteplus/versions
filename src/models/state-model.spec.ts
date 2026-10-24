/**
 * Imports
 */

import { StateModel } from '@models/state.model';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { defaultConfiguration } from '@constants/configuration.constant';
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

    test('init should populate versionsList', () => {
        const mockReaddirSync = xJet.mock(readdirSync);
        const mockGetAllMarkdownFilesRelative = xJet.mock(getAllMarkdownFilesRelative);

        mockExistsSync.mockReturnValue(true);
        mockGetAllMarkdownFilesRelative.mockReturnValue([ 'file1.md', 'file2.md' ]);
        mockReaddirSync.mockReturnValue([
            { parentPath: '', name: 'v1.0', isDirectory: () => true },
            { parentPath: '', name: 'v2.0', isDirectory: () => true }
        ] as any);

        const state = new StateModel().init();
        expect(state.versionsList).toEqual([ 'latest', 'v1.0', 'v2.0' ]);
    });

    describe('the stable version and labels that init resolves', () => {
        const folders = [
            { parentPath: '', name: 'v1.x', isDirectory: () => true },
            { parentPath: '', name: 'v2.x', isDirectory: () => true }
        ];

        function init(versionsConfig: Record<string, unknown>): StateModel {
            const configuration: any = { ...defaultConfiguration };
            configuration.versionsConfig = { ...defaultConfiguration.versionsConfig, current: 'next', ...versionsConfig };

            return new StateModel(configuration).init();
        }

        beforeEach(() => {
            mockExistsSync.mockReturnValue(true);
            xJet.mock(readdirSync).mockReturnValue(<any> folders);
            xJet.spyOn(console, 'error').mockImplementation(() => undefined);
        });

        test('should take the current version as the stable one when latest is empty', () => {
            expect(init({}).latest).toBe('next');
        });

        test('should take an archived version as the stable one when latest names it', () => {
            expect(init({ latest: 'v2.x' }).latest).toBe('v2.x');
        });

        test('should give every version but the latest a locale entry, since the latest is served at the root', () => {
            const state = init({ latest: 'v2.x' });

            expect(Object.keys(state.vitepressConfig.locales).sort()).toEqual([ 'next', 'root', 'v1.x' ]);
        });

        test('should reject a latest that names no version', () => {
            expect(() => init({ latest: 'v3.x' })).toThrow(/Version v3.x is neither/);
        });

        test('should label every version with its configured label or its name', () => {
            const state = init({ versions: { 'v1.x': { label: 'v1.x (LTS)' } } });

            expect(state.labels).toEqual({ next: 'next', 'v1.x': 'v1.x (LTS)', 'v2.x': 'v2.x' });
        });

        test('should reject version settings for a name that is no version', () => {
            expect(() => init({ versions: { 'v1.y': { label: 'typo' } } })).toThrow(/Version v1.y is neither/);
        });
    });

    describe('the versions that carry their own path', () => {
        function init(versions: Record<string, unknown>): StateModel {
            const configuration: any = { ...defaultConfiguration };
            configuration.versionsConfig = { ...defaultConfiguration.versionsConfig, current: 'next', versions };

            return new StateModel(configuration).init();
        }

        beforeEach(() => {
            mockExistsSync.mockReturnValue(true);
            xJet.mock(readdirSync).mockReturnValue(<any> [{ parentPath: '', name: 'v1.x', isDirectory: () => true }]);
            xJet.spyOn(console, 'error').mockImplementation(() => undefined);
        });

        test('should publish the version after the archived ones from its folder', () => {
            const state = init({ 'v0.x': { path: './legacy/v0/', label: 'v0.x (EOL)' } });

            expect(state.versionsList).toEqual([ 'next', 'v1.x', 'v0.x' ]);
            expect(state.versionDirs).toEqual({ next: 'src', 'v1.x': 'archive/v1.x', 'v0.x': 'legacy/v0' });
            expect(state.labels['v0.x']).toBe('v0.x (EOL)');
        });

        test('should accept a version with its own path as the stable one', () => {
            const configuration: any = { ...defaultConfiguration };
            configuration.versionsConfig = {
                ...defaultConfiguration.versionsConfig,
                current: 'next',
                latest: 'v0.x',
                versions: { 'v0.x': { path: 'legacy/v0' } }
            };

            expect(new StateModel(configuration).init().latest).toBe('v0.x');
        });

        test.each`
            case                                         | versions                                  | message
            ${ 'the current version' }                   | ${ { next: { path: 'legacy/next' } } }     | ${ /Version next is published from both src and legacy\/next/ }
            ${ 'a name that an archive folder carries' } | ${ { 'v1.x': { path: 'legacy/v1' } } }     | ${ /Version v1.x is published from both archive\/v1.x and legacy\/v1/ }
            ${ 'a folder outside the root' }             | ${ { 'v0.x': { path: '../legacy/v0' } } }  | ${ /has to be an existing folder inside/ }
            ${ 'the root itself' }                       | ${ { 'v0.x': { path: '.' } } }             | ${ /has to be an existing folder inside/ }
        `('should reject a path on $case', ({ versions, message }: any) => {
            expect(() => init(versions)).toThrow(message);
        });

        test('should reject a folder that does not exist', () => {
            mockExistsSync.mockImplementation((path: any) => !String(path).endsWith('missing'));

            expect(() => init({ 'v0.x': { path: 'missing' } })).toThrow(/has to be an existing folder inside/);
        });
    });

    test('init should reject an archive folder that has the name of the current version', () => {
        const mockReaddirSync = xJet.mock(readdirSync);
        xJet.spyOn(console, 'error').mockImplementation(() => undefined);

        mockExistsSync.mockReturnValue(true);
        mockReaddirSync.mockReturnValue([{ parentPath: '', name: 'latest', isDirectory: () => true }] as any);

        expect(() => new StateModel().init()).toThrow(/Version latest is published from both src and archive\/latest/);
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
});
