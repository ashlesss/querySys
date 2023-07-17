<template>
    <div>
        <WorkDetailPage v-if="workInfo.work_title" :workInfo="workInfo"/>
        <WorkTree :tree="tree"/>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import WorkDetailPage from '../components/WorkDetailPage.vue';
import WorkTree from '../components/WorkTree.vue'
import NotifyMixin from '../mixins/Notification.js'

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
    }
})
</script>