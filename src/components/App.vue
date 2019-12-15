<template>
  <div id="app">
    <div class="columns is-gapless">
      <!-- Sidebar -->
      <div class="column is-2 has-background-light sidebar">
        <aside class="hero is-fullheight">
          <app-sidebar />
        </aside>
      </div>
      <!-- Content -->
      <div class="column is-10">
        <header>
          <app-header @show-notification="handleNotification" />
        </header>
        <main>
          <router-view @show-notification="handleNotification" />
        </main>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { radixUniverse, RadixUniverse } from 'radixdlt';
import { NotificationType } from '@/constants';

import AppSidebar from '@/components/AppSidebar.vue';
import AppHeader from '@/components/AppHeader.vue';

const toasts = [] as any;

export default Vue.extend({
  name: 'App',
  components: {
    'app-header': AppHeader,
    'app-sidebar': AppSidebar,
  },
  created() {
    radixUniverse.bootstrap(RadixUniverse.BETANET_EMULATOR);
  },
  beforeDestroy() {
    radixUniverse.closeAllConnections();
  },
  methods: {
    handleNotification(message: string, type: string = NotificationType.DEFAULT) {
      if (toasts.length > 0) {
        const previousToast = toasts[toasts.length - 1];
        setTimeout(() => previousToast.close(), 500);
      }
      toasts.push(
        this.$buefy.toast.open({
          queue: false,
          duration: 10000,
          position: 'is-bottom',
          message,
          type,
        }),
      );
    },
  },
});
</script>

<style scoped lang="scss">
/deep/ .section {
  margin-right: 30px;
  margin-left: 30px;
}

/deep/ .form {
  display: flex;
  flex-direction: column;
  margin-top: 40px;
}

/deep/ .form label {
  padding-top: 10px;
}

/deep/ .footer-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

/deep/ .footer-row > button {
  display: flex;
  width: 200px;
  margin-left: 20px;
}

/deep/ .glue {
  flex-grow: 1;
}
</style>
