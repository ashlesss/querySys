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
                            :active="currentPlayingFileIndex === index"
                            active-class="text-white bg-teal"
                            class="non-selectable"
                            style="height: 48px; padding: 0px 10px;"
                            @click="onClickTrack(index)"
                        >
                            <q-item-section side v-show="editCurrentPlayList">
                                <q-icon name="clear" 
                                    :color="currentPlayingFileIndex === index ? 'white' : 'red'" 
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
                                <q-icon name="reorder" :color="currentPlayingFileIndex === index ? 'white' : 'dark'" />
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
import { useVideoPlayerStore } from '../stores/videoPlayer'

export default {
    
    components: {
        draggable
    },

    mounted() {
        this.queueCopy = this.videoQueue
        // console.log(this.videoQueue);
    },

    data() {
        return {
            editCurrentPlayList: false,
            queueCopy: this.videoQueue
        }
    },

    watch: {
        videoQueue(val) {
            this.queueCopy = val
        }
    },

    computed: {
        ...mapState(useVideoPlayerStore, [
            'videoQueue',
            'currentPlayingFileIndex'
        ]),
    },

    methods: {
        ...mapActions(useVideoPlayerStore, [
            'SET_VIDEO_TRACK',
            'EMPTY_VIDEO_QUEUE',
            'REMOVE_FROM_VIDEO_QUEUE',
            'SET_VIDEO_QUEUE'
        ]),

        emptyQueue () {
            this.EMPTY_VIDEO_QUEUE()
        },

        onClickTrack (index) {
            if (!this.editCurrentPlayList) {
                this.SET_VIDEO_TRACK(index)
                this.showCurrentPlayList = false
            }
        },

        removeFromQueue (index) {
            this.REMOVE_FROM_VIDEO_QUEUE(index)
        },

        samCoverUrl (hash) {
            return hash ? `/api/static/img/${hash.split('/')[0]}_img_main.jpg` : ''
        },

        onMoved(moved) {
            let index = null
            if (moved.oldIndex === this.currentPlayingFileIndex) {
                index = moved.newIndex
            } else if (moved.oldIndex < this.currentPlayingFileIndex && moved.newIndex >= this.currentPlayingFileIndex) {
                index = this.currentPlayingFileIndex - 1
            } else if (moved.oldIndex > this.currentPlayingFileIndex && moved.newIndex <= this.currentPlayingFileIndex) {
                index = this.currentPlayingFileIndex + 1
            } else {
                index = this.currentPlayingFileIndex
            }
        
            this.SET_VIDEO_QUEUE({
                queue: this.queueCopy.concat(),
                index: index,
                resetPlaying: false
            })
        },
    }
}
</script>
<style lang="scss" scoped>
    
</style>