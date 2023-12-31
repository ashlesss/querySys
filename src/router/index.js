import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { usePageControlStore } from 'src/stores/pageControl'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    // scrollBehavior: () => ({ left: 0, top: 0 }),
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition
      }
      else if (to.hash) {
        return { el: to.hash }
      }
      else {
        return { left: 0, top: 0 }
      }
    },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    // console.log(`Navigating from ${from.fullPath} to ${to.fullPath}`);
    const store = usePageControlStore()
    if (to.path === '/works') {
      store.pageActive = true
      store.loggerEnable = true
      store.SET_CURR_PAGE_STORE(to.query.page)
      console.log('pageActived', store.pageActive);
      console.log('router page', to.query.page);
    }
    else {
      store.pageActive = false
      if (store.loggerEnable) {
        console.log('pageActived', store.pageActive);
      }
      store.loggerEnable = false
    }
    next()
  })

  return Router
})
