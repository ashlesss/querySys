<template>
    <div class="q-pl-lg q-pr-lg">
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
    </div>
    
</template>
<script>
import draggable from 'vuedraggable'
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'

export default {
    
    components: {
        draggable
    },

    props: {
        queue: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            editCurrentPlayList: false,
            queueCopy: []
        }
    },

    watch: {
        queue(val) {
            this.queueCopy = val.videoQueue
        }
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
    },

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
            'PLAY'
        ]),

        emptyQueue () {
            this.EMPTY_QUEUE()
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
    }
}
</script>
<style lang="scss" scoped>
    
</style>