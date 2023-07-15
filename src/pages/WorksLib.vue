<template>
    <div>
        <div class="text-h5 text-weight-regular q-ma-md">
            {{ pageTitle }}
            <q-chip removable 
            outline 
            square
            v-model="tag.render" 
            v-for="(tag, index) in searchItems" 
            :key="index" 
            @remove="removeSearchTag(tag.name, index)" 
            color="green" 
            text-color="white"
            style="font-size: 18px;" >
                {{ tag.name }}
            </q-chip>
            <span v-show="totalWorks >= 0">
                ({{ totalWorks }})
            </span>
        </div>
    </div>

    <!-- <q-infinite-scroll @load="requestWorks" :offset="250"> -->
        <div class="row q-px-sm q-pt-sm q-col-gutter-x-md q-col-gutter-y-lg">
            <!-- col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2 -->
            <div class="col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2" v-for="work in works.works" :key="work.rjcode" > 
                <WordCard :work="work" class="fit"/> 
            </div>
        </div>
    <!-- </q-infinite-scroll> -->
    <div class="q-pa-lg flex flex-center ">
        <q-pagination
        v-model="currPage"
        :max="maxPage"
        :max-pages="6"
        direction-links
        @update:model-value="pageChange($event)"
        />
    </div>
</template>

<script>
import { defineComponent} from 'vue';
import WordCard from '../components/WorkCard.vue';

export default defineComponent({
    name: "WorksLib",

    components: {
        WordCard,
    },

    data() {
        return {
            works: [],
            currPage: Number(this.$route.query.page) || 1,
            maxPage: [],
            totalWorks: [],
            pageTitle: '',
            isSearch: false,
            searchItems: [],
            tempList: [],
            tempKeyword: ''

        }
    },

    computed: {
        url() {
            const query = this.$route.query
            if (query.keyword) {
                return `/api/query/work/${query.keyword}`
            }
            else {
                return `/api/query/works`
            }
        },
    },

    watch: {
        url() {
            this.reset()
        },
    },

    methods: {
        pageChange(pageNumber) {
            this.currPage = pageNumber
            // console.log(pageNumber);
            this.resetPageTitle()
            if (this.$route.query.keyword) {
                this.$router.push({path: this.$route.path, query: {
                    keyword: this.$route.query.keyword,
                    page: this.currPage
                }})
            }
            else {
                this.$router.push({path: this.$route.path, query: {
                page: this.currPage
                }})
            }
        },

        requestWorks() {
            if (!this.$route.query.keyword) {
                this.works= []
                // const url = `/api/query/works`
                const params = {
                    page: this.currPage,
                }
                this.$axios.get(this.url, { params })
                .then(val => {
                    if (val.data.pagination.total_works > 0) {
                        const pagination = val.data.pagination
                        this.currPage = pagination.current_page
                        this.maxPage = pagination.max_page
                        this.totalWorks = pagination.total_works

                        const result = val.data
                        this.works = result
                        
                    }
                    else {
                        this.current_page = 1
                        this.maxPage = 1
                        this.totalWorks = 0
                    }
                })
                .catch(err => {
                    this.current_page = 1
                    this.maxPage = 1
                    this.totalWorks = 0
                })
            }
        },

        resetPageTitle() {
            if (this.$route.query.keyword) {
                this.works= []
                this.getSearchItem()
                this.isSearch = true
                this.pageTitle = this.searchItems.length === 0 ? `Search by ${this.$route.query.keyword}` : `Search by `
                //this.pageTitle = this.pageTitle + `${this.$route.query.keyword}`
                const params = {
                    page: this.currPage,
                }

                const url = `/api/query/search/${encodeURIComponent(this.$route.query.keyword)}`
                // console.log(url);
                this.$axios.get(url, { params })
                .then(val => {
                    if (val.data.pagination.total_works > 0) {
                        const pagination = val.data.pagination
                        this.currPage = pagination.current_page
                        this.maxPage = pagination.max_page
                        this.totalWorks = pagination.total_works
                        // console.log(this.totalWorks);

                        const result = val.data
                        this.works = result
                        this.$forceUpdate()
                        
                    }
                    else {
                        // console.log(val.data);
                        this.current_page = 1
                        this.maxPage = 1
                        this.totalWorks = 0
                    }
                })
                .catch(err => {
                    this.current_page = 1
                    this.maxPage = 1
                    this.totalWorks = 0
                })
            }
            else {
                this.pageTitle = 'All works'
                this.requestWorks()
                this.searchItems = []
            }
        },

        getSearchItem() {
            const srMatched = this.$route.query.keyword.match(/[^\$\s]+?(?=\$)/g)
            // console.log(srMatched);
            this.searchItems = []
            if (srMatched) {
                for (let i = 0; i < srMatched.length; i++) {
                    this.searchItems.push(
                        {
                            name: srMatched[i],
                            render: true
                        }
                    )
                }
                // console.log('getSearchItem: SearchItem: ' + this.searchItems.length);
            }
            else {
                this.searchItems = []
            }
        },

        reset() {
            // console.log(this.totalWorks);
            
            this.resetPageTitle()
            this.totalWorks = 0
            this.currPage = 1
            this.requestWorks()
            // console.log(this.totalWorks);
        },

        removeSearchTag(name, index) {
            // console.log(name, index);
            this.searchItems[index].render = false
            this.searchItems.splice(index, 1)
            // console.log(`searchItems: ${this.searchItems.length}`);
            if (this.searchItems.length) {
                for (let i = 0; i < this.searchItems.length; i++) {
                    this.tempList.push(
                        '$' + this.searchItems[i].name + '$'
                    )
                }
                for (let i = 0; i < this.searchItems.length; i++) {
                    this.tempKeyword = this.tempKeyword + this.tempList[i] + ' '
                }
                // console.log('tempList: ' + this.tempList.length);
                // console.log('tempKeyword: ' + this.tempKeyword);
                // console.log(this.tempList, this.tempKeyword);
                this.$router.push(`/works?keyword=${this.tempKeyword}`)
            }
            else {
                this.$router.push(`/works`)
            }
        },
    },

    created() {
        this.resetPageTitle()
    },
})
</script>