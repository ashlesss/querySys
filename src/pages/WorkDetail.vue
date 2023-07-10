<template>
    <WorkDetailPage v-if="workInfo.work_title" :workInfo="workInfo"/>
</template>

<script>
import { defineComponent, ref } from 'vue';
import WorkDetailPage from 'src/components/WorkDetailPage.vue';

export default defineComponent({
    name: "WorkDetail",

    components: {
        WorkDetailPage,
    },

    created() {
        // console.log(this.$route.params.id);
        this.requestWorkData()
    },

    data() {
        return {
            workInfo: {},
        }
    },

    methods: {
        requestWorkData() {
            this.$axios
            .get(`/api/query/record?rjcode=${this.$route.params.id}`)
            .then(val => {
                if (val.data.message === 'workNotFound') {
                    // console.log(val.data.message);
                    this.$router.push('/404')
                }
                else {
                    this.workInfo.work_tags = val.data.tags
                    this.workInfo.work_main_img = val.data.work.work_main_img
                    this.workInfo.work_title = val.data.work.work_title
                    this.workInfo.circle = val.data.circle.circle_name
                    this.workInfo.rate_count_detail = JSON.parse(val.data.work.rate_count_detail)
                    this.workInfo.rate_average_2dp = val.data.work.rate_average_2dp
                    this.workInfo.dl_count = val.data.work.dl_count
                    this.workInfo.official_price = val.data.work.official_price
                    this.workInfo.va = val.data.va
                    this.workInfo.rate_count = val.data.work.rate_count
                    this.workInfo.nsfw = val.data.work.nsfw
                }
                // console.log(this.workInfo);
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
})
</script>