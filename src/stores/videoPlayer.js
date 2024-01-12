import { defineStore } from 'pinia'

export const useVideoPlayerStore = defineStore('videoplayer', {
  state: () => ({
    videoMode: 'card',
    playing: false,
    videoQueue: [],
    currentVideoFile: {},
    currentPlayingFileIndex: -1,
    videoHide: false
  }),
  getters: {
    GET_VIDEO_QUEUE: (state) => {
        return state.videoQueue
    }
  },
  actions: {
    SET_VIDEO_MODE(flag) {
        this.videoMode = flag
    },

    // SET_VIDEO_QUEUE(queue) {
    //     console.log('run');
    // },

    SET_CURRENT_VIDEO_FILE(file) {
        this.currentVideoFile = file
    },

    SET_CURRENT_PLAYING_VIDEO_FILE_INDEX(index) {
        this.currentPlayingFileIndex = index
    },

    SET_VIDEO_TRACK (index) {
        if (index >= this.videoQueue.length || index < 0) {
          return; // Invalid index, bail.
        }
  
        this.playing = true
        this.currentPlayingFileIndex = index
        this.currentVideoFile = this.videoQueue[index]
    },

    SET_VIDEO_QUEUE (payload) {
        this.videoQueue = payload.queue
        this.currentPlayingFileIndex = payload.index
        this.currentVideoFile = payload.queue[payload.index]
    
        if (payload.resetPlaying) {
          this.playing = true
        }
        console.log('queueStore', this.videoQueue);
    },

    EMPTY_VIDEO_QUEUE() {
        this.playing = false
        this.videoQueue = []
        this.currentPlayingFileIndex = -1
        this.currentVideoFile = null
    },

    REMOVE_FROM_VIDEO_QUEUE (index) {
        const queue = this.videoQueue
        queue.splice(index, 1)
    
        if (index === this.currentPlayingFileIndex) {
          this.playing = false
          this.currentPlayingFileIndex = 0
        } else if (index < this.currentPlayingFileIndex) {
          this.currentPlayingFileIndex -= 1
        } 
  
        this.videoQueue = queue.concat()
    },

    TOGGLE_VIDEO_HIDE() {
      this.videoHide = !this.videoHide
    },

    RESET_VIDEO_STORE() {
      this.playing = false
      this.videoQueue = []
      this.currentVideoFile = {}
      this.currentPlayingFileIndex = -1
      this.videoHide = false
    }
  },
})