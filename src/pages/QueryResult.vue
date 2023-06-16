<template>
    <q-page class="column justify-center items-center">
        <div class="text-h6 text-weight-regular text-black">
            <QueryDetail :result="result"></QueryDetail>
        </div>
    </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import QueryDetail from '../components/QueryDetail.vue';

export default defineComponent ({
    name: 'QueryResult',

    data() {
        return {
            result: [],
        }
    },

    mounted() {
        let url = `http://localhost:4000/api/record?rjcode=${this.$route.params.id}`;
        this.$axisos.get(url)
        .then(val => {
            console.log(val.data);
        })
    }
})
</script>