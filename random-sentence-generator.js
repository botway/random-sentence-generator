'use strict'

import WORDLISTS from './wordlists/wordlists.js'
// Import the LitElement base class and html helper function
import { LitElement, html } from 'lit-element'

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
            }
        }
    }

    constructor () {
        super()

        // Properties
        this.template = 'adjective noun verb adverb.'
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
            'adj': 'adjectives'
        }
        this.partsOfSpeech = Object.keys(this.partsOfSpeechMap)
    }

    updated (changedProperties) {
        console.log('changed properties')
        console.log(changedProperties) // logs previous values
        if (changedProperties.has('template')) {
            this.generate()
        }
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
        const words = WORDLISTS[this.partsOfSpeechMap[partOfSpeech]]
        const requiredEntropy = Math.log(words.length) / Math.log(2)
        const index = this._RNG(requiredEntropy) * words.length

        return words[Math.floor(index)]
    }

    generate () {
        this.parsedString = this.parse(this.template)
    }

    parse (template) {
        const split = template.split(/[\s]/g)

        const final = split.map(word => {
            const lower = word.toLowerCase()

            this.partsOfSpeech.some(partOfSpeech => {
                const partOfSpeechIndex = lower.indexOf(partOfSpeech)
                const nextChar = word.charAt(partOfSpeech.length)

                if (partOfSpeechIndex === 0 && !(nextChar && (nextChar.match(/[a-zA-Z]/g) != null))) {
                    word = this.getWord(partOfSpeech) + word.slice(partOfSpeech.length)
                    return true
                }
            })
            return word
        })
        console.log('parsing ' + template)
        return final.join(' ')
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
