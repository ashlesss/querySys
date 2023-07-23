<template>
    <div>
        <WorkDetailPage v-if="workInfo.work_title" :workInfo="workInfo"/>
        <div id="scrollTo"></div>
        <WorkTree @click="scrollToElement" 
            :tree="tree" 
            @path_down="pathDown" 
            @path_up="pathUp" 
            :goto="goToPath" 
            @file_list="initJobLists" 
            @job_done="jobdone"
            @file_size="getFileSize"
        />

        <div class="q-pa-md q-gutter-sm">
            <!-- <q-btn label="Click Me" color="primary" @click="seamless = true" /> -->

            <q-dialog v-model="seamless" seamless position="bottom">
            <q-card style="width: 450px" v-show="!isHideDownloadPage">
                <q-linear-progress :value="progressVal" color="pink" />

                <q-card-section class="no-wrap">
                    <q-item>
                        <q-item-section>
                            <div class="text-h6">
                                <q-card-title v-show="!isCompleted">
                                    Downloading
                                </q-card-title>
                                <q-card-title v-show="isCompleted">
                                    Finished
                                </q-card-title>
                            </div>
                        </q-item-section>
                        
                        <q-item-section>
                            <div class="row justify-end">
                                <q-btn flat round color="primary" icon="close_fullscreen" @click="hideDownloadPage" />
                            </div>
                            
                        </q-item-section>
                    </q-item>

                    <!-- <q-item>
                        <q-btn flat round color="primary" disable icon="card_giftcard" />
                    </q-item> -->
                    
                    
                    
                    
                <!-- </div> -->
                </q-card-section>

                <!-- <q-card-section>
                    <q-btn flat round color="primary" disable icon="card_giftcard" />
                </q-card-section> -->

                <q-separator />
                <q-list separator >
                    <q-item v-for="(file, index) in fileList" :key="index">
                        <q-item-section>
                            <q-item-label lines="2">
                                {{ file.title }}
                            </q-item-label>
                            <!-- <q-space /> -->
                            <q-item-label v-if="fileSizeList[index]" caption lines="1">
                                {{ fileSizeList[index] }} 
                            </q-item-label>
                        </q-item-section>
                        <!-- <q-space /> -->
                        <q-item-section avatar v-if="doneList[index] ==='done'">
                            <q-icon color="green" name="done" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
            </q-dialog>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import WorkDetailPage from '../components/WorkDetailPage.vue';
import WorkTree from '../components/WorkTree.vue'
import NotifyMixin from '../mixins/Notification.js'
import { scroll } from 'quasar'
const { getScrollTarget, setVerticalScrollPosition } = scroll

export default defineComponent({
    name: "WorkDetail",

    mixins: [NotifyMixin],

    components: {
        WorkDetailPage,
        WorkTree,
    },

    created() {
        this.requestWorkData()
    },

    data() {
        return {
            workInfo: {},
            tree: [],
            seamless: false,
            fileList: [],
            doneList: [],
            fileSizeList: [],
            progressVal: 0,
            isReset: true,
            isCompleted: false,
            isHideDownloadPage: false
        }
    },

    computed: {
        goToPath() {
            if (this.$route.query.path) {
                // console.log(JSON.parse(decodeURIComponent(this.$route.query.path)));
                return decodeURIComponent(this.$route.query.path)
            }
            else {
                return []
            }
        },
    },

    methods: {
        requestWorkData() {
            this.$axios
            .get(`/api/query/work/${this.$route.params.id}`)
            .then(res => {
                if (res.data.message === 'workNotFound') {
                    this.$router.push('/404')
                }
                else {
                    this.workInfo = res.data
                }
            })
            .catch(err => {
                if (err.response) {
                    this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
                }
                else {
                    this.showErrNotif(err.message || err)
                }
            })

            this.$axios
            .get(`/api/query/tracks/${this.$route.params.id}`)
            .then(res => {
                this.tree = res.data
            })
            .catch(err => {
                if (err.response) {
                    this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
                }
                else {
                    this.showErrNotif(err.message || err)
                }
            })
        },

        pathDown(event) {
            // console.log(event);
            this.$router.push(`${this.$route.path}?path=${encodeURIComponent(JSON.stringify(event))}#work-tree`)
        },

        pathUp(event) {
            // console.log(event);
            this.$router.push(`${this.$route.path}?path=${encodeURIComponent(JSON.stringify(event))}#work-tree`)
        },

        scrollToElement() {
            const element = document.getElementById('scrollTo')
            const target = getScrollTarget(element)
            const offset = element.offsetTop
            const duration = 1000
            setVerticalScrollPosition(target, offset)
        },

        initJobLists(event) {
            if (this.isReset) {
                this.fileList = event
            }
            else {
                this.isCompleted = false
                this.fileList = []
                this.doneList = []
                this.fileSizeList = []
                this.progressVal = 0
                this.isReset = true
                this.fileList = event
            }

            if (this.fileList.length) {
                this.seamless = true
            }
            else {
                this.seamless = false
            }
            
        },

        jobdone(event) {
            this.doneList.push(event)
            // console.log(this.doneList);
            this.progressValue()
            if (this.doneList.length === this.fileList.length) {
                this.isReset = false
                this.isCompleted = true
            }
        },

        progressValue() {
            if (this.doneList.length) {
                this.progressVal = this.doneList.length / this.fileList.length
                // console.log(this.progressVal);
            }
            else {
                this.progressVal = 0
            }
        },

        getFileSize(event) {
            // file size smaller than 1 kb
            if (this.isReset) {
                if (event < 1024) {
                    this.fileSizeList.push(event.toFixed(2).toString() + ' Bytes')
                } 
                // file size smaller than 1 mb
                else if (event < 1048576) {
                    this.fileSizeList.push((event / 1024).toFixed(2).toString() + ' KB')
                }
                else if (event < 1073741824) {
                    this.fileSizeList.push((event / 1048576).toFixed(2).toString() + ' MB')
                }
                else {
                    this.fileSizeList.push((event / 1073741824).toFixed(2).toString() + ' MB')
                }
            }
        },

        hideDownloadPage() {
            this.isHideDownloadPage = !this.isHideDownloadPage
            console.log(this.isHideDownloadPage);
        },
    }
})
</script>