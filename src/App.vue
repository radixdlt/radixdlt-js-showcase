<template>
  <div id="app">
    <!-- Header -->
    <div class="is-vertical">
      <header class="hero app-header">
        <div class="navbar">
          <div class="navbar-brand">
            <div class="navbar-item">
              <img src="./assets/radix-logo.svg" alt="Radix Logo" />
            </div>
          </div>
          <div class="navbar-menu">
            <div class="navbar-end">
              <div class="navbar-item has-dropdown is-hoverable" v-if="identity">
                <a class="navbar-link"> My address: {{ identity.address.toString() }} </a>

                <div class="navbar-dropdown">
                  <a class="navbar-item" @click="generateIdentity()">
                    Generate a new address
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="columns is-gapless app-body">
        <!-- Left sidebar -->
        <div class="column is-2 has-background-light sidebar">
          <aside class="hero is-fullheight-with-navbar">
            <ul class="menu-list">
              <li v-for="route in $router.options.routes" :key="route.path">
                <router-link :to="route">
                  {{ route.name }}
                </router-link>
              </li>
            </ul>
          </aside>
        </div>
        <!-- Content -->
        <div class="column is-10">
          <main>
            <router-view @show-notification="handleNotification" />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { radixUniverse, RadixUniverse, RadixIdentityManager, RadixKeyStore } from 'radixdlt';
import { NotificationType } from '@/constants';

const toasts = [] as any;

export default Vue.extend({
  data() {
    return {
      identityManager: new RadixIdentityManager(),
      keyStoreKey: 'radixKeyStore',
      keyStorePassword: 'SuperSecretPassword', // In a real application, this would be set by the user
    };
  },
  computed: mapState(['identity']),
  created() {
    radixUniverse.bootstrap(RadixUniverse.BETANET_EMULATOR);
    this.loadIdentity();
  },
  methods: {
    loadIdentity() {
      const keyStoreJSON = localStorage.getItem(this.keyStoreKey);
      if (keyStoreJSON) {
        return RadixKeyStore.decryptKey(JSON.parse(keyStoreJSON), this.keyStorePassword).then(address => {
          const identity = this.identityManager.addSimpleIdentity(address);
          identity.account.openNodeConnection();
          this.$store.commit('setIdentity', identity);
        });
      }

      return this.generateIdentity();
    },
    generateIdentity() {
      const identity = this.identityManager.generateSimpleIdentity();
      identity.account.openNodeConnection();
      this.$store.commit('setIdentity', identity);
      return RadixKeyStore.encryptKey(identity.address, this.keyStorePassword).then(keyStore => {
        localStorage.setItem(this.keyStoreKey, JSON.stringify(keyStore));
      });
    },
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
.app-header {
  box-shadow: 0 3px 8px 0 rgba(116, 129, 141, 0.1);
}

.app-body {
  box-shadow: 0 -1px 0 0 #d4dadf;
}

.menu-list a {
  border-radius: 0;
}
/*
.menu-list a.is-active {
  background-color: white;
  color: black;
}
*/
.sidebar aside {
  padding: 3rem 0 0 0.5rem;
}

/deep/ .form {
  display: flex;
  flex-direction: column;
  margin-top: 50px;
}

/deep/ .form > div {
  padding-top: 10px;
}

/deep/ #footer-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

/deep/ #footer-row > button {
  display: flex;
  width: 200px;
  margin-left: 20px;
}

/deep/ .glue {
  flex-grow: 1;
}
</style>
