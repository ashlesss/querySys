<template>
    <div>
        <q-slide-transition>
            <q-card square v-show="currentPlayingFile.hash && !this.GET_HIDE" class="fixed-bottom-right bg-white text-black audio-player" @mousewheel.prevent @touchmove.prevent>
                <div class="bg-dark row items-center albumart">
                    <q-img contain transition="fade" :src="coverUrl" :ratio="4/3"/>
                    <q-btn dense round size="md" color="white" text-color="dark" 
                        icon="keyboard_arrow_down" @click="TOGGLE_HIDE()" class="absolute-top-left q-ma-sm" 
                    />

                    <q-btn dense round size="md" color="white" text-color="dark" icon="more_vert" class="absolute-top-right q-ma-sm">
                        <q-menu anchor="bottom right" self="top right">
                            <q-item clickable v-ripple @click="hideSeekButton = !hideSeekButton">
                                <q-item-section avatar>
                                    <q-icon :name="hideSeekButton ? 'check_box' : 'check_box_outline_blank'" />
                                </q-item-section>

                                <q-item-section>
                                    Hide Cover Buttons
                                </q-item-section>
                            </q-item>

                            <q-item clickable v-ripple @click="swapSeekButton = !swapSeekButton">
                                <q-item-section avatar>
                                    <q-icon :name="swapSeekButton ? 'check_box' : 'check_box_outline_blank'" />
                                </q-item-section>

                                <q-item-section>
                                    Change Control buttons
                                </q-item-section>
                            </q-item>

                            <q-item clickable v-ripple @click="openWorkDetail()" v-close-popup>
                                <q-item-section avatar>
                                    <q-icon name="link" />
                                </q-item-section>

                                <q-item-section>
                                    Open Work Detail
                                </q-item-section>
                            </q-item>
                        </q-menu>
                    </q-btn>

                    <div class="row absolute q-pl-md q-pr-md col-12 justify-between">
                        <q-btn v-if="!hideSeekButton" round size="lg" color="white" text-color="dark" 
                            style="opacity: 0.8" 
                            @click="swapSeekButton ? this.PREVIOUS_TRACK() : this.SET_REWIND_SEEK_MODE(true)" 
                            :icon="swapSeekButton ? 'skip_previous': rewindIcon" 
                        />
                        <q-btn v-if="!hideSeekButton" round size="lg" color="white" text-color="dark" 
                            style="opacity: 0.8" 
                            @click="swapSeekButton ? this.NEXT_TRACK() : this.SET_FORWARD_SEEK_MODE(true)" 
                            :icon="swapSeekButton ? 'skip_next' : forwardIcon" 
                        />
                    </div>
                </div>

                <!-- Player progress bar -->
                <div class="row items-center q-mx-sm q-my-sm" style="height: 40px">
                    <div class="col-auto">{{ formatSeconds(currentTime) }}</div>
                    <AudioElement class="col" />
                    <div class="col-auto">{{ formatSeconds(duration) }}</div>
                </div>

                <!-- Place holder for iOS -->
                <div style="height: 5px" v-if="$q.platform.is.ios" />

                <q-item style="height: 55px; padding: 0px 15px;" class="text-center non-selectable">
                    <q-item-section>
                        <q-item-label lines="2" class="text-bold">{{ currentPlayingFile.title }}</q-item-label>
                        <q-item-label caption lines="1">{{ currentPlayingFile.workTitle }}</q-item-label>
                    </q-item-section>
                </q-item>

                <!-- Place holder for iOS -->
                <div  style="height: 10px" v-if="$q.platform.is.ios" />

                <!-- Player control buttons -->
                <div class="row justify-around" style="height: 65px">
                    <q-btn flat dense size="md" 
                        icon="queue_music" 
                        @click="showCurrentPlayList = !showCurrentPlayList" 
                        style="width: 55px" 
                        class="col-auto" 
                    />
                    <q-btn flat dense size="lg" 
                        :icon="swapSeekButton ? rewindIcon : 'skip_previous'" 
                        @click="swapSeekButton ? this.SET_REWIND_SEEK_MODE(true) : this.PREVIOUS_TRACK()" 
                        style="width: 55px" 
                        class="col-auto" 
                    />
                    <q-btn flat dense size="28px" 
                        :icon="playingIcon" 
                        @click="this.TOGGLE_PLAYING()" 
                        style="width: 65px" 
                        class="col-auto" 
                    />
                    <q-btn flat dense size="lg" 
                        :icon="swapSeekButton ? forwardIcon : 'skip_next'" 
                        @click="swapSeekButton ? this.SET_FORWARD_SEEK_MODE(true) : this.NEXT_TRACK()" 
                        style="width: 55px" 
                        class="col-auto" 
                    />
                    <q-btn flat dense size="md" 
                        :icon="playModeIcon" 
                        @click="this.CHANGE_PLAY_MODE()" 
                        style="width: 55px" 
                        class="col-auto" 
                    />
                </div>

                <!-- Volume control -->
                <!-- HTML5 volume in iOS is read-only -->
                <div class="row items-center q-mx-lg" style="height: 50px" v-if="!$q.platform.is.ios">
                    <q-icon name="volume_down" size="sm" class="q-mr-sm col-auto" />

                    <q-slider
                        v-model="volume"
                        :min="0.0"
                        :max="1.0"
                        :step="0"
                        class="col"
                    />

                    <q-icon name="volume_up" size="sm" class="q-ml-sm col-auto" />
                </div>
            </q-card>
        </q-slide-transition>

        <!-- Current Play List -->
        <q-dialog v-model="showCurrentPlayList">
            <q-card class="current-play-list">
                <!-- Control buttons on current play list -->
                <div class="row" style="padding: 5px; height: 45px;">
                    <q-btn dense round size="md" icon="edit" color="primary" 
                        @click="editCurrentPlayList = !editCurrentPlayList" 
                        style="height: 35px; width: 35px;" class="col-auto" 
                    />
                    <q-btn dense round size="md" icon="save" color="teal" 
                        v-show="editCurrentPlayList"
                        style="height: 35px; width: 35px;" class="col-auto q-mx-sm"
                        @click="editCurrentPlayList = !editCurrentPlayList"
                    />
                    <q-space />
                    <q-btn dense round size="md" icon="delete_forever" 
                        color="red" @click="emptyQueue()" 
                        style="height: 35px; width: 35px;" class="col-auto" 
                    />
                </div>

                <q-separator />

                <q-list style="max-height: 450px" class="scroll">
                    <draggable
                        handle=".handle"
                        v-model="queueCopy"
                        @change="val => onMoved(val.moved)"
                        item-key="title"
                    >

                    <template #item="{element, index}">
                        <div>
                            <q-item
                                clickable
                                v-ripple
                                :active="queueIndex === index"
                                active-class="text-white bg-teal"
                                class="non-selectable"
                                style="height: 48px; padding: 0px 10px;"
                                @click="onClickTrack(index)"
                            >
                                <q-item-section side v-show="editCurrentPlayList">
                                    <q-icon name="clear" 
                                        :color="queueIndex === index ? 'white' : 'red'" 
                                        @click="removeFromQueue(index)" 
                                    />
                                </q-item-section>

                                <q-item-section avatar>
                                    <q-img transition="fade" 
                                        :src="samCoverUrl(element.hash)" 
                                        style="height: 38px; width: 38px" 
                                        class="rounded-borders" 
                                    />
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label lines="1">{{ element.title }}</q-item-label>
                                    <q-item-label caption lines="1">{{ element.workTitle }}</q-item-label>
                                </q-item-section>

                                <q-item-section side class="handle" v-show="editCurrentPlayList">
                                    <q-icon name="reorder" :color="queueIndex === index ? 'white' : 'dark'" />
                                </q-item-section>
                            </q-item>
                        </div>
                    </template>
                    </draggable>
                </q-list>
            </q-card>
        </q-dialog>
    </div>
</template>
<script>
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'
import AudioElement from './AudioElement.vue'
import draggable from 'vuedraggable'

export default {
    name: 'AudioPlayer',

    components: {
        AudioElement,
        draggable,
    },

    data() {
        return {
            showCurrentPlayList: false,
            editCurrentPlayList: false,
            queueCopy: [],
            hideSeekButton: false,
            swapSeekButton: false
        }
    },

    watch: {
        queue(val) {
            this.queueCopy = val.concat()
            // Close the player playlist when the last track is deleted
            if (this.queueCopy.length === 0) {
                this.showCurrentPlayList = false
            }
        },

        showCurrentPlayList (flag) {
            // Reset editCurrentPlayList status to false when current play list is closed
            if (flag === false) {
                this.editCurrentPlayList = false
            }
        },
    },

    computed: {
        ...mapState(useAudioPlayerStore, [
            'currentPlayingFile',
            'GET_HIDE',
            'NEXT_TRACK',
            'rewindSeekTime',
            'forwardSeekTime',
            'currentTime',
            'duration',
            'playing',
            'playMode',
            'GET_VOLUME',
            'GET_QUEUE',
            'queueIndex',
        ]),

        coverUrl() {
            const hash = this.currentPlayingFile.hash
            return hash ? `/api/static/img/${hash.split('/')[0]}_img_main.jpg` : ''
        },

        workDetailUrl () {
            const hash = this.currentPlayingFile.hash
            return hash ? `/work/${hash.split('/')[0]}` : ""
        },

        rewindIcon () {
            switch (this.rewindSeekTime) {
                case 5:
                return 'replay_5'
                case 10:
                return 'replay_10'
                case 30:
                return 'replay_30'
                default:
                return 'replay_5'
            }
        },

        forwardIcon () {
            switch (this.forwardSeekTime) {
                case 5:
                return 'forward_5'
                case 10:
                return 'forward_10'
                case 30:
                return 'forward_30'
                default:
                return 'forward_5'
            }
        },

        playingIcon () {
            return this.playing ? "pause" : "play_arrow"
        },

        playModeIcon () {
            switch (this.playMode.name) {
                case "all repeat":
                return "repeat"
                case "repeat once":
                return "repeat_one"
                case "shuffle":
                return "shuffle"
                default:
                return "playlist_play"
            }
        },

        volume: {
            get () {
                return Number(this.GET_VOLUME)
            },
            set (val) {
                const fixedVal = Number(val.toFixed(2))
                // this.$q.localStorage.volume = fixedVal
                this.$q.localStorage.set('volume', fixedVal)
                this.SET_VOLUME(fixedVal)
            }
        },
        
        queue: {
            get () {
                return this.GET_QUEUE
            },
            set () {}
        },
    },
    // created() {
    //     console.log(!this.GET_HIDE);
    // }

    methods: {
        ...mapActions(useAudioPlayerStore, [
            'TOGGLE_HIDE',
            'PREVIOUS_TRACK',
            'SET_REWIND_SEEK_MODE',
            'SET_FORWARD_SEEK_MODE',
            'TOGGLE_PLAYING',
            'CHANGE_PLAY_MODE',
            'SET_VOLUME',
            'EMPTY_QUEUE',
            'SET_TRACK',
            'REMOVE_FROM_QUEUE',
            'SET_QUEUE'
        ]),

        openWorkDetail () {
            if (this.workDetailUrl && this.$route.path !== this.workDetailUrl) {
                this.$router.push(this.workDetailUrl)
            }
            if (this.$q.screen.lt.sm) {
                this.TOGGLE_HIDE()
            }
        },

        formatSeconds (seconds) {
            let h = Math.floor(seconds / 3600) < 10
                ? '0' + Math.floor(seconds / 3600)
                : Math.floor(seconds / 3600)

            let m = Math.floor((seconds / 60 % 60)) < 10
                ? '0' + Math.floor((seconds / 60 % 60))
                : Math.floor((seconds / 60 % 60))

            let s = Math.floor((seconds % 60)) < 10
                ? '0' + Math.floor((seconds % 60))
                : Math.floor((seconds % 60))

            return h === "00"
                ? m + ":" + s
                : h + ":" + m + ":" + s
        },

        emptyQueue () {
            this.EMPTY_QUEUE()
        },

        onMoved(moved) {
            let index = null
            if (moved.oldIndex === this.queueIndex) {
                index = moved.newIndex
            } else if (moved.oldIndex < this.queueIndex && moved.newIndex >= this.queueIndex) {
                index = this.queueIndex - 1
            } else if (moved.oldIndex > this.queueIndex && moved.newIndex <= this.queueIndex) {
                index = this.queueIndex + 1
            } else {
                index = this.queueIndex
            }
        
            this.SET_QUEUE({
                queue: this.queueCopy.concat(),
                index: index,
                resetPlaying: false
            })
        },

        onClickTrack (index) {
            if (!this.editCurrentPlayList) {
                this.SET_TRACK(index)
                this.showCurrentPlayList = false
            }
        },

        removeFromQueue (index) {
            this.REMOVE_FROM_QUEUE(index)
        },

        samCoverUrl (hash) {
            return hash ? `/api/static/img/${hash.split('/')[0]}_img_main.jpg` : ""
        },

    },

    created() {
    }
}
</script>

<style lang="scss" scoped>
    .audio-player {
        // Width > $breakpoint-sm-min
        @media (min-width: $breakpoint-sm-min) {
            width: 330px;
            margin: 0px 10px 10px 0px;
        }
        // Width < $breakpoint-xs-max (599px)
        @media (max-width: $breakpoint-xs-max) {
            width: 100%;
            height: 100%;
        }
    }

    .albumart {
        // Width < $breakpoint-xs-max (599px)
        @media (max-width: $breakpoint-xs-max) {
            width: 100%;
            height: calc(100% - 230px);
        }
    }

    .current-play-list {
        max-height: 500px;

        // Width > $breakpoint-xs-max
        @media (min-width: $breakpoint-xs-max) {
        width: 450px;
        }
        // Width < $breakpoint-xs-max (599px)
        @media (max-width: $breakpoint-xs-max) {
        min-width: 280px;
        }
    }
</style>