<template>
  <q-layout view="hHh lpR fFf">
      <q-header elevated v-bind:class="headerClass">
        <q-toolbar>
          <q-btn dense flat round icon="menu" @click="drawerOpen = !drawerOpen" />

          <q-btn flat size="md" icon="arrow_back_ios" @click="back(this.$route.path)" v-if="isNotAtHomePage"/>
  
          <q-toolbar-title>
            <router-link to="/" class="text-white" style="text-decoration:none">
              ボイス
            </router-link>
          </q-toolbar-title>

          <q-input dark dense rounded standout v-model="keyword" debounce="1000" input-class="text-right" class="q-mr-sm">
          <template v-slot:append>
            <q-icon v-if="keyword === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="keyword = ''" />
          </template>
        </q-input>

        </q-toolbar>
        <AudioPlayer />
      </q-header>

    <q-drawer
        v-model="drawerOpen"
        show-if-above 

        :mini="miniState"
        @mouseover="miniState = false"
        @mouseout="miniState = true"
        mini-to-overlay

        :width="230"
        :breakpoint="500"
        bordered
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'"
      >
        <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
          <q-list>
            <q-item
            clickable
            v-ripple
            exact
            :to="link.path"
            active-class="text-deep-purple text-weight-medium"
            v-for="(link, index) in links"
            :key="index"
            @click="miniState = true"
          >
            <q-item-section avatar>
                <q-icon :name="link.icon" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1">
                  {{link.title}}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
            clickable
            v-ripple
            @click="toggleDark"
          >
            <q-item-section avatar>
              <q-icon :name="isDarkActive ? 'sunny' : 'dark_mode'" />
            </q-item-section>

            <q-item-section class="text-subtitle1">
                Dark mode
            </q-item-section>

            </q-item>
          </q-list>

          <!-- <div class="fixed-bottom">
            <q-list>
              <q-item 
            to="/dashboard"
            exact
            clickable 
            v-ripple>
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>

              <q-item-section>
                Dashboard
              </q-item-section>
            </q-item>
            </q-list>
          </div> -->

        </q-scroll-area>

      </q-drawer>

      <DownloadCard />
      <!-- <AudioPlayer /> -->
    <q-page-container>
      <!-- <router-view /> -->
      <router-view v-slot="{ Component }">
        <keep-alive exclude="WorkDetail">
          <component :is="Component" />
        </keep-alive>
        <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
          <q-btn fab icon="keyboard_arrow_up" color="accent" />
        </q-page-scroller>
        
        <q-page-sticky position="bottom-right" :offset="[18, 90]">
          <q-btn fab v-show="fileListStore.length" color="accent" icon="cloud_download" @click="showDownloadPage"/>
        </q-page-sticky>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { mapState, mapActions } from 'pinia'
import { useDownloadCardStore } from '../stores/downloadCard'
import { useAudioPlayerStore } from '../stores/audioPlayer'
import DownloadCard from '../components/DownloadCard.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import { SessionStorage } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: {
    DownloadCard,
    AudioPlayer
  },

  data() {
    return {
      // keyword: this.$route.query ? this.$route.query.keyword : '',
      keyword: this.$route.query.keyword || '',
      drawerOpen: ref(false),
      miniState: ref(true),
      isDarkActive: false,
      links: [
        {
          title: 'Library',
          icon: 'widgets',
          path: '/works'
        },
        {
          title: 'Query Page',
          icon: 'search',
          path: '/QueryMain'
        },
        {
          title: 'Dashboard',
          icon: 'dashboard',
          path: '/dashboard'
        }
      ],
    }
  },

  watch: {
    keyword() {
      // sessionStorage.setItem('searchKeyword', this.keyword)
      // // 
      // const keyword = sessionStorage.getItem('searchKeyword')
      // if (keyword) {
      //   if (this.$route.path.match(/\bworks\b/)) {
      //     // if (this.$route.query.page) {
      //     //   console.log('main', this.$route.query.page);
      //     //   this.$router.push(`/works?keyword=${encodeURIComponent(keyword)}&page=${this.$route.query.page}`)
      //     // }
      //     // else {
      //     //   this.$router.push(`/works?keyword=${encodeURIComponent(keyword)}`)
      //     // }
      //     console.log('main');
      //     this.$router.push(`/works?keyword=${encodeURIComponent(keyword)}`)
      //   }
      // }
      // else {
      //   this.$router.push('/works')
      //   this.keyword = ''
      //   sessionStorage.removeItem('searchKeyword')


      //   // if (this.$route.query.path) {
      //   //   // console.log('query path exists');
      //   //   this.$router.push(`${this.$route.fullPath}`)
      //   // }
      //   // else {
      //   //   // console.log('main page: ' + this.$route.fullPath);
      //   //   if (this.$route.query.page) {
      //   //     // console.log('main pageNumber', this.$route.query.page);
      //   //     this.$router.push(`${this.$route.path}?page=${this.$route.query.page}`)
      //   //     this.keyword = ''
      //   //     sessionStorage.removeItem('searchKeyword')
      //   //   }
      //   //   else {
      //   //     this.$router.push(`${this.$route.path}`)
      //   //     this.keyword = ''
      //   //     sessionStorage.removeItem('searchKeyword')
      //   //   }
          
      //   // }
      // }


      sessionStorage.setItem('searchKeyword', this.keyword)
      const keyword = sessionStorage.getItem('searchKeyword')

      if (keyword) {
        if (this.$route.query.page) {
          console.log('main', this.$route.query.page);
          this.$router.push(`/works?keyword=${encodeURIComponent(keyword)}&page=${this.$route.query.page}`)
        }
        else {
          this.$router.push(`/works?keyword=${encodeURIComponent(keyword)}`)
        }
        // this.$router.push(`/works?keyword=${encodeURIComponent(this.keyword)}&page=1`)
      }
      else {
        if (this.$route.query.path) {
          // console.log('query path exists');
          this.$router.push(`${this.$route.fullPath}`)
        }
        else {
          // console.log('main page: ' + this.$route.fullPath);
          if (this.$route.query.page) {
            // console.log('main pageNumber', this.$route.query.page);
            this.$router.push(`${this.$route.path}?page=${this.$route.query.page}`)
            this.keyword = ''
            sessionStorage.removeItem('searchKeyword')
          }
          else {
            this.$router.push(`${this.$route.path}`)
            this.keyword = ''
            sessionStorage.removeItem('searchKeyword')
          }
          
        }
      }
    },

    $route(data) {
      if (data.query.keyword) {
        this.keyword = data.query.keyword
        sessionStorage.setItem('searchKeyword', data.query.keyword)
      }
      else {
        if (!data.path.match(/\bwork\b/)) {
          this.keyword = ''
          sessionStorage.removeItem('searchKeyword')
        }
      }
    }

  },

  created() {
    // this.$route.query.keyword ? this.keyword = this.$route.query.keyword : ''
    if (this.$route.query.keyword) {
      sessionStorage.setItem('searchKeyword', this.$route.query.keyword)
      this.keyword = this.$route.query.keyword
    }
    else {
      const keyword = sessionStorage.getItem('searchKeyword')
      keyword ? this.keyword = keyword : this.keyword = ''
      
    }
  },

  computed: {
    headerClass() {
      return {
        'bg-primary text-white': !this.isDarkActive,
        'bg-dark text-white': this.isDarkActive
      }
    },

    isNotAtHomePage() {
      const path = this.$route.path
      return path && path !=='/works' && path !=='/'
    },

    ...mapState(useDownloadCardStore, [
      'seamlessStore',
      'fileListStore'
    ]),

    ...mapState(useAudioPlayerStore, [
      'GET_HIDE'
    ])
  },

  methods: {
    toggleDark() {
      if (this.$q.dark.isActive == false && this.$q.dark.mode == false) {
        this.$q.dark.set(true);
        this.isDarkActive = true;
      }
      else {
        this.$q.dark.set(false);
        this.isDarkActive = false;
      }
    },

    back(path) {
      // console.log(path);
      this.$router.go(-1)
    },

    ...mapActions(useDownloadCardStore, [
      'SHOW_DOWNLOAD_CARD'
    ]),

    showDownloadPage() {
      this.SHOW_DOWNLOAD_CARD()
      console.log(this.seamlessStore);
    },

    changeKeywordPage() {
      if (this.keyword) {
        if (this.$route.query.page) {
          this.$router.push(`/works?keyword=${encodeURIComponent(this.keyword)}&page=${this.$route.query.page}`)
        }
        else {
          this.$router.push(`/works?keyword=${encodeURIComponent(this.keyword)}`)
        }
      }
      else {
        this.$router.push(`/works`)
      }
    }
  }
})
</script>
