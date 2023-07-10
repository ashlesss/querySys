// src/boot/axios.js

import { boot } from 'quasar/wrappers'
import socket from 'socket.io-client'

const io = socket.io('http://localhost:4000')

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$socket = io

  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file
})

export { io }