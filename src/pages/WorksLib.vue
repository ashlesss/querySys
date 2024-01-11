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
            :color="tag.color"
            style="font-size: 18px;" >
                {{ tag.raw.term }}:{{ tag.raw.keyword }}
            </q-chip>

            <!-- Plain keywords -->
            <span>
                {{ keyword ? parseKeywords(keyword).plainKeywords : '' }}
            </span>

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
        <!-- col-xs-12 col-sm-`4` col-md-3 col-lg-2 col-xl-2 -->
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
                v-if="!isLoading"
                v-model="page"
                :max="maxPage"
                :max-pages="6"
                direction-links
                outline
                gutter="sm"
            />
        </div>

        <div class="q-ml-sm text-h5" v-show="!isLoading">
            Go to 
            <!-- Go to <q-input class="row" outlined v-model="gotoPage" :dense="dense" style="max-width: 50px;"/> -->
        </div>

        <div class="q-ml-md" style="max-width: 50px;">
            <q-input v-show="!isLoading" class="row" outlined v-model="gotoPage" :dense="dense" @keydown.enter.prevent="gotoThatPage"/>
        </div>
    </div>
</template>

<script>
import WordCard from '../components/WorkCard.vue';
import NotifyMixin from '../mixins/Notification.js'
import { mapState, mapActions } from 'pinia'
import { usePageControlStore } from '../stores/pageControl'
import Keywords from '../mixins/Keywords.js'
import Page from '../mixins/Page'
import { debounce } from 'quasar'

export default {
    name: "WorksLib",

    mixins: [
        NotifyMixin, 
        Keywords, 
        Page
    ],
    ...Page,

    components: {
        WordCard,
    },

    data() {
        return {
            works: [],
            currPage: 1,
            maxPage: 1,
            totalWorks: 0,
            // pageTitle: '',
            searchItems: [],
            plainKeywords: '',
            tempList: [],
            tempKeyword: '',
            isLoading: false,
            // keyword: '',
            sortOption: this.$q.localStorage.getItem('sortOption') ? {
                label: '按照发售日期新到老的顺序',
                order: 'regist_date',
                sort: 'desc'
            } : JSON.parse(this.$q.localStorage.getItem('sortOption')),
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
            dense: true,
            cancelTokenSource: null,
        }
    },

    computed: {
        ...mapState(usePageControlStore, [
            'pageActive',
            'currPageStore'
        ]),

        pageTitle() {
            if (this.$route.query.keyword) {
                this.getSearchItem()
                return `Search by `
            }
            else {
                return 'All works'
            }
        },
    },

    watch: {
        page() {
            this.requestWorks()
        },

        keyword() {
            this.requestWorks()
            if (!this.$route.query.keyword) {
                this.searchItems = []
            }
        },

        sortOption (newSortOptionSetting) {
            console.log(JSON.stringify(this.sortOption) !== this.$q.localStorage.getItem('sortOption'));
            if (JSON.stringify(this.sortOption) !== this.$q.localStorage.getItem('sortOption')) {
                this.$q.localStorage.set('sortOption', JSON.stringify(newSortOptionSetting))
                this.sortOptionReset();
            }
            
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
        },

        subtitle() {
            this.requestWorks()
        }
    },

    created() {
        this.requestWorks = debounce(this.requestWorks, 100)
    },

    mounted() {

        this.requestWorks()

        if (this.$q.localStorage.getItem('sortOption')) {
            this.sortOption = JSON.parse(this.$q.localStorage.getItem('sortOption'))
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
        ...mapActions(usePageControlStore, [
            'SET_PAGE_CONTROL',
            'SET_CURR_PAGE_STORE'
        ]),

        requestWorks() {
            this.isLoading = true
            this.works= []
            console.log('requestWork run');
            const params = {
                order: this.sortOption.order,
                sort: this.sortOption.sort,
                subtitle: this.subtitle ? 1 : 0,
                page: this.page
            }

            if (this.cancelTokenSource) {
                this.cancelTokenSource.cancel('Operation canceled due to new request.');
            }

            this.cancelTokenSource = this.$axios.CancelToken.source();
            // console.log(params);
            this.$axios.get(this.keyword ? `/api/query/search/${encodeURIComponent(this.keyword)}` : `/api/query/works`, { params, cancelToken: this.cancelTokenSource.token })
            .then(val => {
                const pagination = val.data.pagination
                if (pagination.max_page !== 0) {
                    if (this.page > pagination.max_page) {
                        this.maxPage = this.page
                        this.totalWorks = pagination.total_works

                        const result = val.data
                        this.works = result
                        this.isNoWork = true
                        this.isLoading = false
                        this.cancelTokenSource = null
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
                
                // this.currPage = 1
                this.maxPage = 1
                this.totalWorks = 0
                this.isLoading = false
                if (this.$axios.isCancel(err)) {
                    console.log('Request canceled:', err.message);
                }
                else if (err.response) {
                    this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
                }
                else {
                    this.showErrNotif(err.message || err)
                }
            })
        },

        // resetPageTitle() {
        //     if (this.$route.query.keyword) {
        //         this.works= []
        //         this.getSearchItem()
        //         // console.log('resetPageTitleUrl: ' + this.url);
        //         this.pageTitle = `Search by `
        //         this.requestWorks()
        //     }
        //     else {
        //         this.pageTitle = 'All works'
        //         this.requestWorks()
        //         this.searchItems = []
        //     }
        //     // console.log('resetPageTitle ' + this.currPage);
        // },

        pickTagColor(tagTerm) {
            switch (tagTerm.term) {
                case 'tag':
                    return 'blue';
                case 'va': 
                    return 'green';
                case 'circle':
                    return 'purple';
                default:
                    return 'black';
            }
        },

        getSearchItem() {
            // const srMatched = this.$route.query.keyword.match(/\$(va|circle):([^\$\s]+)\$/g)
            const keyword = this.$route.query.keyword || ''

            const srMatched = this.parseKeywords(keyword)
            this.plainKeywords = srMatched.plainKeywords.trim()
            this.searchItems = []
            if (srMatched.accurateSearchTerms.length) {
                srMatched.accurateSearchTerms.forEach(match => {
                    this.searchItems.push({
                        name: `${match.term}:${match.keyword}`,
                        raw: match,
                        color: this.pickTagColor(match),
                        render: true
                    })
                })
                // console.log(this.searchItems);
            }
            else {
                this.searchItems = []
            }
        },

        sortOptionReset() {
            console.log('sortOptionReset run');
            this.totalWorks = 0
            this.requestWorks()
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
                this.$router.push(`/works?keyword=${encodeURIComponent(this.tempKeyword + this.plainKeywords)}`)
                this.tempList = []
                this.tempKeyword = ''
            }
            else {
                if (this.plainKeywords !== '') {
                    this.$router.push(`/works?keyword=${encodeURIComponent(this.plainKeywords)}`)
                }
                else {
                    this.$router.push(`/works`)
                }
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

    // beforeRouteEnter(to, from, next) {
    //     next(vm => {
    //         vm.SET_PAGE_CONTROL(true)
    //         console.log('Page control active. Current page: ', to.query.page);
    //         vm.currPage = to.query.page ? Number(to.query.page) : 1
    //         vm.keyword = to.query.keyword ? to.query.keyword : ''
    //     })
    // },

    // beforeRouteLeave(to, from, next) {
    //     this.SET_PAGE_CONTROL(false)
    //     console.log('Page control inactive');
    //     this.SET_CURR_PAGE_STORE(this.currPage)
    //     next()
    // }
}
</script>