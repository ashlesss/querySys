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

        <div>
            <QueryDetail v-if="result" :result="result" />
        </div>
    </q-page>
</template>

<script> 
import { defineComponent, ref } from 'vue'
import QueryDetail from '../components/QueryDetail.vue';

export default defineComponent ({
    name: "QueryMain",

    components: {
        QueryDetail,
    },

    data() {
        return {
            search: "",
            result: "",
        };
    },
    methods: {
        pressed() {
            let url
            if (this.search.match(/RJ\d{8}/) && this.search.length == 10) {
                url = `/api/query/record?rjcode=${this.search}`;
                console.log(url);
                this.$axios
                .get(url)
                .then(val => {
                    // console.log(val.data.work[0].work_title);
                    this.result = val.data;
                    // console.log(this.result);
                })
                .catch(err => console.log(err));
            }
            else if (this.search.match(/RJ\d{6}/) && this.search.length == 8) {
                url = `/api/query/record?rjcode=${this.search}`;
                console.log(url);
                this.$axios
                .get(url)
                .then(val => {
                    // console.log(val.data.work[0].tags);
                    this.result = val.data;
                    console.log(this.result);
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