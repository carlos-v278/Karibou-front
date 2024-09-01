import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '',name:'dwelling', component: () => import('src/features/dwelling/pages/IndexPage.vue') }],
  },
  {
    path: '/annonces-immeuble',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',name:'all_advertisements', component: () => import('@/features/advertisements/pages/AdvertisementsIndex.vue') },
      { path: ':id/',name:'buidling_advertisements', component: () => import('@/features/advertisements/pages/BuildingAdvertisements.vue') }
    ],
  },
  {
    path: '/messages',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',name:'all_conversations', component: () => import('@/features/messaging/pages/MyMessaging.vue') },
      { path: ':id',name:'conversation', component: () => import('@/features/messaging/pages/MyMessaging.vue') },
    ],
  },
  {
    path: '/quittances',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',name:'all_rent_receipt', component: () => import('@/features/rent-receipt/pages/MyRentReceipts.vue') },
    ],
  },
  {
    path: '/connexion',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name:'login',component: () => import('@/features/authentication/pages/AuthLogin.vue') }],
  },
  {
    path: '/inscription',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name:'signIn',component: () => import('@/features/authentication/pages/AuthSignIn.vue') }],
  },
  {
    path: '/deconnexion',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name:'logout',component: () => import('@/features/authentication/pages/AuthLogout.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
