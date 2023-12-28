export default {
    methods: {
        parseKeywords(keywords) {
            const regex = /^(\$[^$]+:[^$]+\$)|\s(\$[^$]+:[^$]+\$)/g
            let matched = keywords.match(regex)
            matched = matched.map(kw => kw.trim())

            const plainKeywords = matched.reduce((acc, curr) => {
                return acc.replace(curr, '')
            }, keywords)

            return {
                accurateSearchTerms: this.splitKeywords(matched),
                plainKeywords
            }
        },

        splitKeywords(keywords) {
            return keywords.map(kw => {
                let colonIndex = kw.indexOf(':')
                return {
                    term: kw.slice(1, colonIndex),
                    keyword: kw.slice(colonIndex + 1, -1)
                }
            })
        },
    }
}