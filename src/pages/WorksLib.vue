<template>
    <!-- <q-infinite-scroll @load="requestWorks" :offset="250"> -->
        <div class="row q-px-sm q-pt-sm q-col-gutter-x-md q-col-gutter-y-lg">
            <!-- col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2 -->
            <div class="col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2" v-for="work in works" :key="work.rjcode">
                <WordCard :work="work" class="fit" /> 
            </div>
        </div>
    <!-- </q-infinite-scroll> -->
    <div class="q-pa-lg flex flex-center ">
        <q-pagination
        v-model="currPage"
        :max="maxPage"
        :max-pages="6"
        direction-links
        @update:model-value="pageChange($event)"
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
            currPage: Number(this.$route.query.page) || 1,
            maxPage: 10,
        }
    },
    // created() {
    //     console.log(this.currPage);
    // },

    methods: {
        pageChange(pageNumber) {
            this.currPage = pageNumber
            // console.log(pageNumber);
            this.requestWorks()

            this.$router.push({path: this.$route.path, query: {
                page: this.currPage
            }})
        },

        requestWorks() {
            this.works= []
            // const url = `/api/query/rc?page=${this.currPage}`
            const url = `/api/query/rc`
            const params = {
                page: this.currPage,
            }
            this.$axios.get(url, { params })
            .then(val => {
                // console.log(val.data[0].work[0].rj_code);
                // console.log(val.data[val.data.length - 1].current_page);
                this.maxPage = val.data[val.data.length - 2].max_page
                this.currPage = val.data[val.data.length - 1].current_page
                // console.log(val.data[val.data.length - 1].max_page);
                for ( let i = 0; i < val.data.length - 2; i++) {
                    // console.log(val.data[i].work[0].rj_code);
                    this.works.push({rj_code: val.data[i].work[0].rj_code, 
                        work_main_img: val.data[i].work[0].work_main_img,
                        work_title: val.data[i].work[0].work_title,
                        work_tags: val.data[i].tags});
                }
            })
        },
    },

    mounted() {
        this.requestWorks()
    }
})
</script>