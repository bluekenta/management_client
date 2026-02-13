import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/home/index.vue';
import BidView from '@/views/bid/index.vue';
import AgentView from '@/views/agent/index.vue';
import CallerView from '@/views/caller/index.vue';
import BidderView from '@/views/bidder/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/bid', name: 'bid', component: BidView },
    { path: '/agent', name: 'agent', component: AgentView },
    { path: '/caller', name: 'caller', component: CallerView },
    { path: '/bidder', name: 'bidder', component: BidderView },
  ],
});

export default router;
