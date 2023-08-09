<template>
    <div>
        <q-card class="q-ma-md">
            <q-form @submit="onSubmitRootFolder">
                <q-toolbar>
                    <q-toolbar-title>Add New Voice Folders</q-toolbar-title>
                </q-toolbar>

                <div class="q-pa-sm">
                    <q-input
                        outlined
                        dense
                        v-model="rootFolder.name"
                        required
                        lazy-rules
                        :rules="[val => !config.rootFolders.find(rootFolder => rootFolder.name === val) || 'Folder alias exists, folder alias can not be the same']"
                        label="Folder Alias"
                    />

                    <q-input
                        outlined
                        dense
                        v-model="rootFolder.path"
                        required
                        lazy-rules
                        :rules="[val => !config.rootFolders.find(rootFolder => rootFolder.path === val) || 'Folder path exists, folder path can not be the same']"
                        label="Absolute Path"
                    />

                    <div class="row justify-end">
                        <q-btn type="submit" color="primary" label="添加" />
                    </div>
                </div>
            </q-form>
        </q-card>

        <q-form @submit="onSubmit">
            <q-card class="q-ma-md" v-show="config.rootFolders.length">
                <q-toolbar>
                    <q-toolbar-title>Folder List</q-toolbar-title>
                </q-toolbar>

                <q-list>
                    <q-item v-for="rootFolder in config.rootFolders" :key="rootFolder.name">
                        <q-item-section avatar>
                            <q-icon color="amber" name="folder" />
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{rootFolder.name}}</q-item-label>
                            <q-item-label caption>{{rootFolder.path}}</q-item-label>
                        </q-item-section>

                        <q-item-section avatar>
                            <q-btn flat round color="red" icon="delete" @click="removeFromRootFolders(index)" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>

            <q-card class="q-ma-md">
                <q-toolbar>
                    <q-toolbar-title>Work Cover Folder Path</q-toolbar-title>
                </q-toolbar>

                <div v-if="config.coverUseDefaultPath" class="q-pa-md">Cover path is set to default path, turn "use default cover path" in advance settting off to use customize conver path.</div>
                <q-input v-else outlined dense required v-model="config.img_folder" class="q-pa-sm" />
            </q-card>

            <div class="q-ma-lg row justify-end">
                <q-btn :loading="loading" label="保存" type="submit" color="primary" />
            </div>
        </q-form>
    </div>
</template>
<script>
import { data } from 'autoprefixer';
import NotifyMixin from '../../mixins/Notification.js'

export default {
    name: 'VoiceFolders',

    mixins: [NotifyMixin],

    data() {
        return {
            config: {
                rootFolders: []
            },
            rootFolder: {
                name: '',
                path: ''
            },
            loading: false
        }
    },

    methods: {
        requestConfig() {
            this.$axios.get('/api/config/admin')
            .then(res => {
                this.config = res.data.config
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.status !== 401) {
                        this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
                    }
                }
                else {
                    this.showErrNotif(error.message || error)
                }
            })
        },

        onSubmit() {
            this.loading = true
            this.$axios.put('/api/config/admin', {
                config: this.config
            })
            .then(res => {
                this.showSuccNotif(res.data.info)
                this.loading = false
            })
            .catch(err => {
                this.loading = false
                if (err.response) {
                    this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
                }
                else {
                    this.showErrNotif(err.message || error)
                }
            })
        },

        onSubmitRootFolder() {
            if (this.rootFolder.name !== '' && this.rootFolder.path !== '') {
                this.config.rootFolders.push({
                    name: this.rootFolder.name,
                    path: this.rootFolder.path
                })
                this.rootFolder.name = '',
                this.rootFolder.path = ''
                this.onSubmit()
            }
        },

        removeFromRootFolders(index) {
            this.config.rootFolders.splice(index, 1)
            this.onSubmit()
        }
    },

    created() {
        this.requestConfig()
    }
}
</script>