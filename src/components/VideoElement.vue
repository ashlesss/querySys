<template>
    <div class="q-pl-lg q-pr-lg q-pb-lg">
        <vue-plyr ref="plyr" 
        >
            <video crossorigin="anonymous">
                <source
                    :src="source"
                />
            </video>
        </vue-plyr>
    </div>
    
</template>
<script>
export default {
    props: {
        queue: {
            type: Object,
            required: true
        },
    },

    data() {
        return {
            localQueue: this.queue,

        }
    },

    watch: {
        queue(val) {
            this.localQueue = val
        },

        source(url) {
            if (url) {
                console.log(url);
                this.resetPlayer()
                this.player.media.load();
            }
        }
    },

    computed: {
        source() {
            if (this.localQueue.videoQueue) {
                return this.localQueue
                .videoQueue.find(video => video.hash === this.localQueue.currentVideoFile.hash).mediaStreamUrl
            }
            else {
                return ''
            }
            
        },

        player() {
            return this.$refs.plyr.player
        }
    },

    methods: {
        resetPlayer() {
            this.player.source = null
            console.log('Player reloaded');
        },
    }
}
</script>
<style>
    .plyr {
        border-radius: 10px;
        overflow: hidden; 
    }
</style>