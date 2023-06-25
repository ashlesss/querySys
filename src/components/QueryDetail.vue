<template>
    <q-page>
        <div class="column justify-center items-center">
            <h5>
                {{ result.work[0].work_title }}
            </h5>
            <div>
                <img :src="getImage">
            </div>
            <div class="row">
                <q-chip 
                v-for="(tag, index) in result.tags"
                :key=index>
                {{ tag.tag_name }}
            </q-chip>
            </div>
            <div style="font-size: 1.1rem;">
                <a :href="DLlink" target="_blank">Support this work on DLsite</a>
            </div>
            
        </div>
    </q-page>
</template>

<script>

export default {
    name: 'QueryDetail',

    props: ["result"],

    computed: {
        getImage() {
            let url = `http://localhost:4000/api/static/img/${this.result.work[0].work_main_img}`
            return url
        },

        DLlink() {
            let dlurl = `https://www.dlsite.com/maniax/work/=/product_id/${this.result.work[0].rj_code}.html`
            return dlurl
        }
    }
}
</script>