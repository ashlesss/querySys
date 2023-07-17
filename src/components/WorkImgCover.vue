<template>
    <router-link :to="`/work/${rjcode}`">
        <q-img
            :src="coverUrl"
            :ratio="4/3"
            style="max-width: 560px;"
            transition="fade"
            >
            <div class="absolute-top-left transparent" style="padding: 0;">
                <q-chip dense square color="brown" text-color="white" class="q-ma-sm">
                {{ rjcode }}
                </q-chip>
            </div>

            <div :v-if="release" class="absolute-bottom-right" style="padding: 5px;">
                {{release}}
            </div>
        </q-img>
    </router-link>
    <!-- <div>
        {{ img }}
    </div> -->
</template>
<script>
export default {
    name: 'WorkImgCover',

    props: ['rjcode', 'release', 'img'],
    
    computed: {
        coverUrl() {
            return `/api/static/img/${this.img}`
        }
    },
}
</script>