import { boot } from 'quasar/wrappers'
import { io } from 'socket.io-client'
import { LocalStorage } from 'quasar'

const socket = io(process.env.API, {
    autoConnect: false,
    query: {
        jwt: LocalStorage.getItem('jwt-token') ? LocalStorage.getItem('jwt-token') : ''
    }
})

export default boot(({ app }) => {

  app.config.globalProperties.$socket = socket
  
})

export { socket }