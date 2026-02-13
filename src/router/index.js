import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/home/index.vue';
import BidView from '@/views/bid/index.vue';
import AgentView from '@/views/agent/index.vue';
import CallerView from '@/views/caller/index.vue';
import BidderView from '@/views/bidder/index.vue';
import LoginView from '@/views/login/index.vue';
import { useAuth } from '@/composables/useAuth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'home', component: HomeView },
    { path: '/bid', name: 'bid', component: BidView },
    { path: '/agent', name: 'agent', component: AgentView },
    { path: '/caller', name: 'caller', component: CallerView },
    { path: '/bidder', name: 'bidder', component: BidderView },
  ],
});

router.beforeEach((to, _from, next) => {
  const { isLoggedIn } = useAuth();
  if (to.meta.public) {
    if (isLoggedIn() && to.path === '/login') return next('/');
    return next();
  }
  if (!isLoggedIn()) return next({ path: '/login', query: { redirect: to.fullPath } });
  next();
});

export default router;
