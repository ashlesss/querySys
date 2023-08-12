<template>
    <div>
        <vue-plyr ref="plyr" 
            @canplay="onCanPlay()"
            @timeupdate="timeUpdate()"
            @ended="onEnded()"
            @seeked="onSeeked()"
        >
            <audio crossorigin="anonymous">
                <source
                    v-if="source"
                    :src="source"
                />
            </audio>
        </vue-plyr>
    </div>
</template>
<script>
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'
import Lyric from 'lrc-file-parser'
import { useSubtitleFiles } from '../stores/subtitleFiles'
import levenshtein from 'fast-levenshtein';
import NotifyMixin from '../mixins/Notification.js'

export default {
    name: 'AudioElement',

    mixins: [NotifyMixin],

    data() {
        return {
            lrcObj: null,
            lrcAvailable: false,
        }
    },

    computed: {
        ...mapState(useAudioPlayerStore, [
            'currentPlayingFile',
            'GET_PLAYING',
            'queue',
            'playing',
            'rewindSeekMode',
            'rewindSeekTime',
            'forwardSeekMode',
            'forwardSeekTime',
            'playMode',
            'queueIndex',
            'volume',
            'currentSubtitleIndex'
        ]),

        ...mapState(useSubtitleFiles, [
            'subtitleFiles'
        ]),

        player() {
            return this.$refs.plyr.player
        },

        source() {
            if (this.currentPlayingFile.mediaStreamUrl) {
                // console.log(this.currentPlayingFile.mediaStreamUrl);
                const token = this.$q.localStorage.getItem('jwt-token') ? `?token=${this.$q.localStorage.getItem('jwt-token')}` : ''
                return `${this.currentPlayingFile.mediaStreamUrl}${token}`
            } else if (this.currentPlayingFile.hash) {
                // Fallback to be compatible with old backend
                const token = this.$q.localStorage.getItem('jwt-token') ? `?token=${this.$q.localStorage.getItem('jwt-token')}` : ''
                return `/api/media/stream/${this.currentPlayingFile.hash}${token}`
            } else {
                return ""
            }
        }
    },

    watch: {
        playing(flag) {
            if (this.player.duration) {
                // Preload to playable status
                flag ? this.player.play() : this.player.pause()
                // this.playLrc(flag)
            }
            // console.log(this.playing);
            this.playLrc(flag)
        },

        source(url) {
            if (url) {
                // this.onSourceChange()
                this.resetPlayer()
                this.player.media.load();
                this.loadLrcFile()
            }
        },

        muted (flag) {
            // Toggle to muted 
            this.player.muted = flag
        },

        volume (val) {
            // Ignore invalid volume value
            if (val < 0 || val > 1) {
                return
            }
            
            // Adjust volume
            this.player.volume = val
        },

        rewindSeekMode(rewind) {
            if (rewind) {
                this.player.rewind(this.rewindSeekTime);
                this.SET_REWIND_SEEK_MODE(false);
            }
        },

        forwardSeekMode(forward) {
            if (forward) {
                this.player.forward(this.forwardSeekTime);
                this.SET_FORWARD_SEEK_MODE(false);
            }
        },

        // queue() {
        //     console.log(this.queue);
        // }
    },

    methods: {
        ...mapActions(useAudioPlayerStore, [
            'SET_DURATION',
            'SET_REWIND_SEEK_MODE',
            'SET_FORWARD_SEEK_MODE',
            'PLAY',
            'PAUSE',
            'SET_TRACK',
            'SET_CURRENT_TIME',
            'SET_VOLUME',
            'SET_CURRENT_LYRIC',
            'SET_CURR_SUB_INDEX',
            'SET_HAVE_SUBTITLE'
        ]),

        resetPlayer() {
            this.player.source = null
            console.log('Player reloaded');
        },
        
        onCanPlay() {
            this.SET_DURATION(this.player.duration)

            if (this.playing && this.player.currentTime !== this.player.duration) {
                this.player.play()
            } 
        },

        timeUpdate() {
            // console.log(this.player.currentTime)
            this.SET_CURRENT_TIME(this.player.currentTime)
            // if (this.sleepMode && this.sleepTime) {
            //     const currentTime = new Date()
            //     const currentHourStr = currentTime.getHours().toString().padStart(2, '0')
            //     const currentMinuteStr = currentTime.getMinutes().toString().padStart(2, '0')
            //     const sleepHourStr = this.sleepTime.match(/\d+/g)[0]
            //     const sleepMinuteStr = this.sleepTime.match(/\d+/g)[1]
            //     if (currentHourStr === sleepHourStr && currentMinuteStr === sleepMinuteStr) {
            //     this.PAUSE()
            //     this.CLEAR_SLEEP_MODE()
            //     // Persist sleep mode settings
            //     this.$q.sessionStorage.set('sleepTime', null)
            //     this.$q.sessionStorage.set('sleepMode', false)
            //     }
            // }
        },

        onEnded() {
            // Trigger whtn media stop playing
            switch (this.playMode.name) {
                case "all repeat":
                // Repeat all
                if (this.queueIndex === this.queue.length - 1) {
                    this.SET_TRACK(0)
                } else {
                    this.NEXT_TRACK()
                }
                break
                case "repeat once":
                // Repeat one
                this.player.currentTime = 0
                this.player.play()
                this.PLAY()
                break
                case "shuffle": {
                // Shuffle
                const index = Math.floor(Math.random()*this.queue.length)
                this.SET_TRACK(index)
                if (index === this.queueIndex) {
                    this.player.currentTime = 0
                }
                break
                }
                default:
                // Repeat
                if (this.queueIndex === this.queue.length - 1) {
                    this.PAUSE()
                } else {
                    this.NEXT_TRACK()
                }
            }
        },

        onSeeked() {
            if (this.lrcAvailable) {
                this.lrcObj.play(this.player.currentTime * 1000);
                if (!this.playing) {
                this.lrcObj.pause();
                }
            }
        },

        playLrc (playStatus) {
            if (this.lrcAvailable) {
                if (playStatus) {
                this.lrcObj.play(this.player.currentTime * 1000);
                } else {
                this.lrcObj.pause();
                }
            }
        },

        initLrcObj () {
            this.lrcObj = new Lyric({
                onPlay: (line, text) => {
                    this.SET_CURRENT_LYRIC(text);
                },
            })
        },

        loadLrcFile() {
            // console.log(this.currentPlayingFile.subtitles);
            if (this.currentPlayingFile.subtitles) {
                const lrcFiles = this.currentPlayingFile.subtitles.filter(lrcFile => {
                    if (lrcFile.title.substring(lrcFile.title.lastIndexOf(".")) === '.lrc') {
                        return lrcFile
                    }
                })
                const highestPercentage = lrcFiles.reduce((max, obj) => max.percentage > obj.percentage ? max : obj);
                console.log(highestPercentage);
                const currSubIndex = lrcFiles.findIndex(item => item.mediaStreamUrl === highestPercentage.mediaStreamUrl)
                this.SET_CURR_SUB_INDEX(currSubIndex)
                this.SET_HAVE_SUBTITLE(true)
                console.log('currentSubtitleIndex', this.currentSubtitleIndex);
                this.$axios.get(highestPercentage.mediaStreamUrl)
                .then(res => {
                    if (res.data) {
                        this.lrcAvailable = true
                        console.log('Subtitle loaded successful');
                        this.lrcObj.setLyric(res.data)
                        if (this.playing) {
                            this.lrcObj.play(this.player.currentTime * 1000);
                        }
                    }
                    else {
                        this.showErrNotif('Load subtitle error')
                        this.lrcAvailable = false;
                        this.lrcObj.setLyric('');
                        this.SET_CURRENT_LYRIC('');
                    }
                })
                .catch(err => {
                    console.error(err)
                    if (err.response) {
                        if (err.response.status === 401) {
                            this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`);
                        }
                    }
                    else {
                        this.showErrNotif(err.message || err);
                    }
                })
            }
            else {
                this.SET_HAVE_SUBTITLE(false)
                this.lrcAvailable = false;
                this.lrcObj.setLyric('');
                this.SET_CURRENT_LYRIC('');
                this.SET_CURR_SUB_INDEX(-1)
            }
        },

        calSamePrc(subtitleFiles) {
            const subFilePrc = subtitleFiles.map(file => {
                const name1 = file.title.slice(0, file.title.lastIndexOf("."))
                const currPlayName = this.currentPlayingFile.title.slice(0, this.currentPlayingFile.title.lastIndexOf("."))
                const distance = levenshtein.get(name1, currPlayName);
                const maxLength = Math.max(name1.length, currPlayName.length);

                const namePrc = (1 - distance / maxLength) * 100;

                if (file.duration === 'noContent') {
                    return {
                    title: file.title,
                    mediaStreamUrl: file.mediaStreamUrl,
                    mediaDownloadUrl: file.mediaDownloadUrl,
                    percentage: namePrc
                    }
                }
                else {
                    const duration1 = file.duration
                    const currPlayDuration = this.currentPlayingFile.duration
                    // console.log(currPlayDuration);

                    const diff = Math.abs(duration1 - currPlayDuration);
                    const maxLength = Math.max(duration1, currPlayDuration);
                    const durationPrc = (1 - diff / maxLength) * 100;
                    const combPrc = (0.8 * durationPrc) + (0.2 * namePrc)
                    return {
                        title: file.title,
                        mediaStreamUrl: file.mediaStreamUrl,
                        mediaDownloadUrl: file.mediaDownloadUrl,
                        percentage: combPrc
                    }
                }
            })
            return subFilePrc
        },
    },

    mounted() {
        if (this.$q.localStorage.getItem('volume')) {
            this.SET_VOLUME(this.player.volume = this.$q.localStorage.getItem('volume'));
        }
        else {
            this.SET_VOLUME(this.player.volume = 0.5);
        }

        this.initLrcObj()
        if (this.source) {
            this.loadLrcFile()
        }
    }
}
</script>