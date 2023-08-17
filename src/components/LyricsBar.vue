<template>
    <q-card class="lbar" id="lbarEl" v-show="!pipEnable">
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

    <q-dialog v-model="showLyricsCard" auto-close>
        <q-card id="scrollTargetEl">
            <q-card-section class="row items-center q-pb-none">
                <q-space />
                <q-btn v-close-popup icon="close" flat round dense />
            </q-card-section>

            <q-card-section class="q-pt-none">
                <div v-html="lyricContentDisplay"></div>
            </q-card-section>

        </q-card>
    </q-dialog>
</template>
  
<script>
import Moveable from "vue3-moveable";
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'
import sanitizeHtml from 'sanitize-html';

export default {
    name: 'LyricsBar',

    components: {
        Moveable,
    },

    computed: {
        ...mapState(useAudioPlayerStore, [
            'currentLyric',
            'pipEnable',
            'currentCMPLyrics',
            'currentLyric'
        ]),

        lyricContentDisplay() {
            return this.currentCMPLyrics ? this.currentCMPLyrics
                .trim()
                .replace(/[\r\n]/g, '<br><br>')
                .split('<br>')
                .map(line => sanitizeHtml(line))
                .join('<br>')
                .replace(
                sanitizeHtml(this.currentLyric),
                `<span id="currentLyricEl" class="text-weight-bolder" style="font-size: 1.2em">${sanitizeHtml(
                    this.currentLyric
                )}</span>`
                )
            : '';
        }
    },

    // watch: {
    //     showLyricsCard
    // },

    data () {
        return {
            moveable: {
                draggable: true,
            },

            showLyricsCard: false
        }
    },

    mounted() {
        document.getElementById('lbarEl').addEventListener('dblclick', () => {
            // this.SET_SHOW_LYRICS_CARD(true)
            this.showLyricsCard = true
            this.$nextTick(() => {
            const el = document.getElementById('currentLyricEl');
            if (!el) return;
                const target = document.getElementById('scrollTargetEl');
                const offset = el.offsetTop;
                target.scrollTop = offset; // Simplified scroll to position, adjust as necessary
            });
        })
    },

    methods: {
        handleDrag({ target, transform }) {
            target.style.transform = transform;
        }
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
