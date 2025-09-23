/**
 * Imports
 */

import { rewritesHook } from '@components/rewrites.component';
import { defaultConfiguration } from '@constants/configuration.constant';

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
});
