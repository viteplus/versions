/**
 * Import will remove at compile time
 */

import type { UserConfig } from 'vitepress';
import type { PartialConfigurationType } from '@interfaces/configuration.interface';

/**
 * Imports
 */

import { StateModel } from '@models/state.model';
import { parseNavs } from '@components/nav.component';
import { deepMerge } from '@components/object.component';
import { parseLocale } from '@components/locale.component';
import { parseSidebar } from '@components/sidebar.component';
import { forceInject } from '@symlinks/services/inject.service';
import { parseRoutesComponent } from '@components/rewrites.component';
import { defaultConfiguration } from '@constants/configuration.constant';

/**
 * Export interfaces
 */

export type * from 'vitepress';
export type * from '@interfaces/nav.interface';
export type * from '@interfaces/theme.interface';
export type * from '@interfaces/locale.interface';
export type * from '@interfaces/sidebar.interface';
export type * from '@interfaces/configuration.interface';

export function defineVersionedConfig(userConfiguration: PartialConfigurationType): UserConfig {
    const config = deepMerge(defaultConfiguration, userConfiguration);
    const state = forceInject(StateModel, config).init();

    parseNavs();
    parseLocale();
    parseSidebar();
    parseRoutesComponent();

    return <UserConfig> state.vitepressConfig;
}
