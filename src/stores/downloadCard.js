import { defineStore } from 'pinia'

export const useDownloadCardStore = defineStore('downloadcard', {
  state: () => ({
    seamlessStore: false,
    fileListStore: [],
    doneListStore: [],
    fileSizeListStore: [],
    progressValStore: 0,
    isCompletedStore: false,
    isHideDownloadPageStore: false,
    isCalculatingSizeStore: true,
    realTimeSizeDoneStore: [],
    currentJobIndex: 0,
    downloadFailed: false,
    downloadSpeed: '',
  }),

  getters: {

  },

  actions: {
    SHOW_DOWNLOAD_CARD() {
      this.seamlessStore = !this.seamlessStore
    },

    TOGGLE_DOWNLOAD() {
      if (this.fileListStore.length) {
        // this.seamlessStore = true
        // console.log(this.fileListStore);
      }
    },

    RESET() {
      this.isCompletedStore = false,
      this.fileListStore = []
      this.doneListStore = []
      this.fileSizeListStore = []
      this.progressValStore = 0
      this.isCalculatingSizeStore = true
      this.realTimeSizeDoneStore = []
      this.currentJobIndex = 0
      this.downloadFailed = false,
      this.downloadSpeed = ''
    },

    PROGRESS_VALUE() {
      if (this.doneListStore.length) {
        this.progressValStore = this.doneListStore.length / this.fileListStore.length
      }
      else {
        this.progressValStore = 0
      }
    },

    GET_FILES(files) {
      this.fileListStore = this.fileListStore.concat(files)
      this.fileListStore.forEach(() => {
        this.realTimeSizeDoneStore.push(0)
      })
    },

    GET_DONE_FILES(doneFiles) {
      this.doneListStore.push(doneFiles)
      if (doneFiles === 'failed') {
        this.downloadFailed = true
        this.downloadSpeed = ''
      }
    },

    DOWNLOAD_COMPLETED() {
      this.isCompletedStore = true
    },

    CAL_FILE_SIZE(fileSizeInBytes) {
      if (fileSizeInBytes < 1024) {
          this.fileSizeListStore.push(fileSizeInBytes.toFixed(2).toString() + ' Bytes')
      } 
      // file size smaller than 1 mb
      else if (fileSizeInBytes < 1048576) {
          this.fileSizeListStore.push((fileSizeInBytes / 1024).toFixed(2).toString() + ' KB')
      }
      else if (fileSizeInBytes < 1073741824) {
          this.fileSizeListStore.push((fileSizeInBytes / 1048576).toFixed(2).toString() + ' MB')
      }
      else {
          this.fileSizeListStore.push((fileSizeInBytes / 1073741824).toFixed(2).toString() + ' GB')
      }
    },

    CLOSE_DOWNLOAD_CARD() {
      this.RESET()
      this.seamlessStore = false
    },

    SET_IS_CAL_SIZE_FALSE() {
      this.isCalculatingSizeStore = false
    },

    USER_CANCEL() {
      this.CLOSE_DOWNLOAD_CARD()
    },

    GET_REAL_TIME_SIZE(size) {
      // this.realTimeSizeStore = size
      this.realTimeSizeDoneStore[this.currentJobIndex] = size.toFixed(2)
    },

    GET_CURR_JOB_INDEX(index) {
      this.currentJobIndex = index
      // console.log('realTimeSizeStore', this.realTimeSizeDoneStore);
    },

    GET_DOWNLOAD_SPEED(speed) {
      if (speed < 1024) {
        this.downloadSpeed = `${speed.toFixed(2)} bytes/s`
        // console.log(`Download speed: ${this.downloadSpeed} bytes/s`);
      }
      else if (speed < 1048576) {
        this.downloadSpeed = `${(speed / 1024).toFixed(2)} KB/s`
        // console.log(`Download speed: ${this.downloadSpeed} KB/s`);
      }
      else if (speed < 1073741824) {
        this.downloadSpeed = `${(speed / 1048576).toFixed(2)} MB/s`
        // console.log(`Download speed: ${this.downloadSpeed} MB/s`);
      }
      else {
        this.downloadSpeed = `${(speed / 1073741824).toFixed(2)} GB/s`
        // console.log(`Download speed: ${this.downloadSpeed} GB/s`);
      }
    },

    SET_SEAMLESS(flag) {
      this.seamlessStore = flag
    }
  }
})
