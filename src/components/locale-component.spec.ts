/**
 * Import will remove at compile time
 */

import type { MockState } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { join } from 'path/posix';
import { parseLocale } from '@components/locale.component';
import { inject } from '@symlinks/services/inject.service';

/**
 * Tests
 */

describe('parseLocale', () => {
    let mockInject: MockState<any>;

    beforeEach(() => {
        xJet.resetAllMocks();
        mockInject = xJet.mock(inject);
    });

    test('should populate root locale lang and label and version sub-locales', () => {
        const mockState: any = {
            localesMap: { en: 'root', de: 'de' },
            versionsList: [ 'v1.0', 'v2.0' ],
            configuration: {
                locales: {
                    en: { lang: 'en-US', label: 'English' },
                    de: { lang: 'de-DE', label: 'Germany' }
                }
            },
            vitepressConfig: {
                locales: {
                    root: {},
                    de: {}
                }
            },
            getLanguageOnly(locale: string): string {
                return locale.split(/[-_]/)[0];
            }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        expect(mockState.vitepressConfig.locales.root).toEqual({
            link: '/',
            lang: 'en-US',
            label: 'English'
        });
        expect(mockState.vitepressConfig.locales.de).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: 'Germany'
        });

        // sub-locales for versions
        expect(mockState.vitepressConfig.locales['v1.0']).toEqual({
            link: '/',
            lang: 'en-US',
            label: ' '
        });
        expect(mockState.vitepressConfig.locales['v2.0']).toEqual({
            link: '/',
            lang: 'en-US',
            label: ' '
        });
        expect(mockState.vitepressConfig.locales[join('de', 'v1.0')]).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: ' '
        });
        expect(mockState.vitepressConfig.locales[join('de', 'v2.0')]).toEqual({
            link: '/de/',
            lang: 'de-DE',
            label: ' '
        });
    });

    test('should handle empty versionsList', () => {
        const mockState: any = {
            localesMap: { en: 'root' },
            versionsList: [],
            configuration: { locales: { en: { lang: 'en-US', label: 'English' } } },
            vitepressConfig: { locales: { root: {} } }
        };

        mockInject.mockReturnValue(mockState);
        parseLocale();

        expect(mockState.vitepressConfig.locales.root).toEqual({
            link: '/',
            lang: 'en-US',
            label: 'English'
        });
    });
});
