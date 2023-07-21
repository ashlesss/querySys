<template>
    <div>
        <WorkDetailPage v-if="workInfo.work_title" :workInfo="workInfo"/>
        <div id="scrollTo"></div>
        <WorkTree @click="scrollToElement" :tree="tree" @path_down="pathDown" @path_up="pathUp" :goto="goToPath"/>
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
            tree: []
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
        }
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
    }
})
</script>