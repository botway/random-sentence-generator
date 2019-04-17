// import * as WORDLISTS from WORDLIST_URL
// Import the LitElement base class and html helper function
'use strict'
import { LitElement, html } from 'lit-element'
// import * as WORDLISTS from './deps/parts of speech word files/wordlists.js'
import * as WORDLISTS from './deps/wordlists/wordlists.js'
console.log(WORDLISTS)
// Extend the LitElement base class
class RandomSentenceGenerator extends LitElement {
    /**
     * Implement `render` to define a template for your element.
     *
     * You must provide an implementation of `render` for any element
     * that uses LitElement as a base class.
     */
    static get properties () {
        return {
            template: {
                type: String,
                attribute: 'template'
            },
            parsedString: {
                type: String
                /*,
                computed: 'parse(template)' */
            },
            fetchedWordlistCount: {
                type: Number,
                value: 0
            },
            capitalize: {
                type: Boolean
            },
            partsOfSpeechMap: {
                type: Object
            },
            templateEntropy: {
                type: Number,
                reflect: true,
                attribute: 'template-entropy'
            },
            maxWordLength: {
                type: Number,
                attribute: 'max-word-length'
            }
        }
    }

    constructor () {
        super()

        // Properties
        this.template = 'adjective noun verb adverb.'
        this.maxWordLength = 0 // disabled
        this.parsedString = ''
        this.fetchedWordlistCount = 0
        this.capitalize = true
        this.partsOfSpeechMap = {
            'noun': 'nouns',
            'adverb': 'adverbs',
            'adv': 'adverbs',
            'verb': 'verbs',
            'interjection': 'interjections',
            'adjective': 'adjectives',
            'adj': 'adjectives',
            'verbed': 'verbed'
        }
        this.partsOfSpeech = Object.keys(this.partsOfSpeechMap)
        this._wordlists = WORDLISTS
    }

    updated (changedProperties) {
        // console.log('changed properties')
        // console.log(changedProperties) // logs previous values
        let regen = false
        if (changedProperties.has('template')) {
            regen = true
        }
        if (changedProperties.has('maxWordLength')) {
            console.dir(this.maxWordLength)
            if (this.maxWordLength) {
                const wl = {...this._wordlists}
                for (const partOfSpeech in this._wordlists) {
                    console.log(this._wordlists[partOfSpeech])
                    if (Array.isArray(this._wordlists[partOfSpeech])) {
                        wl[partOfSpeech] = this._wordlists[partOfSpeech].filter(word => word.length <= this.maxWordLength)
                    }
                }
                this._wordlists = wl
            }
            regen = true
        }
        if (regen) this.generate()
        // if (changedProperties.has('templateEntropy')) {
        //     this.
        // }
    }

    _RNG (entropy) {
        if (entropy > 1074) {
            throw new Error('Javascript can not handle that much entropy!')
        }
        let randNum = 0
        const crypto = window.crypto || window.msCrypto

        if (crypto) {
            const entropy256 = Math.ceil(entropy / 8)

            let buffer = new Uint8Array(entropy256)
            crypto.getRandomValues(buffer)

            randNum = buffer.reduce((num, value) => {
                return num * value
            }, 1) / Math.pow(256, entropy256)
        } else {
            console.warn('Secure RNG not found. Using Math.random')
            randNum = Math.random()
        }
        return randNum
    }

    setRNG (fn) {
        this._RNG = fn
    }

    _captitalize (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    getWord (partOfSpeech) {
        const words = this._wordlists[this.partsOfSpeechMap[partOfSpeech]]
        const requiredEntropy = Math.log(words.length) / Math.log(2)
        const index = this._RNG(requiredEntropy) * words.length

        return {
            word: words[Math.round(index)],
            entropy: words.length
        }
    }

    generate () {
        this.parsedString = this.parse(this.template)
    }

    parse (template) {
        const split = template.split(/[\s]/g)
        let entropy = 1
        const final = split.map(word => {
            const lower = word.toLowerCase()

            this.partsOfSpeech.some(partOfSpeech => {
                const partOfSpeechIndex = lower.indexOf(partOfSpeech) // Check it exists
                const nextChar = word.charAt(partOfSpeech.length)

                if (partOfSpeechIndex === 0 && !(nextChar && (nextChar.match(/[a-zA-Z]/g) != null))) {
                    const replacement = this.getWord(partOfSpeech)
                    word = replacement.word + word.slice(partOfSpeech.length) // Append the rest of the "word" (punctuation)
                    entropy = entropy * replacement.entropy
                    return true
                }
            })
            return word
        })
        this.templateEntropy = Math.floor(Math.log(entropy) / Math.log(8))
        // console.log('parsing ' + template)
        return /* this.templateEntropy + ' - ' + */ final.join(' ')
    }

    render () {
        /**
         * `render` must return a lit-html `TemplateResult`.
         *
         * To create a `TemplateResult`, tag a JavaScript template literal
         * with the `html` helper function:
         */
        return html`
            ${this.parsedString}
        `
    }
}
// Register the new element with the browser.
customElements.define('random-sentence-generator', RandomSentenceGenerator)

export default RandomSentenceGenerator
