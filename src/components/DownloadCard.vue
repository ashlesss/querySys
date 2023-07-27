<template>
    <div class="q-pa-md q-gutter-sm">

        <q-dialog v-model="seamless" seamless position="bottom">
        <q-card style="width: 450px" v-show="!isHideDownloadPageStore">
            <q-linear-progress :value="progressValStore" color="pink" />

            <q-card-section class="no-wrap">
                <q-item>
                    <q-item-section>
                        <div class="text-h6">
                            <div class="text-h6" v-show="isCalculatingSizeStore">
                                Calculating Size 
                            </div>

                            <div class="text-h6" v-show="!isCompletedStore && !isCalculatingSizeStore">
                                Downloading
                            </div>

                            <div class="text-h6" v-show="isCompletedStore && !isCalculatingSizeStore">
                                Finished
                            </div>
                        </div>
                    </q-item-section>
                    
                    <q-item-section>
                        <div class="row justify-end">
                            <q-btn flat round color="primary" icon="close_fullscreen" @click="hideDownloadPage" />
                            <q-btn v-show="isCompletedStore" flat round color="pink" icon="close" @click="close" />
                        </div>
                    </q-item-section>
                </q-item>
            </q-card-section>

            <q-separator />
            
            <q-list separator style="max-height: 50vh" class="scroll">
                <q-item v-for="(file, index) in fileListStore" :key="index">
                    <q-item-section>
                        <q-item-label lines="2">
                            {{ file.title }}
                        </q-item-label>

                        <q-item-label v-if="fileSizeListStore[index]" caption lines="1">
                            <span v-show="realTimeSizeDoneStore[index]">{{ realTimeSizeDoneStore[index] }} / </span>
                            {{ fileSizeListStore[index] }} 
                        </q-item-label>
                    </q-item-section>

                    <q-item-section avatar v-if="doneListStore[index] ==='done'">
                        <q-icon color="green" name="done" />
                    </q-item-section>
                </q-item>
            </q-list>
            
        </q-card>
        </q-dialog>
    </div>
</template>
<script>
import { mapState, mapActions } from 'pinia'
import { useDownloadCardStore } from '../stores/downloadCard'

export default {
    name: 'DownloadCard',

    watch: {
        fileListStore() {
            // console.log('fileListStore', this.fileListStore);
            this.TOGGLE_DOWNLOAD()
        },

        seamlessStore() {
            if (this.seamlessStore) {
                // console.log(this.seamless);
                return this.seamless = true
                
            }
            else {
                // console.log(this.seamless);
                return this.seamless = false
            }
        }
    },

    computed: {
        ...mapState(useDownloadCardStore, [
            'seamlessStore',
            'fileListStore',
            'doneListStore',
            'fileSizeListStore',
            'progressValStore',
            'isCompletedStore',
            'isHideDownloadPageStore',
            'isCalculatingSizeStore',
            'realTimeSizeDoneStore'
        ])
    },

    data() {
        return {
            seamless: false
        }
    },

    methods: {
        ...mapActions(useDownloadCardStore, [
            'SHOW_DOWNLOAD_CARD',
            'TOGGLE_DOWNLOAD',
            'CLOSE_DOWNLOAD_CARD'
        ]),

        hideDownloadPage() {
            // this.seamless = !this.seamless
            this.SHOW_DOWNLOAD_CARD()
            // return this.seamless = this.seamlessStore
        },

        close() {
            this.CLOSE_DOWNLOAD_CARD()
        }
    }
}
</script>