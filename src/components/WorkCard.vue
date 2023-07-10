<template>
    <q-card class="mycard" >
      <!-- <img :src="getWorkImg"> -->
      <router-link :to="`/work/${this.work.rj_code}`">
        <q-img
        :src="`/api/static/img/${this.work.work_main_img}`"
        :ratio="4/3"
        style="max-width: 560px;">

        </q-img>
      </router-link>

      <!-- work title -->
      <div class="q-mx-sm text-h6 text-weight-regular ellipsis-2-lines">
        <router-link :to="`/work/${this.work.rj_code}`" :class="$q.dark.isActive ? 'text-white' : 'text-black'" style="text-decoration:none">
            {{ work.work_title }}
        </router-link>
      </div>

      <!-- circle -->
      <div class="q-ml-sm q-mt-sm q-mb-xs text-subtitle1 text-weight-regular ellipsis text-grey">
        {{ work.work_circle }}
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
          <span class="text-weight-medium text-body1 text-red">{{ work.work_rate_average_2dp }}</span>
          <span class="text-grey"> ({{ work.work_rate_count }})</span>
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
        <span class="q-mx-sm text-weight-medium text-h6 text-red">{{ work.work_price }} JPY</span>
        <span>Sales: {{ work.work_dl_count }}</span>
        <span v-if="!work.work_nsfw" class="q-mx-sm" style="background: #e6f7d6; color: #56842a">SFW</span>
      </div>

      <!-- tags -->
      <div class="q-ma-xs">
        <q-chip
        :class="$q.dark.isActive ? '' : 'shadow-2'"
        :color="$q.dark.isActive ? 'grey-9' : 'grey-4'"
        v-for="(tag, index) in work.work_tags"
        :key=index>
            {{ tag.tag_name}}
        </q-chip>
      </div>

      <!-- VAs -->
      <div class="q-mx-xs q-my-sm">
        <q-chip 
        v-for="(va, index) in work.work_va"
        :key=index
        square size="md" 
        class="shadow-2" 
        color="teal" 
        text-color="white">
          {{ va.va_name }}
        </q-chip>
      </div>

    </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
    name: "WorkCard",

    props: ["work"],

    // setup() {
    // const $q = useQuasar();
    // },
    
    data() {
      return {
        rating: 0
      }
    },

    mounted() {
      this.rating = this.work.work_rate_average_2dp
    }

    // created() {
    //     // console.log(this.work.work_tags);
    //     console.log(this.work.work_rate_count_detail[5]);
    // },
})
</script>