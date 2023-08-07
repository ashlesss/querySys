<template>
    <q-form @submit="onSubmit" style="width: 260px;" class="absolute-center	q-gutter-md">
        <q-input filled v-model="username" label="Username" class="fit"
            lazy-rules
            :rules="[
                val => val.length >= 5 || 'Username minimum length is 5',
                val => (/^[a-zA-Z0-9_-]{5,15}$/.test(val) || 'Username only allow upper case and lower case alphabet letters and 0-9 numbers. And between 5-15 characters')
            ]"
        />

        <q-input filled type="password" v-model="password" label="Password"  class="fit"
            lazy-rules
            :rules="[
                val => val.length >= 5 || 'Password minimum length is 5',
                val => (/^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{5,20}$/.test(val)) || 'Password must contain at least one lowercase letter, one number, and be between 5-20 characters in length.'
            ]"
        />
        
        <q-btn label="Login" type="submit" color="primary" class="fit" />
    </q-form>
</template>
<script>
import NotifyMixin from '../mixins/Notification.js'
import { mapState, mapActions } from 'pinia'
import { useUserAuthStore } from '../stores/userAuth'

export default {
    name: 'LoginPage',
    
    mixins: [NotifyMixin],

    data() {
        return {
            username: '',
            password: ''
        }
    },

    methods: {
        onSubmit() {
            this.$axios.post('/api/auth/me', {
                username: this.username,
                password: this.password
            })
            .then(res => {
                try {
                    this.$q.localStorage.set('jwt-token', res.data.token)
                    this.$setAxiosHeader(res.data.token)
                    this.showSuccNotif('Login success')
                    this.$router.push('/')
                }
                catch (err) {
                    this.showErrNotif(err.message)
                    // console.log(err);
                }
            })
            .catch(err => {
                if (err.response) {
                    this.showErrNotif(err.response.data.error)
                }
                else {
                    this.showErrNotif(err.message || err)
                }
            })
        }
    }
}
</script>