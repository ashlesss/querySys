export default {
    data() {
      return  {
        savedPage: null,
        isPageFrozen: false,
      }
    },
    computed: {
      page: {
        get() {
          if (this.isPageFrozen) {
            console.log('get page from saved page', this.savedPage)
            return this.savedPage || 1
          } else {
            console.log('get page from query', this.$route.query.page)
            return parseInt(this.$route.query.page) || 1
          }
        },
        set(page) {
          console.log('set page', page)
          this.$router.push({
            name: this.$route.name,
            query: { ...this.$route.query, page: page }
          }).then()
        }
      },
    },
    beforeRouteLeave (to, from, next) {
      console.log('beforeRouteLeave', this.page)
      this.savedPage = this.page
      console.log('page deactivated')
      this.isPageFrozen = true
      next()
    },
    // deactivated() {
    //   console.log('page deactivated')
    //   this.isPageFrozen = true
    // },
    activated() {
      console.log('page activated')
      this.isPageFrozen = false
    },
  }