// Node NOT browser
'use strict'

const fs = require('fs')
const directories = {
    'nouns': 'nouns/91k nouns.txt',
    'verbs': 'verbs/31k verbs.txt',
    'adverbs': 'adverbs/6k adverbs.txt',
    // 'interjections': '../db2/interjections.txt',
    'adjectives': 'adjectives/28k adjectives.txt'
}

Object.keys(directories).forEach(name => {
    let data = fs.readFileSync(directories[name], 'utf8').split(/[\n\r]/g).filter(word => {
        return word != ''
    })
    data = JSON.stringify(data)
    // const file = data
    // Seems dumb to store words globally when not imported
    // Access via window.WORDLISTS.nouns etc. or import * as WORDLISTS from ".."
    const file = `export const ${name} = ${data}`
    fs.writeFile(name + '.js', file, () => {})
})
