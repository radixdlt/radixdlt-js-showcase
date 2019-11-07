import Vue from 'vue';
import Router from 'vue-router';
import Balance from './views/wallet/Balance.vue';
import Transactions from './views/wallet/Transactions.vue';
import Send from './views/wallet/Send.vue';
import DataWrite from './views/data/DataWrite.vue';
import DataRead from './views/data/DataRead.vue';

Vue.use(Router);

export default new Router({
  linkExactActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      name: 'Balance',
      component: Balance,
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions,
    },
    {
      path: '/send',
      name: 'Send',
      component: Send,
    },
    {
      path: '/data-write',
      name: 'Write Data',
      component: DataWrite,
    },
    {
      path: '/data-read',
      name: 'Read Data',
      component: DataRead,
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});
