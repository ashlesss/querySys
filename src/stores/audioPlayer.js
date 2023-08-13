import { defineStore } from 'pinia'

export const useAudioPlayerStore = defineStore('audioplayer', {
  state: () => ({
    hide: false,
    playing: false, // Play status (true/false)
    currentTime: 0, // second
    duration: 0,
    source: "",
    queue: [
      // list of tracks. object format:
      /*
        hash: null, // unique identifier for the file
        title: null, // title to show in UI
        workTitle: null // workTitle to show in UI
        subtitles: null // Current playable file's subtitles list
       */
    ],
    queueIndex: 0, // which track in the queue is currently selected
    playMode: {
      id: 0,
      name: "order"
    }, // order, all repeat, repeat once, shuffle
    muted: false,
    volume: 0, // audio volume (0.0-1.0)
    currentLyric: '',
    sleepTime: null,
    sleepMode: false,
    rewindSeekTime: 5,
    forwardSeekTime: 30,
    rewindSeekMode: false,
    forwardSeekMode: false,
    currentSubtitleIndex: -1,
    haveSubtitle: false,
    userSetCurrentSubtitleIndex: -1
  }),

  getters: {
    currentPlayingFile: (state) => {
      return state.queue[state.queueIndex] || {
        hash: '',
        title: '',
        workTitle: ''
      }
    },

    GET_PLAYING(state) {
      return state.playing
    },

    GET_HIDE(state) {
      return state.hide
    },

    GET_VOLUME(state) {
      return state.volume
    },

    GET_QUEUE(state) {
      return state.queue
    },

    GET_QUEUE_SUB(state) {
      // const sortedSub = state.queue[this.queueIndex].subtitles
      //   .sort((a, b) => b.percentage - a.percentage)
      // return sortedSub
      return state.queue[this.queueIndex].subtitles
    },

  },

  actions: {
    TOGGLE_HIDE () {
      this.hide = !this.hide
    },
    PLAY () {
      this.playing = true
    },
    PAUSE () {
      this.playing = false
    },
    TOGGLE_PLAYING () {
      this.playing = !this.playing
    },

    // Play a specific file from the queue.
    SET_TRACK (index) {
      if (index >= this.queue.length || index < 0) {
        return; // Invalid index, bail.
      }

      this.playing = true
      this.queueIndex = index
    },
    NEXT_TRACK () {
      if (this.queueIndex < this.queue.length - 1) {
        // Go to next track only if it exists.
        this.playing = true
        this.queueIndex += 1
      }
    },
    PREVIOUS_TRACK () {
      if (this.queueIndex > 0) {
        // Go to previous track only if it exists.
        this.playing = true
        this.queueIndex -= 1
      }
    },

    SET_QUEUE (payload) {
      this.queue = payload.queue
      this.queueIndex = payload.index
  
      if (payload.resetPlaying) {
        this.playing = true
      }
      console.log('queueStore', this.queue);
    },
    EMPTY_QUEUE () {
      this.playing = false
      this.queue = []
      this.queueIndex = 0
      this.currentSubtitleIndex = -1
      this.haveSubtitle = false,
      this.userSetCurrentSubtitleIndex = -1
      this.currentLyric = ''
      this.currentTime = 0 // second
      this.duration = 0
    },
    ADD_TO_QUEUE (file) {
      const queue = this.queue
      queue.push(file)
      this.queue = queue.concat()
    },
    REMOVE_FROM_QUEUE (index) {
      const queue = this.queue
      queue.splice(index, 1)
  
      if (index === this.queueIndex) {
        this.playing = false
        this.queueIndex = 0
      } else if (index < this.queueIndex) {
        this.queueIndex -= 1
      } 

      this.queue = queue.concat()
    },

    SET_DURATION (second) {
      this.duration = second
    },

    SET_CURRENT_TIME (second) {
      this.currentTime = second
    },

    // Add a file after the current playing item in the queue.
    PLAY_NEXT (file) {
      // this.queue.splice(this.queueIndex + 1, 0, file)
      // console.log(file);
      this.queue = file.concat()
    },

    CHANGE_PLAY_MODE () {
      const playModes = [
        {
          id: 0,
          name: "order"
        },
        {
          id: 1,
          name: "all repeat"
        },
        {
          id: 2,
          name: "repeat once"
        },
        {
          id: 3,
          name: "shuffle"
        }
      ]
      const index = (this.playMode.id >= playModes.length - 1) ? 0 : (this.playMode.id + 1)
  
      this.playMode = playModes[index]
      console.log(this.playMode);
    },

    TOGGLE_MUTED () {
      this.muted = !this.muted
    },

    // Range 0 - 1 -> 0% - 100%
    SET_VOLUME (val) {
      if (val < 0 || val > 1) {
        return
      }
      this.volume = val
    },
    SET_REWIND_SEEK_TIME (value) {
      this.rewindSeekTime = value
    },
    SET_FORWARD_SEEK_TIME (value) {
      this.forwardSeekTime = value
    },
    SET_REWIND_SEEK_MODE (value) {
      this.rewindSeekMode = value
    },
    SET_FORWARD_SEEK_MODE (value) {
      this.forwardSeekMode = value
    },
    SET_CURRENT_LYRIC (line) {
      this.currentLyric = line
    },
    SET_SLEEP_TIMER (time) {
      this.sleepTime = time
      this.sleepMode = true
    },

    CLEAR_SLEEP_MODE () {
      this.sleepTime = null
      this.sleepMode = false
    },

    SET_CURR_SUB_INDEX(index) {
      this.currentSubtitleIndex = index
    },

    SET_HAVE_SUBTITLE(flag) {
      this.haveSubtitle = flag
    },

    SET_USER_SELECT_SUB_INDEX(index) {
      this.userSetCurrentSubtitleIndex = index
      this.currentSubtitleIndex = index
    }
  }
})
