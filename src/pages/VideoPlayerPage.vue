<template>
    <div class="row">
        <!-- Video player container -->
        <div class="col-12 col-lg-8">
            <VideoElement v-if="trackLoaded" />
        </div>

        <!-- Playlist container -->
        <div class="col-12 col-lg-4">
            <PlaylistElement v-if="trackLoaded" />
        </div>
    </div>
</template>
  
  
<script>
import VideoElement from '../components/VideoElement.vue'
import PlaylistElement from '../components/PlaylistElement.vue'
import { mapState, mapActions } from 'pinia'
import { useVideoPlayerStore } from '../stores/videoPlayer'

export default {
    components: {
        VideoElement,
        PlaylistElement
    },

    data() {
        return {
            // videoQueue: null,
            trackLoaded: false,
            beforeEnterPath: null
        }
        
    },

    computed: {
        ...mapState(useVideoPlayerStore, [
            'videoMode',
            'videoQueue',
            'currentVideoFile',
            'currentPlayingFileIndex',
            'GET_VIDEO_QUEUE'
        ]),
    },

    beforeRouteEnter(to, from, next) {
        next(vm => {
            if (from.fullPath.match(/\bwork\b/)) {
                vm.beforeEnterPath = from.fullPath
            }

            if (!vm.videoQueue.length) {
                vm.getTracks()
            }
            else {
                vm.trackLoaded = true
            }
        })
    },

    // beforeRouteLeave(to, from, next) {
    //     this.$router.push(this.beforeEnterPath)
    //     next()
    // },

    // mounted() {
    //     if (!this.videoQueue.length) {
    //         this.getTracks()
    //     }
    // },

    methods: {
        ...mapActions(useVideoPlayerStore, [
            'SET_VIDEO_MODE',
            'SET_VIDEO_QUEUE',
            'SET_CURRENT_VIDEO_FILE',
            'SET_CURRENT_PLAYING_VIDEO_FILE_INDEX'
        ]),

        getTracks() {
            this.trackLoaded = false
            this.$axios.get(`/api/query/tracks/${this.$route.params.id}?video=1`)
            .then(res => {
                const files = {};
                for (const item of res.data) {
                    this.findFolder(item, '', files, []);
                }
                
                console.log(JSON.stringify(files.currentVideoFile));
                this.SET_CURRENT_VIDEO_FILE(files.currentVideoFile)

                this.SET_VIDEO_QUEUE({
                    queue: files.videoQueue,
                    index: files.videoQueue.findIndex(file => file.hash === files.currentVideoFile.hash),
                    resetPlaying: true
                })
                this.trackLoaded = true
            })
        },

        findFolder(entry, currentPath, result, children) {
            const newPath = currentPath ? currentPath + '/' + (entry.title ? entry.title : entry.folderDirName) : (entry.title ? entry.title : entry.folderDirName);
            // console.log(newPath);
            if (entry.type === 'folder') {

                for (const child of entry.children) {
                    this.findFolder(child, newPath, result, entry.children);
                }
            } 
            else if (entry.type === 'video' 
            && entry.hash.split('/')[0] === this.$route.params.id 
            && entry.hash.split('/')[1] === this.$route.query.hash) {
                // { title: entry.title, hash: entry.hash, mediaStreamUrl: entry.mediaStreamUrl }
                result.currentVideoFile = { title: entry.title, hash: entry.hash, mediaStreamUrl: entry.mediaStreamUrl }
                if (children.length) {
                    result.videoQueue = children.filter(child => child.type === 'video')
                }
                else {
                    result.videoQueue = [
                        { 
                            title: entry.title, 
                            workTitle: entry.workTitle,
                            hash: entry.hash, 
                            mediaStreamUrl: entry.mediaStreamUrl
                        }
                    ]
                }
            }
        },
    }
}
</script>
<style>

</style>