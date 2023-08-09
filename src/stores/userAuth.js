import { defineStore } from 'pinia'

export const useUserAuthStore = defineStore('userAuth', {
  state: () => ({
    auth: false,
    username: '',
    group: ''
  }),

  getters: {
    
  },

  actions: {
    INIT(user) {
      this.username = user.name
      this.group = user.group
    },

    SET_AUTH(status) {
      this.auth = status
    },

    ON_LOGOUT() {
      this.username = '',
      this.group = ''
    }
  }
})
