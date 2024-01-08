<template>
    <div class="row">
        <!-- Video player container -->
        <div class="col-12 col-lg-8">
            <VideoElement :queue="videoQueue" />
        </div>

        <!-- Playlist container -->
        <div class="col-12 col-lg-4">
            <PlaylistElement :queue="videoQueue" />
        </div>
    </div>
</template>
  
  
<script>
import VideoElement from '../components/VideoElement.vue'
import PlaylistElement from '../components/PlaylistElement.vue'

export default {
    components: {
        VideoElement,
        PlaylistElement
    },

    data() {
        return {
            videoQueue: {},
        }
        
    },

    computed: {
        // url() {
        //     if (this.$route.params.id) {
        //         return `/api/query/tracks/${this.$route.params.id}`
        //     }
        //     else {
        //         return ``
        //     }
        // }
    },

    mounted() {
        this.getTracks()
    },

    methods: {
        getTracks() {
            this.$axios.get(`/api/query/tracks/${this.$route.params.id}`)
            .then(res => {
                const files = {};
                for (const item of res.data) {
                    this.findFolder(item, '', files, []);
                }
                
                // console.log(files.currentVideoFile);

                this.videoQueue = files
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
                result.videoQueue = children.filter(child => child.type === 'video')
            }
        },
    }
}
</script>
<style>

</style>