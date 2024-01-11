<template>
    <div>
        <vue-plyr ref="plyr" 
            :options="options"
            @canplay="onCanPlay()"
            @timeupdate="timeUpdate()"
            @ended="onEnded()"
            @seeked="onSeeked()"
            @waiting="onWaiting()"
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
import NotifyMixin from '../mixins/Notification.js'
import srtParser2 from "srt-parser-2";
import { WebVTTParser } from 'webvtt-parser';
import { parse } from 'ass-compiler';

export default {
    name: 'AudioElement',

    mixins: [NotifyMixin],

    data() {
        return {
            lrcObj: null,
            lrcAvailable: false,
            options: {
                controls: ['progress'],
                iconUrl: '/plyr.svg'
            }
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
            'currentSubtitleIndex',
            'userSetCurrentSubtitleIndex',
            'pipEnable',
            'currentLyric',
            'currentCMPLyrics',
            'isVideoMode'
        ]),

        ...mapState(useSubtitleFiles, [
            'subtitleFiles'
        ]),

        player() {
            return this.$refs.plyr.player
        },

        source() {
            if (this.currentPlayingFile.mediaStreamUrl) {
                if (this.currentPlayingFile.title.substring(this.currentPlayingFile.title.lastIndexOf(".")).match(/\bmp4\b|\bavi\b|/i)) {
                    this.SET_VIDEO_MODE(true)
                }
                
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

                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: this.currentPlayingFile.title,
                        artist: this.currentPlayingFile.hash.split('/')[0],
                        album: this.currentPlayingFile.workTitle,
                    });

                    navigator.mediaSession.setActionHandler('play', () => {
                        console.log('Play action triggered');
                        this.PLAY()
                    });

                    navigator.mediaSession.setActionHandler('pause', () => {
                        console.log('Pause action triggered');
                        this.PAUSE()
                    });

                    navigator.mediaSession.setActionHandler('previoustrack', () => {
                        console.log('"Previous Track" triggered.');
                        this.PREVIOUS_TRACK()
                    });

                    navigator.mediaSession.setActionHandler('nexttrack', () => {
                        console.log('"Next Track" triggered.');
                        this.NEXT_TRACK()
                    });
                }
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

        userSetCurrentSubtitleIndex(index) {
            this.loadLrcFile(true, index)
        },
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
            'SET_HAVE_SUBTITLE',
            'SET_PIP_ENABLE',
            'NEXT_TRACK',
            'SET_CURR_CMP_LYRICS',
            'RESET_SUB_DATA',
            'SET_CURRENT_LYRIC_LINE_NUMBER',
            'SET_VIDEO_MODE'
        ]),

        onWaiting() {
            console.log('waiting and sub paused');
            this.lrcObj.pause();
        },

        resetPlayer() {
            this.player.source = null
            console.log('Player reloaded');
        },
        
        onCanPlay() {
            this.SET_DURATION(this.player.duration)

            if (this.playing && this.player.currentTime !== this.player.duration) {
                this.player.play()

                if (this.currentCMPLyrics.length) {
                    this.playLrc(this.playing)
                    console.log('lrc playing');
                }
                
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
                    this.SET_CURRENT_LYRIC_LINE_NUMBER(line)
                },
                onSetLyric: (lines) => {
                    // lines are in String[]
                    this.SET_CURR_CMP_LYRICS(lines)
                    // console.log(this.currentCMPLyrics);
                }
            })
        },

        loadLrcFile(changeSub = false, index) {
            // console.log(this.currentPlayingFile.subtitles);
            if (this.currentPlayingFile.subtitles) {
                if (!changeSub) {
                    const subFiles = this.currentPlayingFile.subtitles.filter(subFile => {
                        if (subFile.title.substring(subFile.title.lastIndexOf(".")) === '.lrc' 
                        || subFile.title.substring(subFile.title.lastIndexOf(".")) === '.srt'
                        || subFile.title.substring(subFile.title.lastIndexOf(".")) === '.vtt'
                        || subFile.title.substring(subFile.title.lastIndexOf(".")) === '.ass') {
                            return subFile
                        }
                    })
                    const highestPercentage = subFiles.reduce((max, obj) => max.percentage > obj.percentage ? max : obj);
                    console.log(highestPercentage);
                    if (highestPercentage.percentage === 0) {
                        console.log('Auto selected subtitle match percentage is 0, let user decide which subtitle to use.');
                        // Since the work has subtitle
                        this.SET_HAVE_SUBTITLE(true)

                        // In case when user switch from auto selected subtitle works
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                        return
                    }
                    const currSubIndex = subFiles.findIndex(item => item.mediaStreamUrl === highestPercentage.mediaStreamUrl)
                    this.SET_CURR_SUB_INDEX(currSubIndex)
                    this.SET_HAVE_SUBTITLE(true)
                    console.log('currentSubtitleIndex', this.currentSubtitleIndex);
                    const subType = highestPercentage.title.substring(highestPercentage.title.lastIndexOf('.'))
                    const subUrl = highestPercentage.mediaStreamUrl
                    if (subType === '.lrc') {
                        this.isLRC(subUrl, changeSub)
                    }
                    else if (subType === '.srt') {
                        this.isSRT(subUrl, changeSub)
                    }
                    else if (subType === '.vtt') {
                        this.isVTT(subUrl, changeSub)
                    }
                    else if (subType === '.ass') {
                        this.isASS(subUrl, changeSub)
                    }
                }
                else {
                    const subUrl = this.currentPlayingFile.subtitles[index].mediaStreamUrl
                    const subType = this.currentPlayingFile.subtitles[index].title
                        .substring(this.currentPlayingFile.subtitles[index].title.lastIndexOf('.'))
                    console.log('subUrl', subUrl, 'subType', subType)
                    if (subType === '.lrc') {
                        this.isLRC(subUrl, changeSub)
                    }
                    else if (subType === '.srt') {
                        this.isSRT(subUrl, changeSub)
                    }
                    else if (subType === '.vtt') {
                        this.isVTT(subUrl, changeSub)
                    }
                    else if (subType === '.ass') {
                        this.isASS(subUrl, changeSub)
                    }
                }
                
            }
            else {
                this.lrcAvailable = false;
                this.lrcObj.setLyric('');
                this.RESET_SUB_DATA()
            }
        },

        secondsToLrcFormat(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            const hundredths = Math.floor((seconds - Math.floor(seconds)) * 100);

            return `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}]`;
        },

        isLRC(subUrl, changeSub) {
            this.$axios.get(subUrl)
            .then(res => {
                if (res.data) {
                    if (changeSub) {
                        console.log('Selected LRC loaded successful');
                        this.lrcAvailable = true
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                    }
                    else {
                        this.lrcAvailable = true
                        console.log('LRC loaded successful');
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                    }

                    this.lrcObj.setLyric(res.data)

                    // Then save lrc-file-parser processed lrc array to store.


                    // this.SET_CURR_CMP_LYRICS(res.data)
                    if (this.playing && this.player.duration) {
                        this.lrcObj.play(this.player.currentTime * 1000);
                    }
                }
                else {
                    this.showErrNotif('LRC loaded failed')
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
        },

        isSRT(subUrl, changeSub) {
            this.$axios.get(subUrl)
            .then(res => {
                if (res.data) {
                    if (changeSub) {
                        console.log('Selected SRT loaded successful');
                        this.lrcAvailable = true
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                        this.SET_CURR_CMP_LYRICS('')
                    }
                    else {
                        console.log('SRT loaded successful');
                        this.lrcAvailable = true
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                        this.SET_CURR_CMP_LYRICS('')
                    }
                    
                    const parser = new srtParser2();
                    const srtArr = parser.fromSrt(res.data);
                    let lrc = []
                    srtArr.map(text => {
                        const lrcText = `${this.secondsToLrcFormat(text.startSeconds)}${text.text}`
                        lrc.push(lrcText)
                        const endtime = `${this.secondsToLrcFormat(text.endSeconds)}`
                        lrc.push(endtime)
                    })
                    const lrcContent = lrc.join('\n');
                    res.data = lrcContent
                    this.lrcObj.setLyric(res.data)
                    // this.SET_CURR_CMP_LYRICS(res.data)
                    if (this.playing && this.player.duration) {
                        this.lrcObj.play(this.player.currentTime * 1000);
                    }
                }
                else {
                    this.showErrNotif('SRT loaded failed')
                    this.lrcAvailable = false;
                    this.lrcObj.setLyric('');
                    this.SET_CURRENT_LYRIC('');
                    this.SET_CURR_CMP_LYRICS('')
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
        },

        isVTT(subUrl, changeSub) {
            this.$axios.get(subUrl)
            .then(res => {
                if (res.data) {
                    if (changeSub) {
                        console.log('Selected VTT loaded successful');
                        this.lrcAvailable = true
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                        this.SET_CURR_CMP_LYRICS('')
                    }
                    else {
                        console.log('VTT loaded successful');
                        this.lrcAvailable = true
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                        this.SET_CURR_CMP_LYRICS('')
                    }

                    const parser = new WebVTTParser();
                    const tree = parser.parse(res.data, 'metadata');
                    const lrc = []
                    tree.cues.map(cue => {
                        const lrcText = `${this.secondsToLrcFormat(cue.startTime)}${cue.text}`
                        lrc.push(lrcText)
                        const endTime = this.secondsToLrcFormat(cue.endTime)
                        lrc.push(endTime)
                    })
                    const lrcContent = lrc.join('\n')
                    res.data = lrcContent
                    this.lrcObj.setLyric(res.data)
                    // this.SET_CURR_CMP_LYRICS(res.data)
                    if (this.playing && this.player.duration) {
                        this.lrcObj.play(this.player.currentTime * 1000);
                    }
                }
                else {
                    this.showErrNotif('VTT loaded failed')
                    this.lrcAvailable = false;
                    this.lrcObj.setLyric('');
                    this.SET_CURRENT_LYRIC('');
                    this.SET_CURR_CMP_LYRICS('')
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
        },

        isASS(subUrl, changeSub) {
            this.$axios.get(subUrl)
            .then(res => {
                if (res.data) {
                    if (changeSub) {
                        console.log('Selected ASS loaded successful');
                        this.lrcAvailable = true
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                        this.SET_CURR_CMP_LYRICS('')
                    }
                    else {
                        console.log('ASS loaded successful');
                        this.lrcAvailable = true
                        this.lrcObj.setLyric('')
                        this.SET_CURRENT_LYRIC('')
                        this.SET_CURR_CMP_LYRICS('')
                    }

                    // const dialogue = parsedASS.events.dialogue
                    const parsedASS = parse(res.data);
                    // console.log(parsedASS);
                    const lrc = []
                    parsedASS.events.dialogue.map(dia => {
                        // Remove lrc water mark font to prevent lrc overrun.
                        if (dia.Style?.match(/水印/)) {
                            return
                        }

                        const lrcText = `${this.secondsToLrcFormat(dia.Start)}${dia.Text.combined}`
                        lrc.push(lrcText)
                        const endTime = this.secondsToLrcFormat(dia.End)
                        lrc.push(endTime)
                    })
                    const lrcContent = lrc.join('\n')
                    res.data = lrcContent
                    this.lrcObj.setLyric(res.data)
                    // this.SET_CURR_CMP_LYRICS(res.data)
                    if (this.playing && this.player.duration) {
                        this.lrcObj.play(this.player.currentTime * 1000);
                    }
                }
                else {
                    this.showErrNotif('VTT loaded failed')
                    this.lrcAvailable = false;
                    this.lrcObj.setLyric('');
                    this.SET_CURRENT_LYRIC('');
                    this.SET_CURR_CMP_LYRICS('')
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
            console.log('User selected subtitle loaded successful');
        }
    }
}
</script>