import { defineStore } from 'pinia'

export const usePageControlStore = defineStore('pageControl', {
  state: () => ({
    pageActive: false,
    currPageStore: undefined,
    loggerEnable: true,
    firstRandom: true,
    firstRandomRJ: ''
  }),

  getters: {

  },

  actions: {
    SET_PAGE_CONTROL(flag) {
      this.pageActive = flag
    },
    SET_CURR_PAGE_STORE(page) {
      this.currPageStore = page
      console.log('currPageStore', this.currPageStore);
    },

    SET_FIRST_RAND(status) {
      this.firstRandom = status
    },

    SET_FIRST_RAND_RJ(rjcode) {
      this.firstRandomRJ = rjcode
    }
  }
})
