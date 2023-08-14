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
        <div class="col">
            <q-select 
                rounded 
                outlined 
                v-model="sortOption" 
                :options="options" 
                label="Sort By" 
                style="max-width: 30%;"
            />
        </div>

        <div class="col" style="display: flex;">
            <q-checkbox v-model="subtitle" label="With Subtitle" />
        </div>
    </div>

    <!-- Load spinner -->
    <div class="column justify-center items-center">
        <q-spinner-dots
          color="primary"
          size="3em"
          v-show="isLoading"
        />
        <!-- <q-tooltip :offset="[0, 8]">QSpinnerDots</q-tooltip> -->
    </div>

    <!-- Works -->
    <!-- <q-infinite-scroll @load="requestWorks" :offset="250"> -->
    <div class="row q-px-sm q-pt-sm q-col-gutter-x-md q-col-gutter-y-lg">
        <!-- col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2 -->
        <div :id="work.rj_code" class="col-xs-12 col-sm-4 col-md-3 col-lg-2 col-xl-2" v-for="(work, index) in works.works" :key="index">
                <WordCard :work="work" class="fit"/> 
        </div>
    </div>

    <div v-show="isNoWork && !isLoading" class="row text-h6 text-bold" style="justify-content: center; align-items: center; display: flex;">
        END
    </div>

    <div class="q-pa-lg flex flex-center ">
        <div>
            <q-pagination
                size="18px"
                v-show="!isLoading"
                v-model="currPage"
                :max="maxPage"
                :max-pages="6"
                direction-links
                outline
                gutter="sm"
                @update:model-value="pageChange($event)"
            />
        </div>

        <div class="q-ml-sm text-h5" v-show="!isLoading">
            Go to 
            <!-- Go to <q-input class="row" outlined v-model="gotoPage" :dense="dense" style="max-width: 50px;"/> -->
        </div>

        <div class="q-ml-md" style="max-width: 50px;">
            <q-input v-show="!isLoading" class="row" outlined v-model="gotoPage" :dense="dense" @keydown.enter.prevent="gotoThatPage"/>
        </div>
        <!-- @update:model-value="pageChange($event)" -->
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import WordCard from '../components/WorkCard.vue';
import NotifyMixin from '../mixins/Notification.js'
import { mapState, mapActions } from 'pinia'
import { usePageControlStore } from '../stores/pageControl'

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
            totalWorks: 0,
            pageTitle: '',
            searchItems: [],
            tempList: [],
            tempKeyword: '',
            isLoading: false,
            keyword: this.$route.query.keyword || '',
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
            ],
            subtitle: false,
            isNoWork: false,
            gotoPage: '',
            dense: true
        }
    },

    computed: {
        url() {
            const query = this.$route.query
            if (query.keyword) {
                return `/api/query/search/${encodeURIComponent(query.keyword)}?page=${this.currPage}`
            }
            else if (this.$q.sessionStorage.getItem('searchKeyword')) {
                return `/api/query/search/${encodeURIComponent(this.$q.sessionStorage.getItem('searchKeyword'))}?page=${this.currPage}`
            }
            else {
                return `/api/query/works?page=${this.currPage}`
            }
        },

        ...mapState(usePageControlStore, [
            'pageActive',
        ]),
    },

    watch: {
        url() {
            if (this.$route.path.match(/\bworks\b/)) {
                this.isLoading = true
                if ((this.$route.query.keyword ? this.$route.query.keyword : '') === this.keyword) {
                    // console.log('keyword not change', this.$route.query.page);
                    this.resetPageTitle()
                }
                else {
                    console.log('keyword changed');
                    // console.log('url page', this.$route.query.page);
                    if (this.$route.query.page) {
                        this.resetPageTitle()
                        this.keyword = this.$route.query.keyword || ''
                    }
                    else {
                        this.reset()
                        this.keyword = this.$route.query.keyword || ''
                    }
                }
            }

        },

        sortOption (newSortOptionSetting) {
            this.$q.localStorage.set('sortOption', JSON.stringify(newSortOptionSetting))
            this.sortOptionReset();
        },

        $route(data) {
            // document.title = 'querysys'
            if (data.query.keyword) {
                document.title = `Search for ${this.$route.query.keyword} ${this.$route.query.page ? `| Page ${this.$route.query.page}` : ''}`
            }
            else if (this.$route.query.page) {
                document.title = `Querysys | Page ${this.$route.query.page}`
            }
            else {
                document.title = 'Querysys'
            }

            if (data.path.match(/\bworks\b/) && this.pageActive) {
                if (data.query.page) {
                    this.currPage = Number(data.query.page)
                }
                else  {
                    this.currPage = 1
                }
            }
        },

        subtitle() {
            this.isLoading = true
            this.resetPageTitle()
        }
    },

    mounted() {

        if (this.$q.localStorage.getItem('sortOption')) {
            try {
                this.sortOption = JSON.parse(this.$q.localStorage.getItem('sortOption'))
            }
            catch {
                this.$q.localStorage.remove('sortOption')
            }
        }
        else {
            this.resetPageTitle()
        }
        
        if (this.$route.query.keyword) {
            document.title = `Search for ${this.$route.query.keyword} ${this.$route.query.page ? `| Page ${this.$route.query.page}` : ''}`
        }
        else if (this.$route.query.page) {
            document.title = `Querysys | Page ${this.$route.query.page}`
        }
        else {
            document.title = 'Querysys'
        }
    },

    methods: {
        pageChange(pageNumber) {
            this.isLoading = true
            // this.currPage = pageNumber
            // console.log('pageChange run', pageNumber);
            if (this.$route.query.keyword) {
                this.$router.push(`/works?keyword=${encodeURIComponent(this.$route.query.keyword)}&page=${pageNumber}`)
            }
            else {
                this.$router.push(`/works?page=${pageNumber}`)
            }
        },

        requestWorks() {
            this.works= []
            console.log('requestWork run');
            const params = {
                order: this.sortOption.order,
                sort: this.sortOption.sort,
                subtitle: this.subtitle ? 1 : 0
            }
            // console.log(params);
            this.$axios.get(this.url, { params })
            .then(val => {
                const pagination = val.data.pagination
                if (pagination.max_page !== 0) {
                    if (this.currPage > pagination.max_page) {
                        this.maxPage = this.currPage
                        this.totalWorks = pagination.total_works

                        const result = val.data
                        this.works = result
                        this.isNoWork = true
                        this.isLoading = false
                    }
                    else {
                        // this.currPage = pagination.current_page
                        this.maxPage = pagination.max_page
                        this.totalWorks = pagination.total_works

                        const result = val.data
                        this.works = result
                        if (pagination.current_page === pagination.max_page) {
                            this.isNoWork = true
                        }
                        else {
                            this.isNoWork = false
                        }
                        this.isLoading = false
                    }
                }
                else {
                    this.maxPage = 1
                    this.totalWorks = pagination.total_works

                    const result = val.data
                    this.works = result
                    this.isNoWork = true
                    this.isLoading = false
                }
                
            })
            .catch(err => {
                this.currPage = 1
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
            // const srMatched = this.$route.query.keyword.match(/\$(va|circle):([^\$\s]+)\$/g)
            const keyword = this.$route.query.keyword || ''
            const regex = /\$(va|circle|tag|price|rate|sell):([^\$\s]+)\$/g
            const srMatched = [...keyword.matchAll(regex)]
            this.searchItems = []
            if (srMatched.length) {
                srMatched.forEach(match => {
                    this.searchItems.push({
                        name: `${match[1]}:${match[2]}`,
                        render: true
                    })
                })
            }
            else {
                this.searchItems = []
            }
        },

        reset() {
            // console.log(this.totalWorks);
            console.log('reset run');
            this.isLoading = true
            this.totalWorks = 0
            this.currPage = 1
            this.resetPageTitle()
            // this.requestWorks()
            // console.log('reseted: ' + this.currPage);
        },

        sortOptionReset() {
            console.log('sortOptionReset run');
            this.isLoading = true
            this.totalWorks = 0
            this.resetPageTitle()
            // this.currPage = 1
            // this.requestWorks()
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

        gotoThatPage() {
            if (!isNaN(Number(this.gotoPage))) {
                if (this.$route.query.keyword) {
                    this.$router.push(`/works?keyword=${encodeURIComponent(this.$route.query.keyword)}&page=${this.gotoPage}`)
                    this.gotoPage = ''
                }
                else {
                    this.$router.push(`/works?page=${this.gotoPage}`)
                    this.gotoPage = ''
                }
            }
            else {
                this.gotoPage = ''
            }
        },
    },
})
</script>