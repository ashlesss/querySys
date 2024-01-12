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
                <!-- <div v-html="lyricContentDisplay"></div> -->
                <div class="lyric-content">
                    <div 
                    v-for="(line, index) in lyricContentDisplay" 
                    :key="index" 
                    :class="{ 'text-bold': index === this.currentLrcLineNumber }"
                    :id="index === this.currentLrcLineNumber ? 'currentLyricEl' : ''">
                        <br>
                        {{ millisecondsToLRC(line.time) }}{{ line.text }}
                    </div>
                </div>
                
            </q-card-section>

        </q-card>
    </q-dialog>
</template>
  
<script>
import Moveable from "vue3-moveable";
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'
import sanitizeHtml from 'sanitize-html';
import { scroll } from 'quasar'

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
            'currentLyric',
            'currentLrcLineNumber'
        ]),

        lyricContentDisplay() {
            return this.currentCMPLyrics.map(line => ({
                text: sanitizeHtml(line.text.trim()),
                time: line.time
            }));
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
        // console.log(this.currentCMPLyrics);
        this.showLyricsCard = true
        this.$nextTick(() => {
            const { setVerticalScrollPosition } = scroll
            const currentLyricEl = document.getElementById('currentLyricEl')
            if (!currentLyricEl) {
                return
            }
            const scrollTargetRl = document.getElementById('scrollTargetEl')
            const offset = currentLyricEl.offsetTop
            setVerticalScrollPosition (scrollTargetRl, offset, 500)
            })
        })
    },

    methods: {
        handleDrag({ target, transform }) {
            target.style.transform = transform;
        },

        millisecondsToLRC(milliseconds) {
            // let totalSeconds = (parseInt(milliseconds) + (this.subtitleOffset * 1000 * -1)) / 1000;
            let totalSeconds = parseInt(milliseconds) / 1000;

            let minutes = Math.floor(totalSeconds / 60);

            let remainingSeconds = totalSeconds - (minutes * 60);

            let formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
            let formattedSeconds = remainingSeconds.toFixed(2).padStart(5, "0");

            return `[${formattedMinutes}:${formattedSeconds}]`;
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

.lyric-content {
    text-align: center;
}
</style>
