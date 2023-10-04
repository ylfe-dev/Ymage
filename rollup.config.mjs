import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { babel } from '@rollup/plugin-babel';
import scss from 'rollup-plugin-scss';

import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
        commonjs(),
        babel({
            exclude: 'node_modules/**',
            presets: ['@babel/preset-react']
        }),
        scss({ fileName: 'bundle.css' }),
        peerDepsExternal(),
        resolve(),
    ],
  }
];
