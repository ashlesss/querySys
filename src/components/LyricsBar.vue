<template>
    <q-card class="lbar">
          <div id="lyricsBar" class="text-center text-h6 text-bold ellipsis-2-lines text-purple q-mb-md absolute-bottom">
              <span id="lyric">
                {{ currentLyric }}
              </span>
          </div>
          <Moveable v-bind="moveable" 
            v-bind:target="['.lbar']"
            v-bind:rotationPosition="'none'"
            v-bind:renderDirections="[]"
            @drag="handleDrag" />
    </q-card>
    
</template>
  
<script>
import Moveable from "vue3-moveable";
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'

export default {
    name: 'LyricsBar',

    components: {
        Moveable,
    },

    computed: {
        ...mapState(useAudioPlayerStore, [
            'currentLyric'
        ])
    },

    data () {
        return {
            moveable: {
                draggable: true,
            },
        }
    },

    methods: {
        handleDrag({ target, transform }) {
            target.style.transform = transform;
        },
    },
}
</script>

<style lang="scss">
.moveable-line {
    background-color: transparent !important;
}

.moveable-control {
    display: none !important
}
#lyricsBar {
    background-color: rgba($grey-4, $alpha: 0.6);
}
</style>
