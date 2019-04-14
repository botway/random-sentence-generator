// import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

export default [
    {
        context: 'window',
        input: 'random-sentence-generator.js',
        output: [
            {
                file: 'dist/random-sentence-generator.iife.js', // All in one file
                format: 'iife'
            },
            {
                file: 'dist/random-sentence-generator.esm.js', // All in one file
                format: 'esm'
            }
        ],
        plugins: [
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
            builtins()
        ]
    }

]
