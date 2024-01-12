<template>
    
    <div>
        <q-btn 
            dense round 
            size="md" 
            color="white" 
            text-color="dark" 
            icon="keyboard_arrow_up" 
            @click="this.TOGGLE_VIDEO_HIDE()" 
            class="fixed-bottom-right text-black q-ma-sm" 
            v-show="currentVideoFile.hash && videoHide"
        />
        <q-slide-transition>
            <q-card 
                square 
                v-show="currentVideoFile.hash && !videoHide" 
                class="fixed-bottom-right text-black audio-player q-pa-sm" 
                @mousewheel.prevent 
                @touchmove.prevent
                v-touch-swipe.mouse="evt => evt.direction === 'down' && this.TOGGLE_VIDEO_HIDE()"
                draggable="false"
            >
                <div
                    class="pull-handler non-selectable"
                    @click="this.TOGGLE_VIDEO_HIDE()"
                />
                <div class="row items-center q-mt-lg q-pa-sm relative-position flippable-cover-container non-selectable">
                    <vue-plyr 
                        ref="plyr" 
                        :options="options"
                    >
                        <video crossorigin="anonymous">
                            <source
                                :src="source"
                            />
                        </video>
                    </vue-plyr>
                </div>

                <!-- 底部菜单 -->
                <div class="row self-center">
                    <q-btn
                        flat
                        dense
                        size="md"
                        class="q-ma-sm"
                        icon="queue_music"
                        @click="showCurrentPlayList = !showCurrentPlayList"
                    />
                </div>
            </q-card>
        </q-slide-transition>

        <q-dialog v-model="showCurrentPlayList">
            <PlaylistElement />
        </q-dialog>
        
    </div>
    
</template>
<script>
import { mapState, mapActions } from 'pinia'
import { useVideoPlayerStore } from '../stores/videoPlayer'
import PlaylistElement from './PlaylistElement.vue'

export default {

    // mounted() {
    //     this.SET_CURRENT_VIDEO_FILE(this.queue.currentVideoFile)
    //     this.SET_VIDEO_QUEUE(this.queue.videoQueue)
    // },

    components: {
        PlaylistElement
    },

    data() {
        return {
            localCurrentPlayingFile: this.currentVideoFile,
            options: {
                iconUrl: '/plyr.svg'
            },
            showCurrentPlayList: false
        }
    },

    mounted() {
        this.localCurrentPlayingFile = this.currentVideoFile
    },

    watch: {
        currentVideoFile(val) {
            this.localCurrentPlayingFile = val
            // console.log('currentVideoFile changed', val);
        },

        source(url) {
            if (url) {
                this.resetPlayer()
                this.player.media.load();
                console.log(url);
                // this.$router.push(
                //     `${this.$route.params.id}?hash=${this.localCurrentPlayingFile.hash.split('/')[1]}`
                // )
            }
        }
    },

    computed: {
        ...mapState(useVideoPlayerStore, [
            'videoMode',
            'videoQueue',
            'currentVideoFile',
            'currentPlayingFileIndex',
            'videoHide'
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
        ...mapActions(useVideoPlayerStore, [
            'SET_VIDEO_MODE',
            'SET_VIDEO_QUEUE',
            'SET_CURRENT_VIDEO_FILE',
            'SET_CURRENT_PLAYING_VIDEO_FILE_INDEX',
            'TOGGLE_VIDEO_HIDE'
        ]),

        resetPlayer() {
            this.player.source = null
            console.log('Player reloaded');
        },

        toggleExpand() {
            this.SET_VIDEO_MODE('videoPage')
            this.$router.push(
                `/watch/${this.currentVideoFile.hash.split('/')[0]}?hash=${this.currentVideoFile.hash.split('/')[1]}`
            )
        }
    }
}
</script>
<style lang="scss" scoped>
    .audio-player {
        overflow: hidden;

        /* flex布局，让封面占据主要空间，其余空间留给其他控件 */
        display: flex;
        flex-direction: column;

        // 宽度 > $breakpoint-sm-min
        @media (min-width: $breakpoint-sm-min) {
        width: 400px;
        margin: 0px 10px 10px 0px;
        }
        // 宽度 < $breakpoint-xs-max (599px)
        @media (max-width: $breakpoint-xs-max) {
        width: 100%;
        height: 100%;
        }
    }

    .pull-handler {
        height: 6px;
        width: 100px;
        background: rgba(150, 122, 116, 0.5);
        position: absolute;
        border-radius: 4px !important;
        //overflow: hidden;
        left: 50%;
        top: 12px;
        transform: translateX(-50%);
        transition: 0.3s;
        cursor: pointer;
    }

    .pull-handler:before {
        content: "";
        position: absolute;
        left: -50px;
        right: -50px;
        top: -10px;
        bottom: -10px;
        cursor: pointer;
    }
</style>