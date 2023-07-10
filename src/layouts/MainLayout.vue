<template>
  <q-layout view="hHh lpR fFf">
      <q-header reveal elevated v-bind:class="headerClass">
        <q-toolbar>
          <q-btn dense flat round icon="menu" @click="drawerOpen = !drawerOpen" />

          <q-btn flat size="md" icon="arrow_back_ios" @click="back()" v-if="isNotAtHomePage"/>
  
          <q-toolbar-title>
            ボイス Query system
          </q-toolbar-title>

          
          <div>
            <q-btn flat round color="white" icon="dark_mode" @click="toggleDark"/>
          </div>
        </q-toolbar>
      </q-header>

    <q-drawer
        v-model="drawerOpen"
        show-if-above 

        :mini="miniState"
        @mouseover="miniState = false"
        @mouseout="miniState = true"

        :width="200"
        :breakpoint="500"
        bordered
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
          <q-list padding>
            <q-item 
            to="/"
            clickable 
            v-ripple
            exact>
              <q-item-section avatar>
                <q-icon name="info" />
              </q-item-section>

              <q-item-section>
                How 2 use
              </q-item-section>
            </q-item>

            <q-item 
            to="/QueryMain"
            exact
            clickable 
            v-ripple>
              <q-item-section avatar>
                <q-icon name="search" />
              </q-item-section>

              <q-item-section>
                Query Page
              </q-item-section>
            </q-item>

            <q-item 
            to="/works"
            exact
            clickable 
            v-ripple>
              <q-item-section avatar>
                <q-icon name="widgets" />
              </q-item-section>

              <q-item-section>
                Library
              </q-item-section>
            </q-item>

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
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const $q = useQuasar();
  },

  data() {
    return {
      drawerOpen: ref(false),
      miniState: ref(true),
      isDarkActive: false,
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
    }
  },

  // created() {
  //   console.log(this.$route.path);
  // },

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
