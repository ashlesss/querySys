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
            .get(`/api/query/work/${this.$route.params.id}`)
            .then(val => {
                if (val.data.message === 'workNotFound') {
                    this.$router.push('/404')
                }
                else {
                    this.workInfo = val.data
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
})
</script>