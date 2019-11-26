import Vue from 'vue';
import Router from 'vue-router';
import Balance from '@/components/wallet/WalletBalance.vue';
import Transactions from '@/components/wallet/WalletTransactions.vue';
import Send from '@/components/wallet/WalletSendTokens.vue';
import DataWrite from '@/components/data/DataWrite.vue';
import DataRead from '@/components/data/DataRead.vue';
import TokensCreate from '@/components/tokens/TokensCreate.vue';
import TokensManage from '@/components/tokens/TokensManage.vue';
import TokensLookup from '@/components/tokens/TokensLookup.vue';

Vue.use(Router);

export default new Router({
  linkExactActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      redirect: '/about',
    },
    {
      path: '/tokens',
      name: 'Tokens',
      children: [
        {
          path: 'create',
          name: 'Create',
          component: TokensCreate,
        },
        {
          path: 'manage',
          name: 'Manage',
          component: TokensManage,
        },
        {
          path: 'lookup',
          name: 'Lookup',
          component: TokensLookup,
        },
      ],
      component: { render: c => c('router-view') },
    },
    {
      path: '/wallet',
      name: 'Wallet',
      children: [
        {
          path: 'balance',
          name: 'Balance',
          component: Balance,
        },
        {
          path: 'transactions',
          name: 'Transactions',
          component: Transactions,
        },
        {
          path: 'send-tokens',
          name: 'Send tokens',
          component: Send,
        },
      ],
      component: { render: c => c('router-view') },
    },
    {
      path: '/data',
      name: 'Data',
      children: [
        {
          path: 'read',
          name: 'Read',
          component: DataRead,
        },
        {
          path: 'write',
          name: 'Write',
          component: DataWrite,
        },
      ],
      component: { render: c => c('router-view') },
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '@/components/about/About.vue'),
    },
  ],
});
