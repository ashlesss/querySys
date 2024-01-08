
// src/boot/vue-plyr.js
import { boot } from 'quasar/wrappers'
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
  // something to do

  app.use(VuePlyr, {
    plyr: {
      // controls: ['progress']
    }
  })


})
