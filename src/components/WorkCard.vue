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

      <div class="q-mx-sm text-h6 text-weight-regular ellipsis-2-lines">
        <router-link :to="`/work/${this.work.rj_code}`" :class="$q.dark.isActive ? 'text-white' : 'text-black'" style="text-decoration:none">
            {{ work.work_title }}
        </router-link>
      </div>

      <div class="q-ml-sm q-mt-sm q-mb-xs text-subtitle1 text-weight-regular ellipsis">
        TODO:Brand
      </div>

      <div class="q-ma-xs">
        <q-chip
        :class="$q.dark.isActive ? '' : 'shadow-2'"
        :color="$q.dark.isActive ? 'grey-9' : 'grey-4'"
        v-for="(tag, index) in work.work_tags"
        :key=index>
            {{ tag.tag_name}}
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

    setup() {
    const $q = useQuasar();
    },

    // created() {
    //     console.log(this.work.work_tags);
    // },
})
</script>