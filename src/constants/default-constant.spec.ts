/**
 * Imports
 */

import { defaultConfig } from './default.constant';

/**
 * Tests
 */

describe('defaultConfig', () => {
    test('has expected top-level properties', () => {
        expect(defaultConfig).toHaveProperty('latestVersion');
        expect(defaultConfig).toHaveProperty('rewrites');
        expect(defaultConfig).toHaveProperty('sidebarOptions');

        expect(defaultConfig.latestVersion).toBeUndefined();
    });

    describe('rewrites', () => {
        test('rewriteProcessor removes "versions/" prefix', () => {
            const input = 'versions/docs/guide.md';
            const output = (<any> defaultConfig.rewrites).rewriteProcessor(input);
            expect(output).toBe('docs/guide.md');
        });

        test('localeRewriteProcessor adds locale and strips duplicates', () => {
            const input = 'versions/en/guide.md';
            const result = (<any> defaultConfig.rewrites).localeRewriteProcessor(
                input,
                '1.0.0',
                'en'
            );
            // Should prepend locale and remove 'versions/' and extra locale segment
            expect(result).toBe('en/guide.md'); // simplified: en/guide.md
            expect(result).toBe('en/guide.md');
        });
    });

    describe('sidebarOptions', () => {
        test('sidebarPathResolver returns correct JSON path', () => {
            const version = '1.0.0';
            const path = (<any> defaultConfig.sidebarOptions).sidebarPathResolver(version);
            expect(path).toBe(`.vitepress/sidebars/versioned/${ version }.json`);
        });

        test('sidebarUrlProcessor prefixes version correctly', () => {
            const url = '/guide/';
            const version = '2.0.0';
            const result = (<any> defaultConfig.sidebarOptions).sidebarUrlProcessor(url, version);
            expect(result).toBe(`/${ version }${ url }`);
        });
    });
});
