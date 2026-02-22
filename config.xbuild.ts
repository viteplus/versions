/**
 * Import will remove at compile time
 */

import type { xBuildConfig } from '@remotex-labs/xbuild';

/**
 * Imports
 */

import { version } from 'process';
import pkg from './package.json' with { type: 'json' };

/**
 * Config build
 */

export const config: xBuildConfig = {
    variants: {
        index: {
            define: {
                __VERSION: pkg.version
            },
            esbuild: {
                bundle: true,
                minify: true,
                target: [ `node${ version.slice(1) }` ],
                outdir: 'dist',
                format: 'esm',
                platform: 'node',
                packages: 'external',
                keepNames: true,
                sourcemap: 'linked',
                sourceRoot: `https://github.com/viteplus/versions/tree/v${ pkg.version }/`,
                entryPoints: {
                    'index': 'src/index.ts'
                }
            }
        }
    }
};
