const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: { name: 'works' }},
      // { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'works', name:'works', component: () => import('pages/WorksLib.vue')},
      { path: 'QueryMain', component: () => import('pages/QueryMain.vue')},
      { path: 'work/:id', name: 'WorkDetail' ,component: () => import('pages/WorkDetail.vue')},
      { path: 'testpage', component: () => import('pages/TestPage.vue')},
    ]
  },
  {
    path: '/admin',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/dashboard/VoiceFolders.vue')},
      { path: '/admin/scanner', component: () => import('pages/dashboard/ScanPage.vue')}
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue')
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
