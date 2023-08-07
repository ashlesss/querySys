// src/boot/axios.js

import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { LocalStorage } from 'quasar'

function setAxiosHeader(token) {
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : ''
}

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Authorization'] = LocalStorage.getItem('jwt-token') ? `Bearer ${LocalStorage.getItem('jwt-token')}` : ''

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$setAxiosHeader = setAxiosHeader
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file
})

export { axios, setAxiosHeader }