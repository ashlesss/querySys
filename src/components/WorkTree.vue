<template>
    <div class="q-ma-md " style="">
        <q-breadcrumbs gutter="xs" v-if="path.length">
            <q-breadcrumbs-el>
                <q-btn no-caps flat dense size="md" icon="folder" style="height: 30px;" @click="path = []">ROOT</q-btn>
            </q-breadcrumbs-el>
            
            <q-breadcrumbs-el v-for="(folderName, index) in path"  :key="index"  class="cursor-pointer" >
                <q-btn no-caps flat dense size="md" icon="folder" style="height: 30px;" @click="onClickBreadcrumb(index)">{{folderName}}</q-btn>
            </q-breadcrumbs-el>
        </q-breadcrumbs>

        <q-card>
            <q-list separator>
                <q-item
                clickable
                v-ripple
                v-for="(item, index) in fatherFolder"
                :key="index"
                @click="onClickIten(item)"
                class="non-selectable"
                >
                <q-item-section avatar>
                    <q-icon size="34px" v-if="item.type === 'folder'" color="amber" name="folder" />
                    <q-icon size="34px" v-else-if="item.type === 'text'" color="info" name="description" />
                    <q-icon size="34px" v-else-if="item.type === 'image'" color="orange" name="photo" />
                    <q-icon size="34px" v-else-if="item.type === 'other'" color="info" name="description" />
                    <!-- <q-btn v-else round dense color="primary" :icon="playIcon(item.hash)" @click="onClickPlayButton(item.hash)" /> -->
                    <q-btn v-else round dense color="primary" icon="play_arrow"/>
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

export default{
    name: 'WorkTree',

    props: ['tree', 'goto'],

    data() {
        return {
            path: [],
            userPath: [],
            userAgent: '',
            userPlatform: '',
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
        ])
    },

    watch: {
        path() {
            // console.log(this.path);
            this.$emit('path_up', this.path)
        }
    },

    mounted() {
        this.userAgent = navigator.userAgent;
        this.getUserPlatform()
        try {
            if (JSON.parse(this.goto).length) {
                this.userPath = JSON.parse(this.goto)
            }
            else {
                this.userPath = []
            }
            this.goToUserPath()
        }
        catch(err) {
            console.log('No path set on url');
        }
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
            'GET_FILES'
        ]),

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

        onClickIten(item) {
            if (item.type === 'folder') {
                this.path.push(item.folderDirName)
                this.$emit('path_down', this.path)
            }
            else if (item.type ==='text' || item.type === 'image') {
                this.openFile(item)
            }
            else if (item.type === 'other' || item.type === 'mp4') {
                this.download(item);
            }
        },

        openFile (file) {
            // const token = this.$q.localStorage.getItem('jwt-token') || '';
            // Fallback to old API for an old backend 
            // const url = file.mediaStreamUrl ? `${file.mediaStreamUrl}?token=${token}` : `/api/media/stream/${file.hash}?token=${token}`;
            const url = file.mediaStreamUrl ? `${file.mediaStreamUrl}` : `/api/media/stream${file.hash}`
            const link = document.createElement('a');
            link.href = url;
            link.target="_blank";
            link.click();
        },

        download (file) {
            // const token = this.$q.localStorage.getItem('jwt-token') || '';
            // Fallback to old API for an old backend 
            // const url = file.mediaDownloadUrl ? `${file.mediaDownloadUrl}?token=${token}` : `/api/media/download/${file.hash}?token=${token}`;
            const url = file.mediaStreamUrl ? `${file.mediaStreamUrl}` : `/api/media/stream${file.hash}`
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.title)
            link.target="_blank";
            link.click();

        },

        onClickBreadcrumb (index) {
            this.path = this.path.slice(0, index+1)
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


                    await this.downloadAndSaveFile(fileUrl, fileHandle, entry.title)

                    // this.$emit('job_done', 'done')
                    this.GET_DONE_FILES('done')
                    this.PROGRESS_VALUE()
                    if (this.doneListStore.length === this.fileListStore.length) {
                        this.DOWNLOAD_COMPLETED()
                    }
                    console.log(`${entry.title} completed`);
                }
                catch(err) {
                    console.log(`ERR: ${entry.title}`);
                }
                result.push({ title: entry.title, path: newPath, hash: entry.hash , mediaDownloadUrl: entry.mediaDownloadUrl });
            }
        },

        async downloadAndSaveFile(url, fileHandle, fileName) {
            try {

                const header = {
                    'X-Requested-With': 'XMLHttpRequest'
                }
                const response = await fetch(url, {
                    method: 'GET',
                    headers: header
                });
                let downloaded = 0;

                if (response.ok) {
                    // Create a writable stream to save the file
                    const writableStream = await fileHandle.createWritable();
                    // const writableStream = await createWritable();

                    // Create a ReadableStream from the response body
                    const reader = response.body.getReader();

                    // Start reading the response stream and write the chunks to the file
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break
                        
                        downloaded += value.length;
                        // this.$emit('progress', downloaded)
                        this.GET_REAL_TIME_SIZE(downloaded)
                        // Write the chunk to the file
                        await writableStream.write(value);
                    }

                    // Close the writable stream
                    await writableStream.close();
                }
                else {
                    await retryFetching(url, fileHandle, fileName)
                }
            }
            catch(err) {
                console.log(`ERR: ${fileName}, URL: ${url}, err: ${err}`);
            }
        },

        async downloadFolder(item, itemfolderDirName) {

            // Get items from user selected folder.
            this.RESET()
            const itemArr = []
            itemArr.push(item)

            // Start download files in folder
            try {
                const handle = await window.showDirectoryPicker()
                const handler = await handle.getDirectoryHandle(this.$route.params.id, {create: true})

                const files = [];
                for (const entry of itemArr) {
                    this.extractFile(entry, '', files);
                }
                // console.log('files', files);
                // this.$emit('file_list', files)
                this.GET_FILES(files)

                await this.getFileSize(files)

                const fileNamesWithPaths = [];
                for (const entry of itemArr) {
                    await this.extractFilePaths(entry, '', fileNamesWithPaths, handler);
                }
                
            }
            catch(err) {
                if (err instanceof DOMException) {
                    console.log(err);
                    // this.$emit('DOMException', true)
                    this.CLOSE_DOWNLOAD_CARD()
                }
                else {
                    console.log(err);
                }
            }
        },

        goToUserPath() {
            this.userPath.forEach(path => {
                // console.log(path);
                this.path.push(path)
            })
        },

        async getFileSize(files) {
            for (let i = 0; i < files.length; i++) {
                try {
                    const fileUrl = files[i].mediaDownloadUrl;
                    const response = await fetch(fileUrl, {
                        method: 'HEAD'
                    })
                    const contentLength = response.headers.get('Content-Length');
                    // console.log(contentLength);
                    this.CAL_FILE_SIZE(contentLength)
                    if (i === files.length - 1) {
                        this.SET_IS_CAL_SIZE_FALSE()
                    }
                }
                catch(err) {
                    console.log(err);
                }
            }
        },

        async retryFetching(url, fileHandle, fileName) {
            try {
                console.log('Previous fetch failed, retrying.');
                const response = await fetch(url);
                let downloaded = 0;

                if (response.ok) {
                    // Create a writable stream to save the file
                    const writableStream = await fileHandle.createWritable();
                    // const writableStream = await createWritable();

                    // Create a ReadableStream from the response body
                    const reader = response.body.getReader();

                    // Start reading the response stream and write the chunks to the file
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break
                        
                        downloaded += value.length;
                        // this.$emit('progress', downloaded)
                        this.GET_REAL_TIME_SIZE(downloaded)
                        // Write the chunk to the file
                        await writableStream.write(value);
                    }

                    // Close the writable stream
                    await writableStream.close();
                }
                else {
                    throw Error(`Can't get file on retry, file: ${fileName}`)
                }
            }
            catch(err) {
                console.log(`ERR: ${fileName}, URL: ${url}, err: ${err}`);
            }
        }
        
    }
}

</script>