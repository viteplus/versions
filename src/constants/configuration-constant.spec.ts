/**
 * Imports
 */

import { realpathSync } from 'fs';
import { rewritesHook } from '@components/rewrites.component';
import { defaultConfiguration, scriptFileSystem } from '@constants/configuration.constant';

/**
 * Tests
 */

describe('defaultConfiguration', () => {
    test('should define empty locales and rewrites', () => {
        expect(defaultConfiguration.locales).toEqual({});
        expect(defaultConfiguration.rewrites).toEqual({});
    });

    test('should define versionsConfig with correct defaults', () => {
        expect(defaultConfiguration.versionsConfig.current).toBe('latest');
        expect(defaultConfiguration.versionsConfig.sources).toBe('src');
        expect(defaultConfiguration.versionsConfig.archive).toBe('archive');
    });

    test('should use rewritesHook as the default hook', () => {
        expect(defaultConfiguration.versionsConfig.hooks.rewritesHook).toBe(rewritesHook);
    });

    test('should configure versionSwitcher with expected defaults', () => {
        expect(defaultConfiguration.versionsConfig.versionSwitcher).toEqual({
            text: 'Switch Version',
            includeCurrentVersion: true
        });
    });

    test('should hand the Vue SFC compiler the Node file system', () => {
        expect(defaultConfiguration.vue?.script?.fs).toBe(scriptFileSystem);
    });

    test('should resolve vue and vitepress from the site', () => {
        expect(defaultConfiguration.vite?.resolve?.dedupe).toEqual([ 'vue', 'vitepress' ]);
    });
});

describe('scriptFileSystem', () => {
    test('should report whether a file exists', () => {
        expect(scriptFileSystem.fileExists(__filename)).toBe(true);
        expect(scriptFileSystem.fileExists(`${ __filename }.missing`)).toBe(false);
    });

    test('should read a file as UTF-8 text', () => {
        expect(scriptFileSystem.readFile(__filename)).toContain('scriptFileSystem');
    });

    test('should resolve the real path of a file', () => {
        expect(scriptFileSystem.realpath(__filename)).toBe(realpathSync(__filename));
    });
});
