<template>
  <q-layout view="hHh lpR fFf">
      <q-header reveal elevated v-bind:class="headerClass">
        <q-toolbar>
          <q-btn dense flat round icon="menu" @click="drawerOpen = !drawerOpen" />

          <q-btn flat size="md" icon="arrow_back_ios" @click="back()" v-if="isNotAtHomePage"/>
  
          <q-toolbar-title>
            ボイス Query system
          </q-toolbar-title>

          <q-input dark dense rounded standout v-model="keyword" debounce="500" input-class="text-right" class="q-mr-sm">
          <template v-slot:append>
            <q-icon v-if="keyword === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="keyword = ''" />
          </template>
        </q-input>

        </q-toolbar>
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

      
    <q-page-container>
      <!-- <router-view /> -->
      <router-view v-slot="{ Component }">
        <keep-alive exclude="WorkDetail">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  data() {
    return {
      keyword: this.$route.query.keyword ? this.$route.query.keyword : '',
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
      ]
    }
  },

  watch: {
    keyword() {
      this.$router.push(this.keyword ? `/works?keyword=${encodeURIComponent(this.keyword)}` : `/works`)
    },

    $route(data) {
      this.keyword = data.query.keyword
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
      this.$router.go(-1)
    }
  }
})
</script>
