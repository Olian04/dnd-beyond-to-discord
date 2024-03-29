import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

const typescriptPlugins = () => [
  typescript(),
  nodeResolve(),
  commonjs(),
  /*
  terser({
    format: {
      comments: false,
    }
  }),
  */
];

export default [
  {
    input: './src/options.ts',
    output: {
      file: './public/js/options.js',
      format: 'iife',
      name: "options"
    },
    plugins: typescriptPlugins(),
  },
  {
    input: './src/popup.ts',
    output: {
      file: './public/js/popup.js',
      format: 'iife',
      name: "popup"
    },
    plugins: typescriptPlugins(),
  },
  {
    input: './src/content.ts',
    output: {
      file: './public/js/content.js',
      format: 'iife',
      name: "content"
    },
    plugins: typescriptPlugins(),
  },
  {
    input: './src/viewLogs.ts',
    output: {
      file: './public/js/viewLogs.js',
      format: 'iife',
      name: "viewLogs"
    },
    plugins: typescriptPlugins(),
  }
];