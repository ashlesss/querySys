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
            <span v-show="totalWorks">
                ({{ totalWorks }})
            </span>
        </div>
    </div>

    <!-- Sorting selector -->
    <div class="row justify-between q-mb-md q-mr-sm q-ml-md">
        <q-select 
        rounded 
        outlined 
        v-model="sortOption" 
        :options="options" 
        label="Sort By"/>
    </div>

    <!-- Load spinner -->
    <div class="column justify-center items-center">
        <q-spinner-dots
          color="primary"
          size="3em"
          v-show="isLoading"
        />
        <q-tooltip :offset="[0, 8]">QSpinnerDots</q-tooltip>
    </div>

    <!-- Works -->
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
        v-show="!isLoading"
        v-model="currPage"
        :max="maxPage"
        :max-pages="6"
        direction-links
        @update:model-value="pageChange($event)"
        />
        <!-- @update:model-value="pageChange($event)" -->
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import WordCard from '../components/WorkCard.vue';
import NotifyMixin from '../mixins/Notification.js'

export default defineComponent({
    name: "WorksLib",

    mixins: [NotifyMixin],

    components: {
        WordCard,
    },

    data() {
        return {
            works: [],
            currPage: Number(this.$route.query.page) || 1,
            maxPage: 1,
            totalWorks: [],
            pageTitle: '',
            searchItems: [],
            tempList: [],
            tempKeyword: '',
            isLoading: false,
            sortOption: {
                label: '按照发售日期新到老的顺序',
                order: 'regist_date',
                sort: 'desc'
            },
            options: [
                {
                label: '按照发售日期新到老的顺序',
                order: 'regist_date',
                sort: 'desc'
                },
                {
                label: '按照发售日期老到新的顺序',
                order: 'regist_date',
                sort: 'asc'
                },
                {
                label: '按照售出数量多到少的顺序',
                order: 'dl_count',
                sort: 'desc'
                },
                {
                label: '按照价格便宜到贵的顺序',
                order: 'official_price',
                sort: 'asc'
                },
                {
                label: '按照价格贵到便宜的顺序',
                order: 'official_price',
                sort: 'desc'
                },
                {
                label: '按照评价高到低的顺序',
                order: 'rate_average_2dp',
                sort: 'desc'
                },
                {
                label: '按照评论多到少的顺序',
                order: 'rate_count',
                sort: 'desc'
                },
                {
                label: '按照RJ号大到小的顺序',
                order: 'alt_rj_code',
                sort: 'desc'
                },
                {
                label: '按照RJ号小到大的顺序',
                order: 'alt_rj_code',
                sort: 'asc'
                },
                {
                label: '按照全年龄新作优先的顺序',
                order: 'nsfw',
                sort: 'asc'
                },
                {
                label: '随机排序',
                order: 'random',
                sort: 'desc'
                }
            ]
        }
    },

    computed: {
        url() {
            const query = this.$route.query
            if (query.keyword) {
                return `/api/query/search/${encodeURIComponent(query.keyword)}`
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

        sortOption (newSortOptionSetting) {
            localStorage.sortOption = JSON.stringify(newSortOptionSetting);
            this.reset();
        },

        $route(data) {
            // document.title = 'querysys'
            if (data.query.keyword) {
                document.title = 'Search for ' + this.$route.query.keyword + (this.$route.query.page ? ' On page ' + this.$route.query.page : '')
            }
            else {
                document.title = 'querysys'
            }

            if (data.query.page) {
                this.isLoading = true
                this.currPage = Number(data.query.page)
                this.resetPageTitle()
            }
            else {
                this.isLoading = true
                this.currPage = 1
                this.resetPageTitle()
            }
        },
    },

    mounted() {
        if (localStorage.sortOption) {
            this.sortOption = JSON.parse(localStorage.sortOption);
        }
        
        if (this.$route.query.keyword) {
            document.title = 'Search for ' + this.$route.query.keyword + 'On page ' + this.$route.query.page
        }
        else {
            document.title = 'querysys'
        }
    },

    methods: {
        pageChange(pageNumber) {
            this.isLoading = true
            this.currPage = pageNumber
            if (this.$route.query.keyword) {
                this.$router.push(`/works?keyword=${encodeURIComponent(this.$route.query.keyword)}&page=${this.currPage}`)
            }
            else {
                this.$router.push(`/works?page=${this.currPage}`)
            }
            this.resetPageTitle()
        },

        requestWorks() {
            this.works= []
            const params = {
                page: this.currPage,
                order: this.sortOption.order,
                sort: this.sortOption.sort
            }
            // console.log(this.url);
            this.$axios.get(this.url, { params })
            .then(val => {
                if (val.data.pagination.total_works > 0 && this.currPage <= val.data.pagination.max_page) {
                    const pagination = val.data.pagination
                    this.currPage = pagination.current_page
                    this.maxPage = pagination.max_page
                    this.totalWorks = pagination.total_works

                    const result = val.data
                    this.works = result
                    this.isLoading = false
                }
                else if (val.data.pagination.total_works > 0 && this.currPage > val.data.pagination.max_page) {
                    const pagination = val.data.pagination
                    this.currPage = pagination.max_page
                    this.maxPage = pagination.max_page
                    this.totalWorks = pagination.total_works

                    const result = val.data
                    this.works = result
                    this.isLoading = false
                }
                else {
                    this.current_page = 1
                    this.maxPage = 1
                    this.totalWorks = 0
                    this.isLoading = false
                }
            })
            .catch(err => {
                this.current_page = 1
                this.maxPage = 1
                this.totalWorks = 0
                this.isLoading = false
                if (err.response) {
                    this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
                }
                else {
                    this.showErrNotif(err.message || err)
                }
            })
        },

        resetPageTitle() {
            if (this.$route.query.keyword) {
                this.works= []
                this.getSearchItem()
                // console.log('resetPageTitleUrl: ' + this.url);
                this.pageTitle = this.searchItems.length === 0 ? `Search by ${this.$route.query.keyword}` : `Search by `
                this.requestWorks()
            }
            else {
                this.pageTitle = 'All works'
                this.requestWorks()
                this.searchItems = []
            }
            // console.log('resetPageTitle ' + this.currPage);
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
            this.isLoading = true
            this.resetPageTitle()
            this.totalWorks = 0
            this.currPage = 1
            this.requestWorks()
            // console.log('reseted: ' + this.currPage);
        },

        removeSearchTag(name, index) {
            // console.log(name, index);
            // this.searchItems[index].render = false
            this.searchItems.splice(index, 1)
            // console.log(`searchItems: ${this.searchItems.length}`);
            if (this.searchItems.length) {
                for (let i = 0; i < this.searchItems.length; i++) {
                    this.tempList.push(
                        '$' + this.searchItems[i].name + '$'
                    )
                    this.tempKeyword = this.tempKeyword + this.tempList[i] + ' '
                }
                // console.log('tempKeyword: ' + this.tempKeyword);
                // console.log(this.tempList, this.tempKeyword);
                // console.log(this.tempList);
                // console.log(this.tempKeyword);
                this.$router.push(`/works?keyword=${encodeURIComponent(this.tempKeyword)}`)
                this.tempList = []
                this.tempKeyword = ''
            }
            else {
                this.$router.push(`/works`)
                this.tempList = []
                this.tempKeyword = ''
            }
        },
    },

    created() {
        this.resetPageTitle()
    },
})
</script>