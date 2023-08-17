<template>
    <div class="q-ma-md">
        <q-breadcrumbs gutter="xs" v-if="path.length">
            <q-breadcrumbs-el>
                <q-btn no-caps flat dense size="md" icon="folder" class="breadcrumb-btn" @click="emptyPath()">
                    <span class="breadcrumb-text">ROOT</span>
                </q-btn>
            </q-breadcrumbs-el>
            
            <q-breadcrumbs-el v-for="(folderName, index) in path"  :key="index"  class="breadcrumb-btn cursor-pointer" >
                <q-btn no-caps flat dense size="md" @click="onClickBreadcrumb(index)">
                    <q-icon name="folder" style="vertical-align: middle;"></q-icon>
                    <span class="breadcrumb-text">{{folderName}}</span>
                </q-btn>
            </q-breadcrumbs-el>
        </q-breadcrumbs>

        <q-card>
            <q-list separator>
                <q-item
                clickable
                v-ripple
                v-for="(item, index) in fatherFolder"
                :key="index"
                :active="item.type === 'audio' && currentPlayingFile.hash === item.hash"
                active-class="text-white bg-teal"
                @click="onClickItem(item)"
                class="non-selectable"
                >
                <q-item-section avatar>
                    <q-icon size="34px" v-if="item.type === 'folder'" color="amber" name="folder" />
                    <q-icon size="34px" v-else-if="item.type === 'text'" color="info" name="description" />
                    <q-icon size="34px" v-else-if="item.type === 'image'" color="orange" name="photo" />
                    <q-icon size="34px" v-else-if="item.type === 'other'" color="info" name="description" />
                    <q-btn v-else round dense color="primary" :icon="playIcon(item.hash)" @click="onClickPlayButton(item.hash)" />
                    <!-- <q-btn v-else round dense color="primary" icon="play_arrow"/> -->
                </q-item-section>

                <q-item-section>
                    <q-item-label lines="2" v-if="item.title">{{ item.title }}</q-item-label>
                    <q-item-label lines="2" v-else-if="item.folderDirName">{{ item.folderDirName }}</q-item-label>
                    <q-item-label v-if="item.children" caption lines="1">{{ `${item.children.length} Item(s)` }}</q-item-label>
                </q-item-section>

                <q-menu
                    v-if="item.type === 'audio' || item.type === 'text' || item.type === 'image' || item.type === 'other'"
                    touch-position
                    context-menu
                    auto-close
                    transition-show="jump-down"
                    transition-hide="jump-up"
                >
                    <q-list separator>
                        <q-item clickable @click="addToQueue(item)" v-if="item.type === 'audio'">
                            <q-item-section>Add to Play List</q-item-section>
                        </q-item>

                        <q-item clickable @click="playNext(item)" v-if="item.type === 'audio'">
                            <q-item-section>Play Next</q-item-section>
                        </q-item>

                        <q-item clickable @click="download(item)">
                            Download File
                        </q-item>
                    </q-list>
                </q-menu>

                <q-menu
                    v-else-if="item.type === 'folder'"
                    touch-position
                    context-menu
                    auto-close
                    transition-show="jump-down"
                    transition-hide="jump-up"
                >
                    <q-list separator>
                        <q-item clickable @click="downloadFolder(item, item.folderDirName)">
                            Download Folder
                        </q-item>
                    </q-list>
                </q-menu>

                </q-item>
            </q-list>
        </q-card>
    </div>
    
</template>

<script>

import { mapState, mapActions } from 'pinia'
import { useDownloadCardStore } from '../stores/downloadCard'
import { useAudioPlayerStore } from '../stores/audioPlayer'
// import { useSubtitleFiles } from '../stores/subtitleFiles'
import levenshtein from 'fast-levenshtein';

export default{
    name: 'WorkTree',

    props: ['tree', 'goto'],

    data() {
        return {
            path: [],
            userPath: [],
            userAgent: '',
            userPlatform: '',
            userPathLen: 0,
            totalDownloadedSize: 0,
            previousDownloadedSize: 0,
            fileSize: 0
        }
    },

    computed: {
        fatherFolder() {
            try {
                let fatherFolder = this.tree.concat()
                this.path.forEach(folderName => {
                    fatherFolder = fatherFolder.find(item => item.type === 'folder' && item.folderDirName === folderName).children
                })
                return fatherFolder
            }
            catch(err) {
                return []
            }
        },

        ...mapState(useDownloadCardStore, [
            'fileListStore',
            'isCalculatingSizeStore',
            'doneListStore',
        ]),

        ...mapState(useAudioPlayerStore, [
            'currentPlayingFile',
            'GET_PLAYING',
            'queue',
            'queueIndex',
            'GET_QUEUE'
        ]),

        // ...mapState(useSubtitleFiles, [
        //     'subtitleFiles'
        // ]),

        queueLocal() {
            const queueLocal = []
            const subtitles = []
            for (let file of this.tree) {
                this.extractSubtitleFile(file, '', subtitles)
            }
            
            this.fatherFolder.forEach(item => {
                if (item.type === 'audio') {
                    // console.log(subtitles);
                    if (subtitles.length !== 0) {
                        const subWPrc = this.calSamePrc(subtitles, item)
                        item.subtitles = subWPrc
                        queueLocal.push(item)
                    }
                    else {
                        queueLocal.push(item)
                    }
                }
            })
            // console.log(queueLocal);
            // console.log('queue', queue);
            return queueLocal
        }
    },

    watch: {
        // path() {
        //     // console.log(this.path);
        //     this.$emit('path_up', this.path)
        // },

        $route(data) {
            if (data.query && data.query.path) {
                // console.log(JSON.parse(data.query.path));
                const routePath = JSON.parse(data.query.path)
                // console.log('routePathLen', routePath.length, 'userPathLen', this.userPathLen);
                if (routePath.length <= this.userPathLen) {
                    this.path = []
                    this.userPath = routePath
                    this.goToUserPath()
                }
            }
            else {
                this.path = []
                this.userPath = []
                this.goToUserPath()
            }
        }
    },

    mounted() {
        this.userAgent = navigator.userAgent;
        this.getUserPlatform()
        try {
            if (JSON.parse(this.goto).length) {
                this.userPath = JSON.parse(this.goto)
                this.userPathLen = this.userPath.length
            }
            else {
                this.userPath = []
                this.userPathLen = 0
            }
            this.goToUserPath()
        }
        catch(err) {
            console.log('No path set on url');
        }
    },

    created() {
        this.backgroundDownloadSpeedMonitor()
    },

    methods: {
        ...mapActions(useDownloadCardStore, [
            'CAL_FILE_SIZE',
            'SET_IS_CAL_SIZE_FALSE',
            'GET_CURR_JOB_INDEX',
            'GET_DONE_FILES',
            'PROGRESS_VALUE',
            'DOWNLOAD_COMPLETED',
            'RESET',
            'GET_REAL_TIME_SIZE',
            'CLOSE_DOWNLOAD_CARD',
            'GET_FILES',
            'GET_DOWNLOAD_SPEED',
            'SET_SEAMLESS'
        ]),

        ...mapActions(useAudioPlayerStore ,[
            'SET_QUEUE',
            'TOGGLE_PLAYING',
            'PLAY_NEXT',
            'ADD_TO_QUEUE',
            'PLAY',
            'SET_SUB_FILES'
        ]),

        // ...mapActions(useSubtitleFiles, [
        //     'SAVE_SUB_FILES'
        // ]),

        // initPath () {
        //     const initialPath = []
        //     let fatherFolder = this.tree.concat()
        //     while (fatherFolder.length === 1) {
        //         if (fatherFolder[0].type === 'audio') {
        //         break
        //         }
        //         initialPath.push(fatherFolder[0].title)
        //         fatherFolder = fatherFolder[0].children
        //     }
        //     console.log(fatherFolder);
        //     // this.path = initialPath
        // },

        getUserPlatform() {
            if (this.userAgent.includes('Win')) {
                this.userPlatform = 'Windows'
            }
            else if (this.userAgent.includes('Mac')) {
                this.userPlatform = 'Macintosh'
            }
            else if (this.userAgent.includes('Android')) {
                this.userPlatform = 'Android'
            }
            else if (this.userAgent.includes('Linux')) {
                this.userPlatform = 'Linux'
            }
        },

        onClickItem(item) {
            if (item.type === 'folder') {
                this.path.push(item.folderDirName)
                this.$emit('path_down', this.path)
                this.userPathLen = this.path.length
            }
            else if (item.type ==='text' || item.type === 'image') {
                this.openFile(item)
            }
            else if (item.type === 'other' || item.type === 'mp4') {
                this.download(item);
            }
            else if (this.currentPlayingFile.hash !== item.hash) {
                this.SET_QUEUE({
                    queue: this.queueLocal.concat(),
                    index: this.queueLocal.findIndex(file => file.hash === item.hash),
                    resetPlaying: true,
                })
            }
        },

        calSamePrc(subtitleFiles, currentFile) {
            const subFilePrc = subtitleFiles.map(file => {
                const name1 = file.title.slice(0, file.title.lastIndexOf("."))
                const currPlayName = currentFile.title.slice(0, currentFile.title.lastIndexOf("."))
                const distance = levenshtein.get(name1, currPlayName);
                const maxLength = Math.max(name1.length, currPlayName.length);

                const namePrc = (1 - distance / maxLength) * 100;

                if (file.duration === 'noContent') {
                    return {
                    title: file.title,
                    mediaStreamUrl: file.mediaStreamUrl,
                    mediaDownloadUrl: file.mediaDownloadUrl,
                    percentage: namePrc,
                    duration: -1
                    }
                }
                else {
                    const duration1 = file.duration
                    const currPlayDuration = currentFile.duration

                    const diff = Math.abs(duration1 - currPlayDuration);
                    const maxLength = Math.max(duration1, currPlayDuration);
                    const durationPrc = (1 - diff / maxLength) * 100;
                    const combPrc = (0.8 * durationPrc) + (0.2 * namePrc)
                    return {
                        title: file.title,
                        mediaStreamUrl: file.mediaStreamUrl,
                        mediaDownloadUrl: file.mediaDownloadUrl,
                        percentage: combPrc,
                        duration: file.duration
                    }
                }
            })
            const sortedPrc = subFilePrc.sort((a, b) => b.percentage - a.percentage)
            return sortedPrc
        },

        onClickPlayButton (hash) {
            if (this.currentPlayingFile.hash === hash) {
                this.TOGGLE_PLAYING()
            } else {
                this.SET_QUEUE({
                    queue: this.queueLocal.concat(),
                    index: this.queueLocal.findIndex(file => file.hash === hash),
                    resetPlaying: true
                })
            }
        },

        playIcon (hash) {
            return this.GET_PLAYING && this.currentPlayingFile.hash === hash ? "pause" : "play_arrow"
        },

        openFile (file) {
            // const token = this.$q.localStorage.getItem('jwt-token') || '';
            // Fallback to old API for an old backend 
            // const url = file.mediaStreamUrl ? `${file.mediaStreamUrl}?token=${token}` : `/api/media/stream/${file.hash}?token=${token}`;
            const token = this.$q.localStorage.getItem('jwt-token') || '';
            const url = file.mediaStreamUrl ? `${file.mediaStreamUrl}?token=${token}` : `/api/media/stream${file.hash}?token=${token}`
            const link = document.createElement('a');
            link.href = url;
            link.target="_blank";
            link.click();
        },

        download (file) {
            // const token = this.$q.localStorage.getItem('jwt-token') || '';
            // Fallback to old API for an old backend 
            // const url = file.mediaDownloadUrl ? `${file.mediaDownloadUrl}?token=${token}` : `/api/media/download/${file.hash}?token=${token}`;
            // const token = this.$q.localStorage.getItem('jwt-token') ? `?token=${this.$q.localStorage.getItem('jwt-token')}` : ''
            const token = this.$q.localStorage.getItem('jwt-token') || '';
            const url = file.mediaDownloadUrl ? `${file.mediaDownloadUrl}?token=${token}` : `/api/media/download${file.hash}?token=${token}`
            const link = document.createElement('a');
            link.href = url;
            link.target="_blank";
            // link.setAttribute('download', file.title)
            link.click();

        },

        onClickBreadcrumb (index) {
            this.path = this.path.slice(0, index+1)
            this.$emit('path_up', this.path)
        },

        emptyPath() {
            this.path = []
            this.$emit('path_up', this.path)
        },

        extractFile(entry, currentPath, result) {
            const newPath = currentPath ? currentPath + '/' + (entry.title ? entry.title : entry.folderDirName) : (entry.title ? entry.title : entry.folderDirName);
            
            if (entry.type === 'folder') {

                for (const child of entry.children) {
                    this.extractFile(child, newPath, result);
                }
            } else if (entry.type === 'text' || entry.type === 'audio' || entry.type === 'image' || entry.type === 'other') {
                result.push({ title: entry.title, mediaDownloadUrl: entry.mediaDownloadUrl });
            }
        },

        async extractFilePaths(entry, currentPath, result, handlePath) {
            const newPath = currentPath ? currentPath + '/' + (entry.title ? entry.title : entry.folderDirName) : (entry.title ? entry.title : entry.folderDirName);
            
            if (entry.type === 'folder') {
                const newDirectoryHandle = await handlePath.getDirectoryHandle(entry.folderDirName, { create: true })
                // // console.log(newDirectoryHandle);

                for (const child of entry.children) {
                    await this.extractFilePaths(child, newPath, result, newDirectoryHandle);
                }
            } 
            else if (entry.type === 'text' || entry.type === 'audio' || entry.type === 'image' || entry.type === 'other') {
                // console.log(`currentPath: ${currentPath}`);
                // console.log(handlePath);
                // console.log(entry.hash);
                try {
                    const filename = entry.title.replace('~', '')
                    const fileHandle = await handlePath.getFileHandle(filename, { create: true });

                    const fileUrl = entry.mediaDownloadUrl;

                    const currentJob = result.length
                    // this.$emit('current_job', currentJob)
                    this.GET_CURR_JOB_INDEX(currentJob)


                    const downloadStatus = await this.downloadAndSaveFile(fileUrl, fileHandle, entry.title)

                    if (downloadStatus === 'success') {
                        this.GET_DONE_FILES('done')
                        this.PROGRESS_VALUE()
                        if (this.doneListStore.length === this.fileListStore.length) {
                            this.DOWNLOAD_COMPLETED()
                        }
                        console.log(`${entry.title} completed`);
                    }
                    else {
                        this.GET_DONE_FILES('failed')
                    }

                    // this.$emit('job_done', 'done')
                    // this.GET_DONE_FILES('done')
                    // this.PROGRESS_VALUE()
                    // if (this.doneListStore.length === this.fileListStore.length) {
                    //     this.DOWNLOAD_COMPLETED()
                    // }
                    // console.log(`${entry.title} completed`);
                }
                catch(err) {
                    console.log(`ERR: ${entry.title}`);
                }
                result.push({ title: entry.title, path: newPath, hash: entry.hash , mediaDownloadUrl: entry.mediaDownloadUrl });
            }
        },

        async downloadAndSaveFile(url, fileHandle, fileName) {
            let speedReportInterval
            const header = {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': this.$q.localStorage.getItem('jwt-token') 
                    ? `Bearer ${this.$q.localStorage.getItem('jwt-token')}` : ''
            }
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: header
                });
                let downloaded = 0;
                // const startTime = Date.now();
                const contentLength = response.headers.get('Content-Length');
                this.fileSize = contentLength

                // Create a writable stream to save the file
                const writableStream = await fileHandle.createWritable();
                // const writableStream = await createWritable();

                // Create a ReadableStream from the response body
                const reader = response.body.getReader();

                // speedReportInterval = setInterval(() => {
                //     const durationInSeconds = (Date.now() - startTime) / 1000;
                //     const bytesPerSecond = downloaded / durationInSeconds;
                //     this.GET_DOWNLOAD_SPEED(bytesPerSecond)
                //     this.GET_REAL_TIME_SIZE(this.calSizeUnit(contentLength, downloaded))
                // }, 500);

                // Start reading the response stream and write the chunks to the file
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // clearInterval(speedReportInterval)
                        // const durationInSeconds = (Date.now() - startTime) / 1000;
                        // const bytesPerSecond = downloaded / durationInSeconds;
                        // this.GET_DOWNLOAD_SPEED(bytesPerSecond)
                        this.GET_REAL_TIME_SIZE(this.calSizeUnit(contentLength, downloaded))
                        this.previousDownloadedSize = 0
                        break
                    }
                    
                    downloaded += value.length;
                    this.totalDownloadedSize = downloaded
                    // this.$emit('progress', downloaded)
                    // this.GET_REAL_TIME_SIZE(downloaded)
                    // Write the chunk to the file
                    await writableStream.write(value);
                }

                // Close the writable stream
                await writableStream.close();
                return 'success'
            }
            catch(err) {
                if (err.response && err.response.status === 401) {
                    console.error(`${err.response.status} No token provided or token invalided.`);
                    console.log(`ERR: ${fileName}, URL: ${url}, err: ${err}`);
                    if (speedReportInterval) {
                        clearInterval(speedReportInterval)
                    }
                    return 'failed'
                }
                else {
                    console.log(`ERR: ${fileName}, URL: ${url}, err: ${err}`);
                    if (speedReportInterval) {
                        clearInterval(speedReportInterval)
                    }
                    return 'failed'
                }
            }
        },

        backgroundDownloadSpeedMonitor() {
            this.downloadInterval = setInterval(() => {
                const bytesDownloaded = this.totalDownloadedSize - this.previousDownloadedSize;
                
                if (bytesDownloaded <= 0) {
                    // this.downloadSpeed = '';
                    this.GET_DOWNLOAD_SPEED(0)
                } else {
                // const unit = this.getUnits(bytesDownloaded);
                    // this.downloadSpeed = `${this.formatSize(bytesDownloaded, unit)} ${unit}/s`;
                    this.GET_DOWNLOAD_SPEED(bytesDownloaded)
                    this.GET_REAL_TIME_SIZE(this.calSizeUnit(this.fileSize, this.totalDownloadedSize))
                }
                
                this.previousDownloadedSize = this.totalDownloadedSize;
            }, 1000);
        },

        async downloadFolder(item, itemfolderDirName) {

            // Get items from user selected folder.
            this.RESET()
            const itemArr = []
            itemArr.push(item)

            // Start download files in folder
            try {

                const files = [];
                for (const entry of itemArr) {
                    this.extractFile(entry, '', files);
                }
                // console.log('files', files);
                // this.$emit('file_list', files)
                this.GET_FILES(files)

                await this.getFileSize(files)

                const handle = await this.getDirectoryHandleOrPromptUser()
                const handler = await handle.getDirectoryHandle(this.$route.params.id, {create: true})

                const fileNamesWithPaths = [];
                for (const entry of itemArr) {
                    await this.extractFilePaths(entry, '', fileNamesWithPaths, handler);
                }
                
            }
            catch(err) {
                if (err instanceof DOMException) {
                    console.error(err);
                    this.CLOSE_DOWNLOAD_CARD()
                    this.RESET()
                }
                else {
                    console.log(err);
                }
            }
        },

        async getSavePath() {
            try {
                const directory = await window.showDirectoryPicker({
                    startIn: "downloads",
                    mode: "readwrite"
                });

                const permissionStatus = await directory.queryPermission({ mode: "readwrite" });
                if (permissionStatus === 'granted' || await directory.requestPermission({ mode: "readwrite" }) === 'granted') {
                    return directory;
                }
            } catch (error) {
                throw error; 
            }
        },

        async getDirectoryHandleOrPromptUser() {
            try {
                return await this.getSavePath()
            } catch (error) {
                if (!error.message.includes("The user aborted a request.") &&
                    (error.message.includes("Must be handling a user gesture to show a file picker") ||
                     error.message.includes("User activation is required"))) {
                    return await new Promise(resolve => {
                        this.$q.dialog({
                            title: 'Select download path',
                            cancel: false,
                            persistent: true,
                            ok: {
                                label: "select"
                            }
                        }).onOk(() => {
                            resolve(this.getSavePath());
                        });
                    });
                }
                throw error;
            }
        },

        goToUserPath() {
            this.userPath.forEach(path => {
                // console.log(path);
                this.path.push(path)
            })
        },

        async getFileSize(files) {
            const notif = this.$q.notify({
                group: false, // required to be updatable
                timeout: 0, // we want to be in control when it gets dismissed
                spinner: true,
                message: 'Getting ready...',
                caption: '0%'
            })
            let percentage = 0
            try {
                for (let i = 0; i < files.length; i++) {
                    const fileUrl = files[i].mediaDownloadUrl;
                    const header = {
                        'Authorization': this.$q.localStorage.getItem('jwt-token') 
                            ? `Bearer ${this.$q.localStorage.getItem('jwt-token')}` : ''
                    }
                    const response = await fetch(fileUrl, {
                        method: 'HEAD',
                        headers: header
                    })
                    const contentLength = response.headers.get('Content-Length');
                    // console.log(contentLength);
                    this.CAL_FILE_SIZE(Number(contentLength))
                    percentage = Math.floor((i / (files.length - 1)) * 100)
                    notif({
                        caption: `${percentage}%`
                    })
                }
                this.SET_IS_CAL_SIZE_FALSE()
                notif({
                    icon: 'done', // we add an icon
                    spinner: false, // we reset the spinner setting so the icon can be displayed
                    message: 'Ready!',
                    color: 'positive',
                    timeout: 2000 // we will timeout it in 2.5s
                })
                this.SET_SEAMLESS(true)
            }
            catch(err) {
                console.error(err);
            }
        },

        addToQueue (file) {
            const subtitles = []
            for (let file of this.tree) {
                this.extractSubtitleFile(file, '', subtitles)
            }

            const subWPrc = this.calSamePrc(subtitles, file)
            console.log(subWPrc);
            if (subWPrc.length !== 0) {
                file.subtitles = subWPrc
                this.ADD_TO_QUEUE(file)
            }
            else {
                this.ADD_TO_QUEUE(file)
            }
            
        },
        
        playNext (file) {
            const subtitles = []
            for (let file of this.tree) {
                this.extractSubtitleFile(file, '', subtitles)
            }

            const subWPrc = this.calSamePrc(subtitles, file)
            console.log(subWPrc);

            let arrs = this.GET_QUEUE

            if (subWPrc.length !== 0) {
                file.subtitles = subWPrc
                arrs.splice(this.queueIndex + 1, 0, file);
                this.PLAY_NEXT(arrs)
            }
            else {
                arrs.splice(this.queueIndex + 1, 0, file);
                this.PLAY_NEXT(arrs)
            }
        },

        calSizeUnit(fileSize, downloaded) {
            if (fileSize < 1024) {
                return downloaded
            }
            else if (fileSize < 1048576) {
                return downloaded / 1024
            }
            else if (fileSize < 1073741824) {
                return downloaded / 1048576
            }
            else {
                return downloaded / 1073741824
            }
        },

        extractSubtitleFile(entry, currentPath, result) {
            const newPath = currentPath ? currentPath + '/' + (entry.title ? entry.title : entry.folderDirName) : (entry.title ? entry.title : entry.folderDirName);
            
            if (entry.type === 'folder') {

                for (const child of entry.children) {
                    this.extractSubtitleFile(child, newPath, result);
                }
            } else if (entry.type === 'text') {
                if (entry.title.substring(entry.title.lastIndexOf(".")) !== '.txt') {
                    result.push({
                        title: entry.title, 
                        mediaStreamUrl: entry.mediaStreamUrl, 
                        mediaDownloadUrl: entry.mediaDownloadUrl,
                        duration: entry.duration
                    });
                }
            }
        },
    }
}

</script>

<style lang="scss" scoped>
.breadcrumb-text {
  white-space: normal;
  display: inline-block;
  vertical-align: middle;
  max-width: calc(100% - 24px);
}
</style>