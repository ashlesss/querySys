<template>
    <div>
        <vue-plyr ref="plyr" 
            @canplay="onCanPlay()"
            @timeupdate="timeUpdate()"
            @ended="onEnded()"
        >
            <audio controls crossorigin>
                <source
                    v-if="source"
                    :src="source"
                />
            </audio>
        </vue-plyr>
    </div>
</template>
<script>
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'

export default {
    name: 'AudioElement',

    computed: {
        ...mapState(useAudioPlayerStore, [
            'currentPlayingFile',
            'GET_PLAYING',
            'queue',
            'playing',
            'rewindSeekMode',
            'rewindSeekTime',
            'forwardSeekMode',
            'forwardSeekTime',
            'playMode',
            'queueIndex',
            'volume'
        ]),

        player() {
            return this.$refs.plyr.player
        },

        source() {
            if (this.currentPlayingFile.mediaStreamUrl) {
                const token = this.$q.localStorage.getItem('jwt-token') ? `?token=${this.$q.localStorage.getItem('jwt-token')}` : ''
                return `${this.currentPlayingFile.mediaStreamUrl}${token}`
            } else if (this.currentPlayingFile.hash) {
                // Fallback to be compatible with old backend
                const token = this.$q.localStorage.getItem('jwt-token') ? `?token=${this.$q.localStorage.getItem('jwt-token')}` : ''
                return `/api/media/stream/${this.currentPlayingFile.hash}${token}`
            } else {
                return ""
            }
        }
    },

    watch: {
        playing(flag) {
            if (this.player.duration) {
                // Preload to playable status
                flag ? this.player.play() : this.player.pause()
            }
        },

        source(url) {
            if (url) {
                this.player.media.load();
            }
        },

        muted (flag) {
            // Toggle to muted 
            this.player.muted = flag
        },

        volume (val) {
            // Ignore invalid volume value
            if (val < 0 || val > 1) {
                return
            }
            
            // Adjust volume
            this.player.volume = val
        },

        rewindSeekMode(rewind) {
            if (rewind) {
                this.player.rewind(this.rewindSeekTime);
                this.SET_REWIND_SEEK_MODE(false);
            }
        },

        forwardSeekMode(forward) {
            if (forward) {
                this.player.forward(this.forwardSeekTime);
                this.SET_FORWARD_SEEK_MODE(false);
            }
        }
    },

    methods: {
        ...mapActions(useAudioPlayerStore, [
            'SET_DURATION',
            'SET_REWIND_SEEK_MODE',
            'SET_FORWARD_SEEK_MODE',
            'PLAY',
            'PAUSE',
            'SET_TRACK',
            'SET_CURRENT_TIME',
            'SET_VOLUME'
        ]),
        
        onCanPlay() {
            this.SET_DURATION(this.player.duration)

            if (this.GET_PLAYING && this.player.currentTime !== this.player.duration) {
            this.player.play()
            } 
        },

        timeUpdate() {
            // console.log(this.player.currentTime)
            this.SET_CURRENT_TIME(this.player.currentTime)
            // if (this.sleepMode && this.sleepTime) {
            //     const currentTime = new Date()
            //     const currentHourStr = currentTime.getHours().toString().padStart(2, '0')
            //     const currentMinuteStr = currentTime.getMinutes().toString().padStart(2, '0')
            //     const sleepHourStr = this.sleepTime.match(/\d+/g)[0]
            //     const sleepMinuteStr = this.sleepTime.match(/\d+/g)[1]
            //     if (currentHourStr === sleepHourStr && currentMinuteStr === sleepMinuteStr) {
            //     this.PAUSE()
            //     this.CLEAR_SLEEP_MODE()
            //     // Persist sleep mode settings
            //     this.$q.sessionStorage.set('sleepTime', null)
            //     this.$q.sessionStorage.set('sleepMode', false)
            //     }
            // }
        },

        onEnded() {
            // Trigger whtn media stop playing
            switch (this.playMode.name) {
                case "all repeat":
                // Repeat all
                if (this.queueIndex === this.queue.length - 1) {
                    this.SET_TRACK(0)
                } else {
                    this.NEXT_TRACK()
                }
                break
                case "repeat once":
                // Repeat one
                this.player.currentTime = 0
                this.player.play()
                this.PLAY()
                break
                case "shuffle": {
                // Shuffle
                const index = Math.floor(Math.random()*this.queue.length)
                this.SET_TRACK(index)
                if (index === this.queueIndex) {
                    this.player.currentTime = 0
                }
                break
                }
                default:
                // Repeat
                if (this.queueIndex === this.queue.length - 1) {
                    this.PAUSE()
                } else {
                    this.NEXT_TRACK()
                }
            }
        },

        // onSeeked() {
        //     if (this.lrcAvailable) {
        //         this.lrcObj.play(this.player.currentTime * 1000);
        //         if (!this.playing) {
        //         this.lrcObj.pause();
        //         }
        //     }
        // },
    },

    mounted() {
        if (localStorage.volume) {
            this.SET_VOLUME(this.player.volume = localStorage.volume);
        }
        else {
            this.SET_VOLUME(this.player.volume = 0.5);
        }
    }
}
</script>