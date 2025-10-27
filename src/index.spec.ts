/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { defineVersionedConfig } from './index';
import { StateModel } from '@models/state.model';
import { parseNavs } from '@components/nav.component';
import { parseLocale } from '@components/locale.component';
import { parseSidebars } from '@components/sidebar.component';
import { forceInject } from '@symlinks/services/inject.service';
import { parseRoutesComponent } from '@components/rewrites.component';
import { defaultConfiguration } from '@constants/configuration.constant';

/**
 * Tests
 */

describe('defineVersionedConfig', () => {
    let mockForceInject: MockState<any>;
    let mockParseNavs: MockState<any>;
    let mockParseLocale: MockState<any>;
    let mockParseSidebar: MockState<any>;
    let mockParseRoutes: MockState<any>;

    beforeEach(() => {
        xJet.resetAllMocks();
        mockForceInject = xJet.mock(forceInject).mockImplementation(<any> (() => {}));
        mockParseNavs = xJet.mock(parseNavs).mockImplementation(<any> (() => {}));
        mockParseLocale = xJet.mock(parseLocale).mockImplementation(<any> (() => {}));
        mockParseSidebar = xJet.mock(parseSidebars).mockImplementation(<any> (() => {}));
        mockParseRoutes = xJet.mock(parseRoutesComponent).mockImplementation(<any> (() => {}));
    });

    test('should merge user configuration with default and return VitePress config', () => {
        const mockState: any = {
            init: xJet.fn(),
            vitepressConfig: { themeConfig: {}, locales: {} }
        };

        mockState.init.mockReturnValue(mockState);
        mockForceInject.mockReturnValue(mockState);

        const userConfig = { customKey: 'customValue' };
        const result = defineVersionedConfig(userConfig as any);

        expect(mockForceInject).toHaveBeenCalledWith(StateModel, expect.objectContaining(userConfig));
        expect(mockState.init).toHaveBeenCalled();
        expect(mockParseNavs).toHaveBeenCalled();
        expect(mockParseLocale).toHaveBeenCalled();
        expect(mockParseSidebar).toHaveBeenCalled();
        expect(mockParseRoutes).toHaveBeenCalled();

        expect(result).toBe(mockState.vitepressConfig);
    });

    test('should merge defaultConfiguration when userConfiguration is empty', () => {
        const mockState: any = {
            init: xJet.fn(),
            vitepressConfig: { themeConfig: {}, locales: {} }
        };

        mockState.init.mockReturnValue(mockState);
        mockForceInject.mockReturnValue(mockState);

        const result = defineVersionedConfig({} as any);

        expect(mockForceInject).toHaveBeenCalledWith(StateModel, expect.objectContaining(<any> defaultConfiguration));
        expect(result).toBe(mockState.vitepressConfig);
    });
});
