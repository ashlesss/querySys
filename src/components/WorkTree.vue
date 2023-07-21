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
                        <q-item clickable @click="downloadFile(item)">
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

export default{
    name: 'WorkTree',

    props: ['tree', 'goto'],

    data() {
        return {
            path: [],
            userPath: [],
            userAgent: '',
            userPlatform: ''
        }
    },

    // created() {
        
    // },

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
        

        // const arr = [].concat(this.goto);
        // console.log('work_tree goto: ' + arr);
        // // const arr = [].concat(this.goto);
        // arr.length ? this.path = arr : [];
    },

    methods: {
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
            link.target="_blank";
            link.click();
        },

        onClickBreadcrumb (index) {
            this.path = this.path.slice(0, index+1)
        },

        async downloadFolder(item, itemfolderDirName) {
            // console.log(JSON.stringify(item));
            // console.log(item.folderDirName);

            //Request access to the user's file system
            const handle = await window.showDirectoryPicker();
            const itemArr = []
            itemArr.push(item)

            async function extractFilePaths(entry, currentPath, result, handlePath) {
                const newPath = currentPath ? currentPath + '/' + (entry.title ? entry.title : entry.folderDirName) : (entry.title ? entry.title : entry.folderDirName);
                
                if (entry.type === 'folder') {
                    const newDirectoryHandle = await handlePath.getDirectoryHandle(entry.folderDirName, { create: true })
                    // // console.log(newDirectoryHandle);

                    for (const child of entry.children) {
                        await extractFilePaths(child, newPath, result, newDirectoryHandle);
                    }
                } else if (entry.type === 'text' || entry.type === 'audio' || entry.type === 'image' || entry.type === 'other') {
                    // console.log(`currentPath: ${currentPath}`);
                    // console.log(handlePath);
                    // console.log(entry.hash);
                    try {
                        const filename = entry.title.replace('~', '')
                        const fileHandle = await handlePath.getFileHandle(filename, { create: true });

                        const fileUrl = entry.mediaDownloadUrl;
                        const response = await fetch(fileUrl);
                        const fileData = await response.arrayBuffer();

                        // Write the binary data to the file
                        const writable = await fileHandle.createWritable();
                        await writable.write(fileData);
                        await writable.close();
                        console.log(`${entry.title} completed`);
                    }
                    catch(err) {
                        console.log(err);
                    }
                    result.push({ title: entry.title, path: newPath, hash: entry.hash , mediaDownloadUrl: entry.mediaDownloadUrl });
                }
            }

            const fileNamesWithPaths = [];
            for (const entry of itemArr) {
                await extractFilePaths(entry, '', fileNamesWithPaths, handle);
            }
            alert(`All files download completed.`)
            // console.log(fileNamesWithPaths);
            // console.log(itemfolderDirName);
        },

        async downloadFile(item) {
            const handle = await window.showDirectoryPicker();
            // console.log(item);

            try {
                // Need to check more webAPI restricted character.
                const filename = item.title.replace('~', '')
                const fileHandle = await handle.getFileHandle(filename, { create: true });

                const fileUrl = item.mediaDownloadUrl;
                const response = await fetch(fileUrl);
                const fileData = await response.arrayBuffer();

                // Write the binary data to the file
                const writable = await fileHandle.createWritable();
                await writable.write(fileData);
                await writable.close();
                console.log(`${item.title} completed`);
                alert(`${item.title} download completed.`)
            }
            catch(err) {
                console.log(err);
            }
        },

        goToUserPath() {
            this.userPath.forEach(path => {
                // console.log(path);
                this.path.push(path)
            })
        }
        
    }
}

</script>