<template>
  <q-layout view="hHh lpR fFf">
      <q-header elevated v-bind:class="headerClass">
        <q-toolbar>
          <q-btn dense flat round icon="menu" @click="drawerOpen = !drawerOpen" />

          <q-btn flat size="md" icon="arrow_back_ios" @click="back()" v-if="isNotAtHomePage"/>
  
          <q-toolbar-title>
            <router-link to="/" class="text-white" style="text-decoration:none">
              ボイス
            </router-link>
          </q-toolbar-title>

          <q-input dark dense rounded standout v-model="keyword" debounce="1000" input-class="text-right" class="q-mr-sm" @focus="searchFocus" @blur="searchFucusLost">
          <template v-slot:append>
            <q-icon v-if="keyword === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="keyword = ''" />
          </template>
        </q-input>

        </q-toolbar>
        <AudioPlayer />
        <PiPSubtitle />
        <VideoElement />
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
              exact
              active-class="text-deep-purple text-weight-medium"
              @click="randomPlay"
            >
              <q-item-section avatar>
                <q-icon name="shuffle" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1">
                  Random Play
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

          <q-list>
              <q-item
                clickable
                v-ripple
                exact
                active-class="text-deep-purple text-weight-medium"
                @click="confirm = true"
                v-if="auth"
              >
                <q-item-section avatar>
                  <q-icon name="exit_to_app" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-subtitle1">
                    Logout
                  </q-item-label>
                  <q-item-label caption lines="2">{{ username }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

        </q-scroll-area>

      </q-drawer>

      <q-dialog v-model="confirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="power_settings_new" color="primary" text-color="white" />
            <span class="q-ml-sm">是否退出登录？（若未开启用户验证，则操作无效）</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="primary" v-close-popup />
            <q-btn flat label="退出" color="primary" @click="logout()" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <DownloadCard />
      <!-- <AudioPlayer /> -->
    <q-page-container>
      <!-- <router-view /> -->
      <!-- :key="this.$route.path" -->
      <router-view v-slot="{ Component } ">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
        <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="toTopPosition">
          <q-btn fab icon="keyboard_arrow_up" color="accent" />
        </q-page-scroller>
        
        <q-page-sticky position="bottom-right" :offset="[18, 90]">
          <q-btn fab v-show="fileListStore.length" color="accent" icon="cloud_download" @click="showDownloadPage"/>
        </q-page-sticky>
      </router-view>
      <!-- <span class="flex flex-center text-grey">
        TODO
      </span> -->
    </q-page-container>

    <q-footer class="q-pa-none">
      <LyricsBar />
      <PlayerBar />
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, defineAsyncComponent } from 'vue';
import { mapState, mapActions } from 'pinia'
import { useDownloadCardStore } from '../stores/downloadCard'
import { useAudioPlayerStore } from '../stores/audioPlayer'
import { useVideoPlayerStore } from '../stores/videoPlayer'
import DownloadCard from '../components/DownloadCard.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import PlayerBar from '../components/PlayerBar.vue'
import { useUserAuthStore } from '../stores/userAuth'
import NotifyMixin from '../mixins/Notification.js'
import LyricsBar from '../components/LyricsBar.vue'
import Search from '../mixins/Keywords'
import Page from '../mixins/Page'


export default defineComponent({
  name: 'MainLayout',

  mixins: [NotifyMixin, Search, Page],

  components: {
    DownloadCard,
    AudioPlayer,
    PlayerBar,
    LyricsBar,
    PiPSubtitle: defineAsyncComponent(() => import('../components/PiPSubtitle.vue')),
    VideoElement: defineAsyncComponent(() => import('../components/VideoElement.vue'))
  },

  data() {
    return {
      // keyword: this.$route.query ? this.$route.query.keyword : '',
      // keyword: this.$route.query.keyword || '',
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
          path: '/admin'
        }
      ],
      sFocus: false,
      confirm: false
    }
  },

  watch: {

  },

  mounted() {

  },

  created() {
    this.initUser()
    // const now = new Date()
    // const hours = now.getHours();
    // console.log(hours);
    // if (hours >= 19 || hours < 11) {
    //   console.log('night');
    //   this.toggleDark()
    // }
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
    ]),

    ...mapState(useUserAuthStore, [
      'auth',
      'username'
    ]),

    ...mapState(useVideoPlayerStore, [
      'videoHide'
    ]),

    toTopPosition() {
      if (this.videoHide) {
        return [18, 40]
      }
      else {
        return [18, 18]
      }
    }
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

    back() {
      console.log(this.$route.name);
      const historyPathLen = history.length;
      if (historyPathLen <= 2) {
        this.$router.push(`/works`)
      }
      else if ('fromWorkLibToWorkDetail' in window && this.$route.name === 'WorkDetail') {
        this.$router.push(window.fromWorkLibToWorkDetail)
        delete window.fromWorkLibToWorkDetail
      }
    },

    ...mapActions(useDownloadCardStore, [
      'SHOW_DOWNLOAD_CARD'
    ]),

    showDownloadPage() {
      this.SHOW_DOWNLOAD_CARD()
      // console.log(this.seamlessStore);
    },

    searchFocus() {
      this.sFocus = true
      // console.log(this.sFocus);
    },

    searchFucusLost() {
      this.sFocus = false
      // console.log(this.sFocus);
    },

    ...mapActions(useUserAuthStore, [
      'SET_AUTH',
      'INIT',
      'ON_LOGOUT'
    ]),

    initUser() {
      this.$axios.get('/api/auth/me')
      .then(res => {
        this.INIT(res.data.user)
        this.SET_AUTH(res.data.auth)
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status === 401) {
            const path = this.$route.path
            if (!path.match(/\blogin\b/)) {
              this.$router.push('/login')
              console.log('pushed');
            }
          }
          else {
            this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
          }
        }
        else {
          this.showErrNotif(err.message || err)
        }
      })
    },

    logout () {
      this.$q.localStorage.set('jwt-token', '')
      this.$setAxiosHeader('')
      this.ON_LOGOUT()
      this.$router.push('/login')
    },

    randomPlay() {
      this.$axios.get('/api/query/randomPlay')
      .then(res => {
        const rjcode = res.data.rj_code
        this.$router.push(`/work/${rjcode}`)
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status !== 401) {
            this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
          }
        }
        else {
          this.showErrNotif(err.message || err)
        }
      })
    }
  }
})
</script>

<style lang="scss">
// drawer bottom button
  aside.q-drawer div.q-scrollarea > div.scroll > div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
</style>
