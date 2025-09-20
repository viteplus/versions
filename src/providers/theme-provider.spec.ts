/**
 * Import will remove at compile time
 */

import type { ConfigInterface, VersionThemeInterface } from '@interfaces/config.interface';

/**
 * Imports
 */

import { themeConfig } from '@providers/theme.provider';
import { versioningNav } from '@components/nav.component';
import { xterm } from '@remotex-labs/xansi/xterm.component';
import { versionSwitcher } from '@components/switcher.component';
import { versioningSidebar } from '@components/sidebar.component';

/**
 * Tests
 */

beforeEach(() => {
    xJet.clearAllMocks();
});

describe('themeConfig', () => {
    const mockLogger = xJet.spyOn(console, 'error').mockReturnValue(<any> xJet.fn());
    const mockNav = xJet.mock(versioningNav);
    const mockSwitcher = xJet.mock(versionSwitcher);
    const mockSidebar = xJet.mock(versioningSidebar);
    const versions = [ '1.0.0' ];
    const rootPath = '/root';

    const baseConfig: ConfigInterface<VersionThemeInterface> = {
        versioning: { latestVersion: '1.0.0' },
        themeConfig: { sidebar: {} },
        locales: { en: { themeConfig: { sidebar: {} } } }
    } as any;

    test('applies versionSwitcher, versioningNav, and merges sidebars for each themeConfig', () => {
        mockSidebar.mockReturnValue({ '/1.0.0/': [{ text: 'doc' }] });

        const config = JSON.parse(JSON.stringify(baseConfig));
        themeConfig(config, versions, rootPath);

        // called for default + locale
        expect(mockSwitcher).toHaveBeenCalledTimes(2);
        expect(mockNav).toHaveBeenCalledTimes(2);
        expect(mockSidebar).toHaveBeenCalledTimes(2);

        // sidebar merged with versioningSidebar result
        expect(config.themeConfig.sidebar['/1.0.0/']).toBeDefined();
        expect(config.locales!.en.themeConfig.sidebar['/1.0.0/']).toBeDefined();
    });

    test('logs error if sidebar is an array', () => {
        const config = {
            ...baseConfig,
            themeConfig: { sidebar: [] as any }
        } as ConfigInterface<VersionThemeInterface>;

        themeConfig(config, versions, rootPath);

        expect(mockLogger).toHaveBeenCalledWith(
            expect.stringContaining('The sidebar cannot be an array')
        );
    });

    test('skips themeConfig objects that are undefined', () => {
        const config = {
            ...baseConfig,
            themeConfig: undefined,
            locales: { en: { themeConfig: undefined } }
        } as any;

        themeConfig(config, versions, rootPath);

        // nothing should be called if no themeConfig present
        expect(mockSwitcher).not.toHaveBeenCalled();
        expect(mockNav).not.toHaveBeenCalled();
        expect(mockSidebar).not.toHaveBeenCalled();
    });

    test('passes correct arguments to versionSwitcher and versioningNav', () => {
        const config = JSON.parse(JSON.stringify(baseConfig));
        themeConfig(config, versions, rootPath);

        const themeCfg = config.themeConfig;
        expect(mockSwitcher).toHaveBeenCalledWith(themeCfg, versions, '1.0.0');
        expect(mockNav).toHaveBeenCalledWith(themeCfg, versions, '1.0.0');
    });

    test('uses xterm.redBright formatting in error message', () => {
        const config = {
            ...baseConfig,
            themeConfig: { sidebar: [] as any }
        } as any;

        themeConfig(config, versions, rootPath);
        expect(mockLogger).toHaveBeenCalledWith(
            expect.stringContaining(xterm.redBright('[ viteplus ]'))
        );
    });
});
