<template>
    <!-- Load spinner -->
    <div class="column justify-center items-center">
        <q-spinner-dots
          color="primary"
          size="3em"
          v-show="isLoading"
        />
        <!-- <q-tooltip :offset="[0, 8]">QSpinnerDots</q-tooltip> -->
    </div>

    <div v-show="!isLoading" id="workDetail">
        <WorkDetailPage v-if="workInfo.work_title" :workInfo="workInfo"/>
        <div id="work-tree"></div>
        <!-- @click="scrollToElement" -->
        <WorkTree  
            :tree="tree" 
            @path_down="pathDown" 
            @path_up="pathUp" 
            :goto="goToPath"
        />
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import WorkDetailPage from '../components/WorkDetailPage.vue';
import WorkTree from '../components/WorkTree.vue'
import NotifyMixin from '../mixins/Notification.js'
import { scroll } from 'quasar'
const { getScrollTarget, setVerticalScrollPosition, getVerticalScrollPosition } = scroll
// import DownloadCard from '../components/DownloadCard.vue'
import { mapState, mapActions } from 'pinia'
import { useDownloadCardStore } from '../stores/downloadCard'
import { useSubtitleFiles } from '../stores/subtitleFiles'

export default defineComponent({
    name: "WorkDetail",

    mixins: [NotifyMixin],

    components: {
        WorkDetailPage,
        WorkTree,
        // DownloadCard,
    },

    created() {
        this.requestWorkData()
    },

    data() {
        return {
            workInfo: {},
            tree: [],
            isReset: true,
            userCancel: false,
            isLoading: false,
            currWorkId: this.$route.params.id || ''
        }
    },

    watch: {
        userCancel() {
            this.USER_CANCEL()
            this.userCancel = false
        },

        $route(data) {
            if (data.params && data.params.id && this.currWorkId !== data.params.id) {
                this.currWorkId = data.params.id
                this.tree = []
                this.workInfo = {}
                this.requestWorkData()
            }
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

        ...mapState(useDownloadCardStore, [
            'seamlessStore',
            'fileListStore',
            'doneListStore',
            'fileSizeListStore',
            'progressValStore',
            'isCompletedStore',
            'isHideDownloadPageStore',
            'isCalculatingSizeStore'
        ]),
    },

    methods: {
        ...mapActions(useDownloadCardStore, [
            'SHOW_DOWNLOAD_CARD',
            'TOGGLE_DOWNLOAD',
            'RESET',
            'PROGRESS_VALUE',
            'GET_FILES',
            'DOWNLOAD_COMPLETED',
            'GET_DONE_FILES',
            'CAL_FILE_SIZE',
            'SET_IS_CAL_SIZE_FALSE',
            'USER_CANCEL',
            'GET_REAL_TIME_SIZE',
            'GET_CURR_JOB_INDEX'
        ]),

        ...mapActions(useSubtitleFiles, [
            'SAVE_SUB_FILES'
        ]),

        requestWorkData() {
            this.isLoading = true
            this.$axios
            .get(`/api/query/work/${this.$route.params.id}`)
            .then(res => {
                if (!res.data.rj_code) {
                    this.isLoading = false
                    this.$router.push('/404')
                }
                else {
                    this.workInfo = res.data
                    document.title = res.data.rj_code + ' ' + res.data.work_title
                    this.isLoading = false
                }
            })
            .catch(err => {
                if (err.response) {
                    this.isLoading = false
                    this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
                }
                else {
                    this.isLoading = false
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
            // const duration = 1000
            setVerticalScrollPosition(target, offset)
        },
    },

    beforeRouteEnter (to, from, next) {
        window.fromWorkLibToWorkDetail = {
            ...from
        }
        next()
    }
})
</script>