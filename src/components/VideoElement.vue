<template>
    <div class="q-pl-lg q-pr-lg q-pb-lg">
        <vue-plyr ref="plyr" 
        >
            <video crossorigin="anonymous">
                <source
                    :src="source"
                />
            </video>
        </vue-plyr>
    </div>
    
</template>
<script>
import { mapState, mapActions } from 'pinia'
import { useVideoPlayerStore } from '../stores/videoPlayer'

export default {

    // mounted() {
    //     this.SET_CURRENT_VIDEO_FILE(this.queue.currentVideoFile)
    //     this.SET_VIDEO_QUEUE(this.queue.videoQueue)
    // },

    data() {
        return {
            localCurrentPlayingFile: this.currentVideoFile
        }
    },

    mounted() {
        this.localCurrentPlayingFile = this.currentVideoFile
    },

    watch: {
        currentVideoFile(val) {
            this.localCurrentPlayingFile = val
        },

        source(url) {
            if (url) {
                this.resetPlayer()
                this.player.media.load();
                console.log(url);
                this.$router.push(
                    `${this.$route.params.id}?hash=${this.localCurrentPlayingFile.hash.split('/')[1]}`
                )
            }
        }
    },

    computed: {
        ...mapState(useVideoPlayerStore, [
            'videoMode',
            'videoQueue',
            'currentVideoFile',
            'currentPlayingFileIndex'
        ]),

        source() {
            if (this.localCurrentPlayingFile) {
                return this.localCurrentPlayingFile.mediaStreamUrl
            }
            else {
                return ''
            }
        },

        player() {
            return this.$refs.plyr.player
        }
    },

    methods: {
        // ...mapActions(useVideoPlayerStore, [
        //     'SET_VIDEO_MODE',
        //     'SET_VIDEO_QUEUE',
        //     'SET_CURRENT_VIDEO_FILE',
        //     'SET_CURRENT_PLAYING_VIDEO_FILE_INDEX'
        // ]),

        resetPlayer() {
            this.player.source = null
            console.log('Player reloaded');
        },
    }
}
</script>
<style>
    .plyr {
        border-radius: 10px;
        overflow: hidden; 
    }
</style>