<template>
    <q-card>
      <WorkImgCover 
        :rjcode="work.rj_code" 
        :release="work.regist_date"
        :img="work.work_main_img"
        class="fit"/>

      <q-separator />

      <!-- work title -->
      <div class="q-mx-sm text-h6 text-weight-regular ellipsis-2-lines">
        <router-link :to="`/work/${this.work.rj_code}`" :class="$q.dark.isActive ? 'text-white' : 'text-black'" style="text-decoration:none">
            {{ work.work_title }}
        </router-link>
      </div>

      <!-- circle -->
      <div class="q-ml-sm q-mt-sm q-mb-xs text-subtitle1 text-weight-regular ellipsis text-grey">
        <router-link
        :to="`/works?keyword=${encodeURIComponent(`$circle:` + work.circle_name + `$`)}`"
        class="text-grey"
        style="text-decoration:none">
          {{ work.circle_name }}
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
          <span class="text-weight-medium text-body1 text-red">{{ work.rate_average_2dp }}</span>
          <span class="text-grey"> ({{ work.rate_count }})</span>
        </div>
      </div>

      <!-- DLsite link -->
      <div class="row items-center">
        <div class="col-auto">
          <q-icon name="launch" size="xs" />
          <a class="text-blue" :href="`https://www.dlsite.com/home/work/=/product_id/${work.rj_code}.html`" rel="noreferrer noopener" target="_blank">DLsite</a>
        </div>
      </div>

      <!-- Price, SFW tag, and sales count -->
      <div>
        <span class="q-mx-sm text-weight-medium text-h6 text-red">{{ work.official_price }} JPY</span>
        <span>Sales: {{ work.dl_count }}</span>
        <q-chip size="sm" v-show="!work.nsfw" outline square color="green" text-color="primary" label="SFW" />
        <q-chip size="sm" v-show="work.has_subtitle" outline square color="primary" text-color="primary" label="CC" />
      </div>

      <!-- tags -->
      <div class="q-ma-xs">
        <router-link v-for="(tag, index) in work.tags.tags"
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

      <!-- VAs -->
      <div class="q-mx-xs q-my-sm">
        <router-link
          v-show="work.vas.vas[0].va_name"
          v-for="(va, index) in work.vas.vas"
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

    </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue';
import WorkImgCover from './WorkImgCover.vue'

export default defineComponent({
    name: "WorkCard",

    props: ["work"],

    components: {
      WorkImgCover
    },
    
    data() {
      return {
        rating: 0
      }
    },

    mounted() {
      this.rating = this.work.rate_average_2dp
    },
})
</script>