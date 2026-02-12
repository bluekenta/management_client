import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/home/index.vue';
import BidView from '@/views/bid/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/bid', name: 'bid', component: BidView },
  ],
});

export default router;
