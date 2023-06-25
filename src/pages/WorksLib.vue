<template>
    <q-infinite-scroll @load="requestWorks" :offset="250">
        <div class="row q-px-sm q-col-gutter-x-md q-col-gutter-y-lg">
            <!-- col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2 -->
            <div class="col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2" v-for="work in works" :key="work.rjcode">
                <WordCard :work="work" class="fit" /> 
            </div>
        </div>
    </q-infinite-scroll>
    <div class="q-pa-lg flex flex-center">
        <q-pagination
        v-model="current"
        :max="5"
        direction-links
        />
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import WordCard from '../components/WorkCard.vue';

export default defineComponent({
    name: "WorksLib",

    components: {
        WordCard,
    },

    data() {
        return {
            works: [
                // {rjcode: 'RJ343788'},
                // {rjcode: 'RJ440172'},
                // {rjcode: 'RJ440172'},
                // {rjcode: 'RJ440172'},
            ],
            current: 1,
            pagination: {currentPage: 1, pageSize: 3, totalCount: 0},
        }
    },

    methods: {
        requestWorks() {
            const url = `/api/query/rc`
            this.$axios.get(url)
            .then(val => {
                // console.log(val.data[0].work[0].rj_code);
                for ( let i = 0; i < val.data.length; i++) {
                    // console.log(val.data[i].work[0].rj_code);
                    this.works.push({rj_code: val.data[i].work[0].rj_code, 
                        work_main_img: val.data[i].work[0].work_main_img,
                        work_title: val.data[i].work[0].work_title,
                        work_tags: val.data[i].tags});
                }
            })
        }
    }
})
</script>