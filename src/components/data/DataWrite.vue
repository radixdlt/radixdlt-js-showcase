<template>
  <div class="section" v-if="identity">
    <h2 class="title">Write Data</h2>
    <div class="form">
      <b-field label="Source address" type="is-dark has-background-light">
        <b-input :value="identity.address.toString()" readonly></b-input>
      </b-field>
      <b-field label="Destination address">
        <b-input v-model="address"></b-input>
      </b-field>
      <b-field label="Application ID">
        <b-input v-model="applicationId"></b-input>
      </b-field>
      <b-field label="Payload">
        <b-input type="textarea" placeholder="" v-model="payload"></b-input>
      </b-field>
      <b-field>
        <div class="footer-row">
          <b-switch v-model="encrypted">
            Encrypt
          </b-switch>
          <div class="glue"></div>
          <b-button @click="clear" type="is-secondary">Clear</b-button>
          <b-button
            @click="send"
            type="is-primary"
            :disabled="!payload.length || !address.length || !applicationId.length"
            >Send
          </b-button>
        </div>
      </b-field>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RadixTransactionBuilder, RadixAccount, RadixIdentity } from 'radixdlt';
import { NotificationType } from '@/constants';

export default Vue.extend({
  name: 'DataWrite',
  data() {
    return {
      address: '',
      applicationId: '',
      payload: '',
      encrypted: false,
    };
  },
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.identity;
    },
  },
  methods: {
    send() {
      try {
        const destinationAccount: RadixAccount = RadixAccount.fromAddress(this.address.trim());

        RadixTransactionBuilder.createPayloadAtom(
          this.identity.account,
          [this.identity.account, destinationAccount],
          this.applicationId,
          this.payload,
          this.encrypted,
        )
          .signAndSubmit(this.identity)
          .subscribe({
            next: status => this.showStatus(status.status),
            complete: () => this.showStatus('SENT SUCCESSFULLY', NotificationType.SUCCESS),
            error: error => this.showStatus(error.toString(), NotificationType.ERROR),
          });
      } catch (e) {
        this.showStatus(e.message, NotificationType.ERROR);
      }
    },
    clear() {
      this.address = '';
      this.applicationId = '';
      this.payload = '';
    },
    showStatus(message: string, type?: string) {
      this.$parent.$emit('show-notification', message, type);
    },
  },
});
</script>

<style scoped>
label.switch {
  padding-top: 0;
}
</style>