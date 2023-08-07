<template>
    <q-page class="column justify-center items-center">
        <div class="q-pa-md">
            <div class="row justify-center q-gutter-md q-mb-md">
              <q-btn label="Scan" color="primary" @click="scan" />
              <q-btn label="Clear DB" color="primary" />
            </div>

            <div 
              class="row justify-center q-gutter-md q-mb-md"
              v-show="isCompleted">
              <span>Scan Completed. Scroll down for more scan info.</span>
            </div>

            <q-scroll-area 
                class="bg-grey-10 text-white"
                :thumb-style="thumbStyle"
                :bar-style="barStyle"
                style="height: 300px; width: 1000px; borderRadius: 9px;">
              <div v-for="(log, index) in logs" :key="index" class="q-ml-sm q-pa-xs">
                  ➜ {{ log }}
              </div>
            </q-scroll-area>
        </div>
    </q-page>
</template>

<script>
import socket from 'socket.io-client'
const io = socket.io(process.env.API)

export default {
  setup () {
    return {
      thumbStyle: {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75
      },

      barStyle: {
        right: '2px',
        // borderRadius: '9px',
        backgroundColor: '#ffffff',
        width: '9px',
        opacity: 1
      },
    }
  },

  data() {
    return {
        logs: [],
        isCompleted: false
    }
  },

  methods: {
    scan() {
      this.isCompleted = false
      this.logs = []
      io.emit("scan", "START_SCAN")
    },
  },

  watch: {
    $route(data) {
      if (data.path.match(/dashboard/)) {
        document.title = 'DashBoard';
      }
    }
  },

  mounted() {
    document.title = 'DashBoard'
    io.emit('ON_SCAN_PAGE')
    io.on('ON_SCAN_PAGE', res => {
      this.logs.push(res)
    })

    io.on('progress', res => {
      this.logs.push(res)
    })

    io.on('failed', res => {
      // console.log(res);
      this.logs.push(res)
      this.isCompleted = true
    })

    io.on('scan_completed', res => {
      this.logs.push(res)
      this.isCompleted = true
    })
  }

}

</script>