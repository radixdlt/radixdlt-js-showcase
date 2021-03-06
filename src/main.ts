import Vue from 'vue';
import App from './components/App.vue';
import router from './router';
import store from './store';
import Buefy from 'buefy';
import './styles/index.scss';

Vue.use(Buefy);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
