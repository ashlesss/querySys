<template>
    <WorkDetailPage :workInfo="workInfo"/>
</template>

<script>
import { defineComponent, ref } from 'vue';
import WorkDetailPage from '../components/WorkDetailPage.vue';

export default defineComponent({
    name: "WorkDetail",

    components: {
        WorkDetailPage,
    },

    created() {
        // console.log(this.$route.params.id);
        this.requestWorkData()
        // console.log(this.workInfo);
    },

    data() {
        return {
            workInfo: {
                // rjcode: this.$route.params.id,
                work_title: "",
                work_tags: [],
                work_main_img: "",
            }
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
                    this.workInfo.work_title = val.data.work[0].work_title
                    this.workInfo.work_tags = val.data.tags
                    this.workInfo.work_main_img = val.data.work[0].work_main_img
                }
                // console.log(val.data);
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
})
</script>