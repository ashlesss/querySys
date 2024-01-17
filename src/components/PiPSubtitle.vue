<template>
    <div style="width: 1px; height: 1px; overflow: hidden; top: 0; left: 0; position: absolute">
        <canvas id="canvas" style="display: none"></canvas>
        <video id="video" muted playsinline></video>
    </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useAudioPlayerStore } from '../stores/audioPlayer'

export default {
    name: "PiPSubtitle",
    data() {
        return {
            canvas: null,
            video: null,
            pipWindow: null,
            currentPiPStatus: false,
            lastProcessedWindowSize: {
                height: 0,
                width: 0
            },
            resizePatchTimeoutID: null
        }
    },
    computed: {
        ...mapState(useAudioPlayerStore, [
            'playing',
            'pipEnable',
            'currentLyric',
            'currentPlayingFile'
        ])
    },
    watch: {
        playing(flag) {
            if (this.currentPiPStatus) {
                flag ? this.video.play() : this.video.pause();
            }
        },

        pipEnable(flag) {
            if (flag && !this.currentPiPStatus) {
                this.show()
            }
            else if (!flag && this.currentPiPStatus) {
                this.hide()
            }
        },

        currentLyric(lyric) {
            this.setSubtitle(lyric);
            this.video.srcObject.getTracks().forEach(t => t.requestFrame());
        }
    },
    mounted() {
        this.canvas = document.querySelector("#canvas");
        this.video = document.querySelector("#video");
        this.video.addEventListener("pause", () => {
            this.PAUSE()
        }, true);
        this.video.addEventListener("play", () => {
            this.PLAY()
        }, true);
        this.canvas.width = Math.round(2 * window.innerWidth);
        this.canvas.height = Math.round(this.canvas.width / 20 * 3);
        this.setSubtitle("");
        this.video.srcObject = this.canvas.captureStream(0);
        addEventListener("enterpictureinpicture", t => {
            this.currentPiPStatus = true;
            this.SET_PIP_ENABLE(true)
            this.pipWindow = t.pictureInPictureWindow;
            this.pipWindow.onresize = this.onPipWindowResize.bind(this);
            this.onPipWindowResize();
        }, false);
        addEventListener("leavepictureinpicture", () => {
            this.currentPiPStatus = false;
            this.SET_PIP_ENABLE(false)
            this.pipWindow.onresize = null;
        }, false);
    },
    methods: {
        ...mapActions(useAudioPlayerStore, [
            'PLAY',
            'PAUSE',
            'SET_PIP_ENABLE',
            'NEXT_TRACK',
            'PREVIOUS_TRACK'
        ]),

        onPipWindowResize() {
            if (
                Math.abs(this.lastProcessedWindowSize.height - this.pipWindow.height) 
                < 10 && Math.abs(this.lastProcessedWindowSize.width - this.pipWindow.width) < 10
            ) {
                // console.log(this.currentLyric);
                return;
            }
            this.lastProcessedWindowSize = {
                height: this.pipWindow.height,
                width: this.pipWindow.width
            };

            if (this.$q.platform.is.ios || this.$q.platform.is.mac) {
                this.canvas.width = Math.round(this.pipWindow.width * 0.5)
                this.canvas.height = Math.round(this.pipWindow.height * 0.5)
                this.setSubtitle(this.currentLyric)
                this.video.srcObject.getTracks().forEach(track => track.requestFrame())

                if (this.resizePatchTimeoutID) { clearTimeout(this.resizePatchTimeoutID) }

                this.resizePatchTimeoutID = setTimeout(() => {
                this.canvas.width = Math.round(2 * this.pipWindow.width)
                this.canvas.height = Math.round(2 * this.pipWindow.height)
                this.setSubtitle(this.currentLyric)
                this.video.srcObject.getTracks().forEach(track => track.requestFrame())
                }, 500)
            }
            else {
                this.canvas.width = Math.round(2 * this.pipWindow.width);
                this.canvas.height = Math.round(2 * this.pipWindow.height);
                this.setSubtitle(this.currentLyric)
                this.video.srcObject.getTracks().forEach(t => t.requestFrame());
            }
            
        },
        show() {
            if (!this.currentPiPStatus) {
                this.video.play();
                if (typeof this.video.requestPictureInPicture === "function") {
                    this.video.requestPictureInPicture().catch(t => {
                        this.video.pause();
                        this.SET_PIP_ENABLE(false)
                        console.error(t);
                    });
                } else if ("webkitSetPresentationMode" in this.video && typeof this.video.webkitSetPresentationMode === "function") {
                    this.video.webkitSetPresentationMode("picture-in-picture");
                }
            }
        },
        hide() {
            if (this.currentPiPStatus) {
                this.video.pause();
                if (typeof document.exitPictureInPicture === "function") {
                    document.exitPictureInPicture();
                } else if ("webkitSetPresentationMode" in this.video && typeof this.video.webkitSetPresentationMode === "function") {
                    this.video.webkitSetPresentationMode("inline");
                }
            }
        },
        setSubtitle(t) {
            t = t.trim();
            
            const context = this.canvas.getContext("2d");
            const fontSize = this.canvas.width / 20;
            
            // Clear the canvas
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Set canvas background to white
            context.fillStyle = "rgb(0, 0, 0)";
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Set font style for the subtitle
            context.font = `bold ${fontSize}px "-apple-system", "BlinkMacSystemFont", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;
            context.fillStyle = "rgb(255, 255, 255)";
            
            if (t.length <= 18) {
                const textWidth = context.measureText(t).width;
                const xPosition = (this.canvas.width - textWidth) / 2;
                const yPosition = (this.canvas.height - fontSize) / 2.2 + fontSize;
                
                context.fillText(t, xPosition, yPosition);
            } else {
                let firstLineText = t.slice(0, 19);
                let firstLineWidth = context.measureText(firstLineText).width;
                let firstLineX = (this.canvas.width - firstLineWidth) / 2;
                let firstLineY = (this.canvas.height - fontSize) / 1.6;

                context.fillText(firstLineText, firstLineX, firstLineY);

                let secondLineText = t.slice(19);
                let secondLineWidth = context.measureText(secondLineText).width;
                let secondLineX = (this.canvas.width - secondLineWidth) / 2;
                let secondLineY = firstLineY + fontSize + 0.15 * fontSize;

                context.fillText(secondLineText, secondLineX, secondLineY);
            }
        }
    }
}
</script>