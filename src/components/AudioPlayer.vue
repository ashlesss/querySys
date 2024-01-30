<template>
    <div>
        <q-slide-transition>
            <q-card 
                square 
                v-show="currentPlayingFile.hash && !this.GET_HIDE" 
                class="fixed-bottom-right text-black audio-player q-pa-sm" 
                @mousewheel.prevent 
                @touchmove.prevent
                v-touch-swipe.mouse="evt => evt.direction === 'down' && this.TOGGLE_HIDE()"
                draggable="false"
            >

                <!--顶部小横条-->
                <div
                    class="pull-handler non-selectable"
                    @click="this.TOGGLE_HIDE()"
                />

                <!-- 音声封面 -->
                <div class="row items-center albumart q-mt-lg q-pa-sm relative-position flippable-cover-container non-selectable"
                >
                    <q-img
                        contain
                        class="rounded-borders shadow-2"
                        transition="fade"
                        :src="coverUrl"
                        :ratio="4/3"
                        @dblclick.prevent="openWorkDetail()"
                    >
                    </q-img>

                </div>

                <!-- 标题 -->
                <div class="text-center q-mb-sm column non-selectable">
                    <div
                        class="ellipsis-2-lines text-bold q-pb-xs"
                    >
                        {{ currentPlayingFile.title }}
                    </div>

                    <OverflowScroll :stop="hide" class="full-width non-selectable">
                        <span class="text-caption" style="opacity: 0.54">
                            {{ currentPlayingFile.workTitle }}
                        </span>
                    </OverflowScroll>
                </div>

                <!-- 进度条控件 -->
                <div class="row items-center q-mx-sm q-mb-sm non-selectable">
                    <AudioElement class="col-12 q-pt-xs" />
                    <div class="col-12 flex justify-between">
                        <div class="col-auto relative-position">{{ formatSeconds(currentTime) }}</div>
                        <div class="col-auto relative-position">{{ formatSeconds(duration) }}</div>
                    </div>
                </div>

                <!-- 播放按钮控件 -->
                <div class="row justify-around" style="height: 65px">
                    <q-btn flat dense class="col-auto" size="lg"   icon="skip_previous" @click="this.PREVIOUS_TRACK()" style="width: 55px" />
                    <q-btn flat dense class="col-auto" size="lg"   :icon="rewindIcon" @click="this.SET_REWIND_SEEK_MODE(true)" style="width: 55px" />
                    <q-btn flat dense class="col-auto" size="28px" :icon="playingIcon" @click="this.TOGGLE_PLAYING()" style="width: 65px" />
                    <q-btn flat dense class="col-auto" size="lg"   :icon="forwardIcon" @click="this.SET_FORWARD_SEEK_MODE(true)" style="width: 55px" />
                    <q-btn flat dense class="col-auto" size="lg"   icon="skip_next" @click="this.NEXT_TRACK()" style="width: 55px" />
                </div>

                 <!-- 音量控件 -->
                <!-- HTML5 volume in iOS is read-only -->
                <div class="row items-center q-mx-lg q-pt-sm"
                    v-show="!$q.platform.is.ios"
                >
                    <q-icon name="volume_down" size="sm" class="col-auto" />
                    <q-slider
                        :disable="$q.platform.is.ios"
                        v-model="volume"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        tooltip="none"
                        class="col"
                        style="margin-left: 0.5em; margin-right: 0.5em"
                    />
                    <q-icon name="volume_up" size="sm" class="col-auto" />
                </div>

                <!-- 底部菜单 -->
                <div class="row self-center">
                    <!-- 打开播放队列 -->
                    <q-btn
                        flat
                        dense
                        size="md"
                        class="q-ma-sm"
                        icon="queue_music"
                        @click="showCurrentPlayList = !showCurrentPlayList"
                    />

                    <q-btn
                        flat
                        dense
                        size="md"
                        class="q-ma-sm"
                        :icon="playModeIcon"
                        @click="this.CHANGE_PLAY_MODE()"
                    />

                    <!-- 启动桌面字幕 -->
                    <q-btn
                        v-show="currentLyric !== ''"
                        flat dense size="md"
                        class="q-ma-sm"
                        icon="picture_in_picture_alt"
                        :color="pipEnable ? 'primary' : 'dark'"
                        @click="togglePiP"
                    />

                    <!-- 字幕按钮 -->
                    <q-btn
                        v-show="haveSubtitle"
                        flat dense size="md"
                        class="q-ma-sm"
                        icon="subtitles"
                        @click="showSubtitleList = !showSubtitleList"
                        :color="showSubtitleList ? 'primary' : 'dark'"
                    />

                    <!-- 更多设置 -->
                    <q-btn
                        flat dense
                        size="md"
                        class="q-ma-sm"
                        color="color" 
                        icon="more_horiz"
                    >
                        <q-menu>
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
                </div>

                <!-- Place holder for iOS -->
                <div style="height: 5px" v-if="$q.platform.is.ios" />

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

        <q-dialog v-model="showSubtitleList">
            <q-card>
                <q-card-section>
                <div class="text-h6">Select subtitle</div>
                </q-card-section>

                <q-separator />

                <q-list style="max-height: 60vh" class="scroll">
                    <q-item
                        clickable
                        v-ripple
                        v-for="(subFile, index) in GET_QUEUE_SUB"
                        :key="index"
                        :active="this.currentSubtitleIndex === index "
                        active-class="text-white bg-teal"
                        class="non-selectable"
                        style="height: 48px; padding: 0px 10px;"
                        @click="onClickSubtitle(index)"
                    >
                        <q-item-section>
                            <q-item-label lines="1">{{ subFile.title }}</q-item-label>
                            <q-item-label caption lines="1">Same possibilities: {{ subFile.percentage }}</q-item-label>
                        </q-item-section>
                    </q-item>
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
// import PiPSubtitle from './PiPSubtitle.vue'
import OverflowScroll from './OverflowScroll.vue'
import { ref } from 'vue'

export default {
    name: 'AudioPlayer',

    components: {
        AudioElement,
        draggable,
        // PiPSubtitle,
        OverflowScroll
    },

    data() {
        return {
            showCurrentPlayList: false,
            editCurrentPlayList: false,
            queueCopy: [],
            hideSeekButton: false,
            swapSeekButton: false,
            showSubtitleList: false,
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
            'hide',
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
            'GET_QUEUE_SUB',
            'currentSubtitleIndex',
            'haveSubtitle',
            'currentLyric',
            'pipEnable',
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
            'SET_QUEUE',
            'SET_USER_SELECT_SUB_INDEX',
            'SET_PIP_ENABLE',
            'PAUSE',
            'PLAY',
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
            return hash ? `/api/static/img/${hash.split('/')[0]}_img_main.jpg` : ''
        },

        onClickSubtitle(index) {
            this.SET_USER_SELECT_SUB_INDEX(index)
        },

        togglePiP() {
            if (this.pipEnable) {
                this.SET_PIP_ENABLE(false)
            }
            else {
                this.SET_PIP_ENABLE(true)
            }
        },
    },
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
        width: 330px;
        margin: 0px 10px 10px 0px;
        }
        // 宽度 < $breakpoint-xs-max (599px)
        @media (max-width: $breakpoint-xs-max) {
        width: 100%;
        height: 100%;
        }
    }

    .albumart {
        // 宽度 < $breakpoint-xs-max (599px)
        @media (max-width: $breakpoint-xs-max) {
            width: 100%;
        }

        /* 播放控件中，封面占据几乎所有剩余空间，将其他控件挤到底部去 */
        flex-grow: 1;
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

    .pull-handler:hover {
        transition: 0.3s;
        background: rgba(150, 122, 116, 0.8);
    }

     // 增大可点击范围
    .pull-handler:before {
        content: "";
        position: absolute;
        left: -50px;
        right: -50px;
        top: -10px;
        bottom: -10px;
        cursor: pointer;
    }

    .title {
        color: black !important
    }
</style>