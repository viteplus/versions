/**
 * Import will remove at compile time
 */

import type { xJetConfig } from '@remotex-labs/xjet';

/**
 * Config
 */

export default {
    parallel: 5,
    logLevel: 'Debug',
    build: {
        platform: 'node'
    }
} as xJetConfig;
