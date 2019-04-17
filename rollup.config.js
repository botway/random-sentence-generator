// import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import babel from 'rollup-plugin-babel'

const plugins = [
    resolve({
        module: true
    }),
    // commonjs({
    //     namedExports: {
    //         './wordlists/nouns.js': ['nouns'],
    //         './wordlists/adverbs.js': ['adverbs'],
    //         './wordlists/verbs.js': ['verbs'],
    //         './wordlists/interjections.js': ['interjections'],
    //         './wordlists/adjectives.js': ['adjectives']
    //     }
    // }),
    globals(),
    builtins(),
    // babel({
    //     exclude: 'node_modules/**'
    // })
]

export default [
    {
        context: 'window',
        input: 'random-sentence-generator.js',
        output: [
            {
                file: 'dist/random-sentence-generator.iife.js', // All in one file
                format: 'iife',
                name: 'RandomSentenceGenerator'
            },
            {
                file: 'dist/random-sentence-generator.es.js', // All in one file
                format: 'es',
                name: 'RandomSentenceGenerator'
            }
        ],
        plugins
    },
    {
        context: 'window',
        input: 'deps/parts of speech word files/wordlists.js',
        output: [
            {
                file: 'dist/deps/parts of speech word files/wordlists.iife.js', // All in one file
                format: 'iife',
                name: 'wordlists'
            },
            {
                file: 'dist/deps/parts of speech word files/wordlists.js', // All in one file
                format: 'es',
                name: 'wordlists'
            }
        ],
        plugins
    }

]
