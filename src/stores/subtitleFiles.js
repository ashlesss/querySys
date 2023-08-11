import { defineStore } from 'pinia'

export const useSubtitleFiles = defineStore('subtitleFiles', {
  state: () => ({
    subtitleFiles: []
  }),

  getters: {

  },

  actions: {
    SAVE_SUB_FILES(files) {
      this.subtitleFiles = files
      // console.log(this.subtitleFiles);
    },

    CLEAR_SUB_FILES() {
      this.subtitleFiles = []
    }
  }
})
