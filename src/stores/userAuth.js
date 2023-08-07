import { defineStore } from 'pinia'

export const useUserAuthStore = defineStore('userAuth', {
  state: () => ({
    auth: false,
    username: ''
  }),

  getters: {
    
  },

  actions: {
    INIT(user) {
      this.username = user.user.name
    },

    SET_AUTH(status) {
      this.auth = status
    },

    ON_LOGOUT() {
      this.username = ''
    }
  }
})
