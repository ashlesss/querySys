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
                    <q-item-label v-if="item.children" caption lines="1">{{ `${item.children.length} 项目` }}</q-item-label>
                </q-item-section>

                </q-item>
            </q-list>
        </q-card>
    </div>
    
</template>

<script>

export default{
    name: 'WorkTree',

    props: ['tree'],

    data() {
        return {
            path: [],
        }
    },

    computed: {
        fatherFolder() {
            let fatherFolder = this.tree.concat()
            this.path.forEach(folderName => {
                fatherFolder = fatherFolder.find(item => item.type === 'folder' && item.folderDirName === folderName).children
            })
            return fatherFolder
        }
    },

    methods: {
        onClickIten(item) {
            if (item.type === 'folder') {
                this.path.push(item.folderDirName)
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
    }
}

</script>