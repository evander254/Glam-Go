import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/pages/Auth.vue'),
    },
    {
      path: '/book',
      name: 'book',
      component: () => import('@/pages/Book.vue'),
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('@/pages/Shop.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/pages/Cart.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/pages/Admin.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFound.vue'),
    },
  ],
});

export default router;
