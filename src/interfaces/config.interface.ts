/**
 * Import will remove at compile time
 */

import type { DefaultTheme, UserConfig } from 'vitepress';

export interface SidebarItemInterface extends DefaultTheme.SidebarItem {
    skipVersioning?: boolean;
}

export interface SidebarInterface {
    [path: string]: Array<SidebarItemInterface> | { items: Array<SidebarItemInterface>; base: string };
}

export interface RewritesOptionsInterface {
    localePrefix?: string;
    rewriteProcessor?: (inputFilePath: string, version: string) => string;
    localeRewriteProcessor?: (inputFilePath: string, version: string, locale: string) => string;
};

export interface VersionThemeInterface extends DefaultTheme.Config {
    sidebar?: SidebarInterface;
    versionSwitcher: false | {
        text?: string;
        includeLatestVersion?: boolean;
    };
}

export interface SidebarOptionsInterface {
    processSidebarURLs?: boolean;
    sidebarPathResolver?: (version: string) => string;
    sidebarUrlProcessor?: (url: string, version: string) => string;
    sidebarContentProcessor?: (sidebar: DefaultTheme.SidebarMulti) => DefaultTheme.SidebarMulti
}

export interface ConfigInterface<T extends VersionThemeInterface = VersionThemeInterface> extends UserConfig<T> {
    root: string;
    versioning: {
        rewrites?: RewritesOptionsInterface | false;
        latestVersion: string | undefined;
        sidebarOptions?: SidebarOptionsInterface | false;
    }
}
