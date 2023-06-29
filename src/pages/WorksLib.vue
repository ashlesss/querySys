<template>
    <div>
        <div class="text-h5 text-weight-regular q-ma-md">
            All works({{ totalWorks }})
        </div>
    </div>

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

    // created() {
    //     console.log(this.$route.query.page);
    // },

    data() {
        return {
            works: [],
            currPage: Number(this.$route.query.page) || 1,
            maxPage: [],
            totalWorks: [],
        }
    },
    // created() {
    //     // console.log(this.currPage);
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
            // console.log(this.$route.query.page);
            this.works= []
            // const url = `/api/query/rc?page=${this.currPage}`
            const url = `/api/query/rc`
            const params = {
                page: this.currPage,
            }
            this.$axios.get(url, { params })
            .then(val => {
                this.currPage = val.data[0].current_page
                this.maxPage = val.data[0].max_page
                this.totalWorks = val.data[0].total_works

                for ( let i = 1; i < val.data.length; i++) {
                    // console.log(val.data[i].work[0].rj_code);
                    this.works.push({rj_code: val.data[i].work.rj_code, 
                        work_main_img: val.data[i].work.work_main_img,
                        work_title: val.data[i].work.work_title,
                        work_tags: val.data[i].tags,
                        work_price: val.data[i].work.official_price,
                        work_circle: val.data[i].circle.circle_name,
                        work_dl_count: val.data[i].work.dl_count,
                        work_nsfw: val.data[i].work.nsfw,
                        work_rate_count: val.data[i].work.rate_count,
                        work_rate_average_2dp: val.data[i].work.rate_average_2dp,
                        work_rate_count_detail: JSON.parse(val.data[i].work.rate_count_detail)
                    });
                }
            })
            .catch( () => {
                this.currPage = 1;
                this.$router.push('/works')
                this.requestWorks()
            })
        },
    },

    mounted() {
        this.requestWorks()
    },
})
</script>