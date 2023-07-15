<template>
    <div class="column justify-center items-center">
        <!-- Work's image -->
        <div class="q-pt-lg">
            <img :src="getImgUrl">
        </div>

        <div class="text-h6 text-weight-regular">
            {{ workInfo.work_title }}
        </div>

        <!-- Circle -->
        <div class="text-subtitle1 text-weight-regular text-grey">
            {{workInfo.circle_name}}
        </div>

        <!-- rating -->
        <div class="row items-center">
            <div class="col-auto q-ml-sm">
            <q-rating
                v-model="rating"
                size="sm"
                :color="userMarked ? 'blue' : 'amber'"
                icon="star_border"
                icon-selected="star"
                icon-half="star_half"
            />
            </div>

            <div class="col-auto">
            <span class="text-weight-medium text-body1 text-red">{{ workInfo.rate_average_2dp }}</span>
            <span class="text-grey"> ({{ workInfo.rate_count }})</span>
            </div>
        </div>

        <!-- Price, SFW tag, and sales count -->
        <div>
            <span class="q-mx-sm text-weight-medium text-h6 text-red">{{ workInfo.official_price }} JPY</span>
            <span>Sales: {{ workInfo.dl_count }}</span>
            <span v-if="!workInfo.nsfw" class="q-mx-sm" style="background: #e6f7d6; color: #56842a">SFW</span>
        </div>

        <!-- Tags -->
        <div class="row">
            <q-chip 
            v-for="(tag, index) in workInfo.tags.tags"
            :key=index
            :class="$q.dark.isActive ? '' : 'shadow-2'"
            :color="$q.dark.isActive ? 'grey-9' : 'grey-4'">
            {{ tag.tag_name }}
            </q-chip>
        </div>
        <!-- VA -->
        <div class="row">
            <q-chip
            v-for="(va, index) in workInfo.vas.vas"
            :key=index
            square size="md" 
            class="shadow-2" 
            color="teal" 
            text-color="white">
            {{ va.va_name }}
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

    data() {
        return {
            rating: 0
        }
    },

    mounted() {
      this.rating = this.workInfo.rate_average_2dp
    },

    computed: {
        getImgUrl() {
            return `/api/static/img/${this.workInfo.work_main_img}`
        }
    }
}
</script>