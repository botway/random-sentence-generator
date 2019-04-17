import { getPastTense } from '../verb-past-tense.js'

import { verbs } from './verbs.js'
export const verbed = new Proxy(verbs, {
    get: (arr, prop) => {
        // Check it's not a property
        if (!(prop in [])) {
            return getPastTense(arr[prop])
        } else {
            return arr[prop]
        }
    }
})

export { verbs }
export { nouns } from './nouns.js'
export { adverbs } from './adverbs.js'
export { interjections } from './interjections.js'
export { adjectives } from './adjectives.js'
