import { defineStore } from 'pinia'

export const usePageControlStore = defineStore('pageControl', {
  state: () => ({
    pageActive: false,
    currPageStore: 1,
    loggerEnable: true
  }),

  getters: {

  },

  actions: {
    SET_CURR_PAGE_STORE(page) {
      this.currPageStore = Number(page)
      console.log('currPageStore', this.currPageStore);
    },
  }
})
