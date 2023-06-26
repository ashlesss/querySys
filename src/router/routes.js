
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'QueryMain', component: () => import('pages/QueryMain.vue') },
      { path: 'works', component: () => import('pages/WorksLib.vue') },
      { path: 'work/:id', name: 'WorkDetail' ,component: () => import('pages/WorkDetail.vue')},
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  
  {
    path: '/:catchAll(.*)*',
    name: 'notfound',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
