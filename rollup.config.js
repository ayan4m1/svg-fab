import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import autoExternal from 'rollup-plugin-auto-external';
import eslint from '@rollup/plugin-eslint';

export default {
  input: './src/convert.js',
  output: {
    dir: './bin/',
    format: 'esm',
    exports: 'auto'
  },
  plugins: [
    // configuration
    autoExternal(),
    // prepare
    eslint(),
    // parsers
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    // transformers
    nodeResolve({
      preferBuiltins: true
    })
  ]
};
