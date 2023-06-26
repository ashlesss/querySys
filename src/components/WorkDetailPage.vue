<template>
    <div class="column justify-center items-center">
        <h5>
            {{ workInfo.work_title }}
        </h5>
        <div>
            <img :src="getImgUrl">
        </div>
        <div class="row">
            <q-chip 
            v-for="(tag, index) in workInfo.work_tags"
            :key=index>
            {{ tag.tag_name }}
        </q-chip>
        </div>
        <div style="font-size: 1.1rem;">
            <a :href="`https://www.dlsite.com/maniax/work/=/product_id/${this.$route.params.id}.html`" target="_blank">Support this work on DLsite</a>
        </div>
        
    </div>
</template>

<script>

export default {
    name: 'WorkDetailPage',

    props: ["workInfo"],

    // created() {
    //     console.log(this.workInfo);
    // },

    computed: {
        getImgUrl() {
            return `/api/static/img/${this.workInfo.work_main_img}`
        }
    }
}
</script>