<template>
  <div id="app">

    <!-- Header -->
    <header class="hero is-light">
      <div class="navbar">
        <div class="navbar-brand">
          <div class="navbar-item">
            <img src="./assets/radix-logo.svg" alt="Radix Logo" width="112" height="28">
          </div>
          
        </div>
        <div class="navbar-menu">
          <div class="navbar-end">
            <div class="navbar-item has-dropdown is-hoverable" v-if="identity">
              <a class="navbar-link">
                My address: {{identity.address.toString()}}
              </a>

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

    <div class="section">
      <div class="columns">

        <!-- Left menu -->
        <aside class="column is-2 menu">
          <ul class="menu-list">
            <li v-for="route in $router.options.routes" :key="route.path">
              <router-link :to="route">
                {{route.name}}
              </router-link>
            </li>
          </ul>
        </aside>

        <!-- Content -->
        <main class="column">
          <router-view/>
        </main>

      </div>
    </div>
    
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { radixUniverse, RadixUniverse, RadixIdentityManager, RadixKeyStore, RadixECIES } from 'radixdlt'

export default Vue.extend({
  data() {
    return {
      identityManager: new RadixIdentityManager(),

      keyStoreKey: 'radixKeyStore',
      keyStorePassword: 'SuperSecretPassword', // In a real application, this would be set by the user
    }
  },
  computed: mapState(['identity']),
  created() {
    radixUniverse.bootstrap(RadixUniverse.BETANET)
    this.loadIdentity()
  },
  methods: {
    loadIdentity() {
      const keyStoreJSON = localStorage.getItem(this.keyStoreKey)
      if (keyStoreJSON) {
        return RadixKeyStore.decryptKey(JSON.parse(keyStoreJSON), this.keyStorePassword)
        .then(address => {
          const identity = this.identityManager.addSimpleIdentity(address)
          identity.account.openNodeConnection()
          this.$store.commit('setIdentity', identity)
          console.log('Loaded identity from localStoragr: ' + address.toString())
        })
      }

      return this.generateIdentity()
    },
    generateIdentity() {
      const identity = this.identityManager.generateSimpleIdentity()
      identity.account.openNodeConnection()
      this.$store.commit('setIdentity', identity)
      return RadixKeyStore.encryptKey(identity.address, this.keyStorePassword)
      .then((keyStore) => {
        localStorage.setItem(this.keyStoreKey, JSON.stringify(keyStore))
        console.log('Identity saved to localStorage')
      })
    },
  },
});
</script>

<style lang="scss">
</style>
