<template>
  <div class="navbar has-background-white">
    <div class="navbar-start has-padding-left-15">
      <div class="is-flex justify-center align-items-center" v-if="identity">
        <b-field grouped group-multiline class="has-padding-left-20">
          <div class="control">
            <b-taglist attached>
              <b-tag type="is-dark">IDENTITY</b-tag>
              <b-tag v-if="isIdentityRemote()" type="is-warning">REMOTE</b-tag>
              <b-tag v-else type="is-success">LOCAL</b-tag>
            </b-taglist>
          </div>
          <div class="control">
            <b-taglist attached>
              <b-tag type="is-dark">ADDRESS</b-tag>
              <b-tag type="is-info">{{ identity.address.toString() }}</b-tag>
            </b-taglist>
          </div>
        </b-field>
      </div>
    </div>
    <div class="navbar-end">
      <b-dropdown hoverable aria-role="menu" position="is-bottom-left" class="navbar-item">
        <button class="button is-white has-padding-left-20 has-padding-right-20" slot="trigger">
          <span>My Identity</span>
          <b-icon icon="menu-down"></b-icon>
        </button>

        <b-dropdown-item aria-role="listitem">
          <div class="media" @click="confirmIdentityRandom">
            <b-icon class="media-left" icon="dice-5"></b-icon>
            <div class="media-content">
              <h1 class="has-text-weight-bold">Random</h1>
              <small>Generate new random identity</small>
            </div>
          </div>
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem">
          <div class="media" @click="confirmIdentityRemote">
            <b-icon class="media-left" icon="earth"></b-icon>
            <div class="media-content">
              <h1 class="has-text-weight-bold">Remote</h1>
              <small>Connect to a remote identity</small>
            </div>
          </div>
        </b-dropdown-item>
        <b-dropdown-item separator />
        <b-dropdown-item aria-role="listitem">
          <div class="media" @click="confirmIdentityImport">
            <b-icon class="media-left" icon="application-import"></b-icon>
            <div class="media-content">
              <h1 class="has-text-weight-bold">Import</h1>
              <small>Import an existing identity</small>
            </div>
          </div>
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem" :disabled="isIdentityRemote()">
          <div class="media" @click="confirmIdentityExport">
            <b-icon class="media-left" icon="application-export"></b-icon>
            <div class="media-content">
              <h1 class="has-text-weight-bold">Export</h1>
              <small>Export current identity</small>
            </div>
          </div>
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RadixIdentityManager, RadixKeyStore, RadixRemoteIdentity } from 'radixdlt';
import { NotificationType } from '@/constants';

export default Vue.extend({
  name: 'IdentityManage',
  data() {
    return {
      identityManager: new RadixIdentityManager(),
      keyStoreKey: 'radixKeyStore',
      keyStorePassword: 'SuperSecretPassword', // In a real application, this would be set by the user
    };
  },
  computed: mapState(['identity']),
  created() {
    this.loadIdentity().catch(error => this.showStatus(error.message || error, NotificationType.ERROR));
  },
  methods: {
    async loadIdentity() {
      const keyStoreJSON = localStorage.getItem(this.keyStoreKey);

      if (keyStoreJSON) {
        const address = await RadixKeyStore.decryptKey(JSON.parse(keyStoreJSON), this.keyStorePassword);
        const identity = this.identityManager.addSimpleIdentity(address);
        await identity.account.openNodeConnection();
        this.$store.commit('setIdentity', identity);
      } else {
        this.generateIdentity();
      }
    },
    async generateIdentity() {
      const identity = this.identityManager.generateSimpleIdentity();
      await identity.account.openNodeConnection();

      this.$store.commit('setIdentity', identity);

      const keyStore = await RadixKeyStore.encryptKey(identity.address, this.keyStorePassword);
      localStorage.setItem(this.keyStoreKey, JSON.stringify(keyStore));
    },
    async importIdentity(userKeyStore: string, userPassword: string) {
      const address = await RadixKeyStore.decryptKey(JSON.parse(userKeyStore), userPassword);
      const identity = this.identityManager.addSimpleIdentity(address);
      await identity.account.openNodeConnection();

      this.$store.commit('setIdentity', identity);

      const keyStore = await RadixKeyStore.encryptKey(identity.address, this.keyStorePassword);
      localStorage.setItem(this.keyStoreKey, JSON.stringify(keyStore));
    },
    async useRemoteIdentity() {
      const permissions = ['sign_atom', 'decrypt_ecies_payload', 'get_public_key'];
      const host = 'localhost';
      const port = '54345';

      const identity = await this.identityManager.generateRemoteIdentity(
        'JS LIB SHOWCASE',
        'Radix DLT JS Library showcase',
        permissions,
        host,
        port,
      );

      await identity.account.openNodeConnection();

      this.$store.commit('setIdentity', identity);
    },
    confirmIdentityRandom() {
      this.$buefy.dialog.confirm({
        title: 'Random Identity',
        message: `Proceeding will create a new Radix Identity.
                  <br/><br/>
                  <b>Note: </b> This will overwrite your current identity. 
                  Make sure you export it first if you want to use it later. `,
        cancelText: 'Cancel',
        confirmText: 'Proceed',
        type: 'is-primary',
        onConfirm: () => {
          this.generateIdentity()
            .then(() => this.showStatus('Identity changed', NotificationType.SUCCESS))
            .catch(error => this.showStatus(error.message || error, NotificationType.ERROR));
        },
      });
    },
    confirmIdentityRemote() {
      this.$buefy.dialog.confirm({
        title: 'Remote Identity',
        message: `Proceeding will attempt to connect to your Desktop Wallet's Identity.
                  <br/><br/>
                  <b>Note: </b>Make sure you have the Wallet open and approve the incoming request.`,
        cancelText: 'Cancel',
        confirmText: 'Proceed',
        type: 'is-primary',
        onConfirm: () => {
          this.useRemoteIdentity()
            .then(() => this.showStatus('Identity changed', NotificationType.SUCCESS))
            .catch(error => this.showStatus(error.message || error, NotificationType.ERROR));
        },
      });
    },
    confirmIdentityImport() {
      this.$buefy.dialog.prompt({
        title: 'Import Identity',
        message: `Paste the JSON keystore associated with the identity you want to use:`,
        cancelText: 'Cancel',
        confirmText: 'Proceed',
        type: 'is-primary',
        trapFocus: true,
        inputAttrs: {
          type: 'textarea',
          size: 51,
        },
        onConfirm: keyStore => this.confirmIdentityImportTwo(keyStore),
      });
    },
    confirmIdentityImportTwo(keyStore: string) {
      this.$buefy.dialog.prompt({
        title: 'Import Identity',
        message: `Enter your encryption password:`,
        cancelText: 'Cancel',
        confirmText: 'Proceed',
        type: 'is-primary',
        trapFocus: true,
        inputAttrs: {
          type: 'text',
          size: 51,
        },
        onConfirm: password => {
          this.importIdentity(keyStore, password)
            .then(() => this.showStatus('Identity changed', NotificationType.SUCCESS))
            .catch(error => this.showStatus(error.message || error, NotificationType.ERROR));
        },
      });
    },
    confirmIdentityExport() {
      this.$buefy.dialog.prompt({
        title: 'Export Identity',
        message: `Choose an encryption password:`,
        cancelText: 'Cancel',
        confirmText: 'Proceed',
        type: 'is-primary',
        trapFocus: true,
        inputAttrs: {
          type: 'text',
          size: 51,
        },
        onConfirm: password => this.confirmIdentityExportTwo(password),
      });
    },
    async confirmIdentityExportTwo(userPassword: string) {
      const keyStore = await RadixKeyStore.encryptKey(this.identity.address, userPassword);

      this.$buefy.dialog.alert({
        title: 'Export Identity',
        message: `Save the following JSON keystore for later use:
                  <br/><br/>
                  <pre>${JSON.stringify(keyStore, null, 2)}</pre>`,
        confirmText: 'OK',
        type: 'is-primary',
        trapFocus: true,
        onConfirm: () => this.showStatus('Identity exported', NotificationType.SUCCESS),
      });
    },
    isIdentityRemote() {
      return this.identity instanceof RadixRemoteIdentity;
    },
    showStatus(message: string, type?: string) {
      this.$parent.$emit('show-notification', message, type);
    },
  },
});
</script>
