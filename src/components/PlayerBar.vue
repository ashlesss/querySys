<template>
    <q-slide-transition class="bordered elevated">
        <div v-show="currentPlayingFile.hash && hide" class="row bg-white text-black justify-between">
            <q-item clickable v-ripple @click="TOGGLE_HIDE()" style="padding: 0px 5px;" class="col non-selectable">
                <q-item-section avatar>
                    <q-img transition="fade" :src="coverUrl" style="height: 50px; width: 50px" class="rounded-borders" />
                </q-item-section>

                <q-item-section>
                    <q-item-label lines="2">{{ currentPlayingFile.title }}</q-item-label>
                    <q-item-label caption lines="1">{{ currentPlayingFile.workTitle }}</q-item-label>
                </q-item-section>
            </q-item>
            
            <div class="col" style="justify-content: center; align-items: center; display: flex;">
                <div class="column">
                    <div class="row" style="justify-content: center; align-items: center; display: flex;">
                        <q-btn flat size="1rem" icon="skip_previous" @click="PREVIOUS_TRACK()" />
                        <q-btn flat size="1rem" :icon="playingIcon" @click="TOGGLE_PLAYING()" />
                        <q-btn flat size="1rem" icon="skip_next" @click="NEXT_TRACK()" />
                        <q-btn flat dense size="md" :icon="playModeIcon" @click="this.CHANGE_PLAY_MODE()" />
                    </div>
                </div>
            </div>

            <div class="col" v-if="!$q.platform.is.ios" style="justify-content: center; align-items: center; display: flex;">
                <q-icon name="volume_down" size="sm" class="q-mr-sm col-auto" />

                <q-slider
                    v-model="volume"
                    :min="0.0"
                    :max="1.0"
                    :step="0"
                    class="col"
                    style="max-width: 50%;"
                />

                <q-icon name="volume_up" size="sm" class="q-ml-sm col-auto" />
            </div>
        </div>
    </q-slide-transition>
</template>
<script>
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'

export default {
    name: 'PlayerBar',

    computed: {
        ...mapState(useAudioPlayerStore, [
            'currentPlayingFile',
            'playing',
            'hide',
            'playMode',
            'GET_VOLUME',
        ]),

        coverUrl() {
            const hash = this.currentPlayingFile.hash
            return hash ? `/api/static/img/${hash.split('/')[0]}_img_main.jpg` : ''
        },

        playingIcon () {
            return this.playing ? "pause" : "play_arrow"
        },

        playModeIcon () {
            switch (this.playMode.name) {
                case "all repeat":
                return "repeat"
                case "repeat once":
                return "repeat_one"
                case "shuffle":
                return "shuffle"
                default:
                return "playlist_play"
            }
        },

        volume: {
            get () {
                return Number(this.GET_VOLUME)
            },
            set (val) {
                const fixedVal = Number(val.toFixed(2))
                localStorage.volume = fixedVal
                this.SET_VOLUME(fixedVal)
            }
        },
    },

    methods: {
        ...mapActions(useAudioPlayerStore, [
            'TOGGLE_HIDE',
            'PREVIOUS_TRACK',
            'NEXT_TRACK',
            'TOGGLE_PLAYING',
            'CHANGE_PLAY_MODE',
            'SET_VOLUME'
        ]),
    }
}
</script>