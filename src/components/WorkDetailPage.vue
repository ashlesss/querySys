<template>
    
    <div class="column justify-center items-center q-pa-sm">

        <WorkImgCover 
            class="q-mb-lg"
            :rjcode="workInfo.rj_code" 
            :release="workInfo.regist_date"
            :img="workInfo.work_main_img" 
            name="detail"
        />

        <div class="text-h6 text-weight-regular">
            {{ workInfo.work_title }}
        </div>

        <!-- Circle -->
        <div class="text-subtitle1 text-weight-regular text-grey">
            <router-link
            :to="`/works?keyword=${encodeURIComponent(`$circle:` + workInfo.circle_name + `$`)}`"
            class="text-grey"
            style="text-decoration:none">
                {{ workInfo.circle_name }}
            </router-link>
        </div>

        <!-- rating -->
        <div class="row items-center">
            <div class="col-auto q-ml-sm">
            <q-rating
                v-model="rating"
                size="sm"
                icon="star_border"
                icon-selected="star"
                icon-half="star_half"
            />
            <!-- :color="userMarked ? 'blue' : 'amber'" -->
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
            <q-chip size="sm" v-show="!workInfo.nsfw" outline square color="green" text-color="primary" label="SFW" />
            <q-chip size="sm" v-show="workInfo.has_subtitle" outline square color="primary" text-color="primary" label="CC" />
        </div>

        <!-- Tags -->
        <div class="row justify-center items-center">
            <router-link v-for="(tag, index) in workInfo.tags.tags"
                v-show="tag.tag_name"
                :key="index"
                :to="`/works?keyword=${encodeURIComponent(`$tag:` + tag.tag_name + `$`)}`"
                style="text-decoration: none"
            >
            <q-chip
                :class="$q.dark.isActive ? '' : 'shadow-2'"
                :color="$q.dark.isActive ? 'grey-9' : 'grey-4'"
                >
                {{ tag.tag_name }}
            </q-chip>
            </router-link>
        </div>
        <!-- VA -->
        <div class="row justify-center items-center">
            <router-link
                v-show="workInfo.vas.vas[0].va_name"
                v-for="(va, index) in workInfo.vas.vas"
                :key="index"
                :to="`/works?keyword=${encodeURIComponent(`$va:` + va.va_name + `$`)}`"
                style="text-decoration: none"
            >
            <q-chip 
            square size="md" 
            class="shadow-2" 
            color="teal" 
            text-color="white">
                {{ va.va_name }}
            </q-chip>
            </router-link>
        </div>
        <div style="font-size: 1.1rem;">
            <a :href="`https://www.dlsite.com/maniax/work/=/product_id/${this.$route.params.id}.html`" target="_blank">Support this work on DLsite</a>
        </div>

    </div>

    <!-- <div class="q-ml-md"></div> -->
</template>

<script>
import WorkImgCover from '../components/WorkImgCover.vue'

export default {
    name: 'WorkDetailPage',

    props: ["workInfo"],

    components: {
        WorkImgCover
    },

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
    },
}
</script>