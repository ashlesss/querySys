<template> 
    <q-page class="column justify-center items-center">
        <div class="search">
            <form class="form" @submit.prevent="pressed">
                <q-input style="width: 500px" v-model="search"
                type="search"
                outlined
                label="Search"
                hint="RJ123456 OR RJ12345678"
                >
                <template v-slot:append>
                    <q-icon name="search"></q-icon>
                </template>
                </q-input>
                <div class="flex flex-center">
                    <q-btn class="q-mt-xl" style="width: 150px" type="submit" color="primary" label="Search"></q-btn>
                </div>
            </form>
        </div>

        <!-- <div>
            <QueryDetail v-if="result" :result="result" />
            <WordCard v-if="work" :work="work" class="fit" /> 
        </div> -->

        <!-- TODO
        Need redecoration -->
        <div class="row q-px-sm q-pt-sm q-col-gutter-x-md q-col-gutter-y-lg">
            <div class="col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2" v-for="work in works" :key="work.rj_code">
                <WordCard :work="work" class="fit" /> 
            </div>
        </div>
    </q-page>
</template>

<script> 
import { defineComponent, ref } from 'vue'
// import QueryDetail from '../components/QueryDetail.vue';
import WordCard from '../components/WorkCard.vue';

export default defineComponent ({
    name: "QueryMain",

    components: {
        // QueryDetail,
        WordCard,
    },

    data() {
        return {
            search: "",
            // result: "",
            works: [],
        };
    },

    // Data set refactored to support 
    // multi-keywords searching in the future
    methods: {
        pressed() {
            this.works = [];
            let url
            if (this.search.match(/RJ\d{8}/) && this.search.length == 10) {
                const params = {
                    rjcode: this.search
                }
                url = `/api/query/record`;
                this.$axios
                .get(url, { params })
                .then(val => {
                    // console.log(val.data.work[0].work_title);
                    // this.result = val.data;
                    this.works.push({
                        work_main_img: val.data.work[0].work_main_img,
                        rj_code: val.data.work[0].rj_code,
                        work_title: val.data.work[0].work_title,
                        work_tags: val.data.tags

                    })
                    // console.log(this.result);
                })
                .catch(err => console.log(err));
            }
            else if (this.search.match(/RJ\d{6}/) && this.search.length == 8) {
                const params = {
                    rjcode: this.search
                }
                url = `/api/query/record`;
                // console.log(url);
                this.$axios
                .get(url, { params })
                .then(val => {
                    // console.log(val.data.work[0].tags);
                    // this.result = val.data;
                    this.works.push({
                        work_main_img: val.data.work[0].work_main_img,
                        rj_code: val.data.work[0].rj_code,
                        work_title: val.data.work[0].work_title,
                        work_tags: val.data.tags

                    })
                    // console.log(this.result);
                })
                .catch(err => console.log(err));
            }
            else {
                alert('Error input');
            }
        }
    },
})
</script>