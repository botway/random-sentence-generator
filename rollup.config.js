// import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

const plugins = [
    resolve({
        module: true
    }),
    globals(),
    builtins()
]

const babelConfig = {
    exclude: 'node_modules/**'
}
const terserConfig = {}

export default [
    {
        context: 'window',
        input: 'random-sentence-generator.js',
        output: [
            {
                dir: 'dist/es5',
                format: 'umd',
                name: 'RandomSentenceGenerator'
            }
        ],
        plugins: plugins.concat([babel(babelConfig)])
    },
    {
        context: 'window',
        input: 'random-sentence-generator.js',
        output: [
            {
                dir: 'dist/cjs',
                format: 'cjs',
                name: 'RandomSentenceGenerator'
            }
        ],
        plugins: plugins.concat([babel(babelConfig)])
    },
    {
        context: 'window',
        input: 'random-sentence-generator.js',
        output: [
            {
                dir: 'dist/es6',
                format: 'es'
            }
        ],
        plugins: plugins.concat([terser(terserConfig)])
    }
]
