
module.exports = {
    'plugins': [
        '@babel/plugin-syntax-dynamic-import'
    ],
    presets: [
        [
            '@babel/env',
            {
                targets: {
                    edge: '16',
                    firefox: '60',
                    chrome: '67',
                    safari: '9.3'
                },
                useBuiltIns: 'usage',
                corejs: '2'
            }
        ]
    ]
}
