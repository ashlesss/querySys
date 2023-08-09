<template>
    <q-layout v-show="showContent" view="hHh lpR fFf">
        <q-header elevated class="bg-black">
            <q-toolbar>
                <q-btn dense flat round icon="menu" @click="drawerOpen = !drawerOpen" />

                <q-toolbar-title>Dashboard</q-toolbar-title>
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
          </q-list>

        </q-scroll-area>

      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
</template>
<script>
import { ref } from 'vue';
import { mapState, mapActions } from 'pinia'
import { useUserAuthStore } from '../stores/userAuth'
import NotifyMixin from '../mixins/Notification.js'

export default {
    name: 'DashboardLayout',

    mixins: [NotifyMixin],

    data() {
        return {
            drawerOpen: ref(false),
            miniState: ref(true),
            links: [
                {
                    title: 'ボイス Storage',
                    icon: 'folder',
                    path: '/admin'
                },
                {
                    title: 'Scanner',
                    icon: 'youtube_searched_for',
                    path: '/admin/scanner'
                },
                {
                    title: 'User Manage',
                    icon: 'person',
                    path: '/admin/usermanage'
                },
                {
                    title: 'Advance Setting',
                    icon: 'settings',
                    path: '/admin/advance'
                },
                {
                    title: 'To Main Page',
                    icon: 'home',
                    path: '/'
                }
            ],
            showContent: false
        }
    },

    computed: {
        ...mapState(useUserAuthStore, [
            'group'
        ])
    },

    created() {
        this.$axios.get('/api/auth/me')
        .then(res => {
            if (res.data.user.group !== 'admin') {
                this.showContent = false
                this.showErrNotif('Only admin can access')
                this.$router.push('/')
            }
            else {
                this.showContent = true
                this.showSuccNotif('Welcome admin')
            }
        })
        .catch(err => {
            if (err.response) {
                if (err.response.status === 401) {
                    this.showContent = false
                    this.showErrNotif('You haven\'t log in yet')
                    this.$router.push('/login')
                }
                else {
                    this.showContent = false
                    this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
                }
            }
            else {
                this.showContent = false
                this.showErrNotif(err.message || err)
            }
        })
    }
}
</script>