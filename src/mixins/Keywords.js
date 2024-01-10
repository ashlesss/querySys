export default {
    computed: {
        keyword: {
          get () {
            // 如果已经离开搜索页面，冻结搜索关键词
            const isLeave = this.$route.name !== 'works'
    
            if (isLeave) {
              // console.log('use saved keyword', this.$q.sessionStorage.getItem('lastKeywordBeforeLeave'))
              return this.$q.sessionStorage.getItem('searchKeyword') ?? ''
            } else {
              console.log('use query keyword', this.$route.query.keyword ?? '')
              return this.$route.query.keyword ?? ''
            }
          },
          set (val) {
            this.$router.push({
              name: 'works',
              query: {
                keyword: val ? val.trim() : undefined
              }
            }).then()
          }
        },
    },
    watch: {
        keyword(val) {
          this.$q.sessionStorage.set('searchKeyword', val)
        }
    },
    methods: {
        parseKeywords(keywords) {
            const regex = /^(\$[^$]+:[^$]+\$)|\s(\$[^$]+:[^$]+\$)/g
            let matched = keywords.match(regex)
        
            if (!matched) {
                const array = keywords.trim().split(' ')
                return {
                    accurateSearchTerms: [],
                    plainKeywords: array.join(' ')
                }
            }
        
            matched = matched.map(kw => kw.trim())
        
            const plainKeywords = matched.reduce((acc, curr) => {
                return acc.replace(curr, '')
            }, keywords)
        
            return {
                accurateSearchTerms: this.splitKeywords(matched),
                plainKeywords: plainKeywords.trim()
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