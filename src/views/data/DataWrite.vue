<template>
  <div class="section" v-if="identity">
    <h2 class="title">Write Data</h2>
    <section class="form">
      <b-field
        horizontal
        label="Source address"
        type="is-dark has-background-light"
      >
        <b-input
          :value="identity.address.toString()"
          class="input-field"
          readonly
        ></b-input>
      </b-field>
      <b-field
        horizontal
        label="Destination address"
        message="To add multiple destination addresses, separate them by commas"
      >
        <b-input v-model="address" class="input-field"></b-input>
      </b-field>
      <b-field horizontal label="Application ID">
        <b-input v-model="applicationId" class="input-field"></b-input>
      </b-field>
      <b-field horizontal label="Payload">
        <b-input type="textarea" placeholder="" v-model="payload"></b-input>
      </b-field>
      <b-field horizontal>
        <div id="footer-row">
          <b-switch v-model="encrypted">
            Encrypt
          </b-switch>
          <b-button
            @click="send"
            type="is-primary"
            :disabled="
              !payload.length || !address.length || !applicationId.length
            "
            >Send
          </b-button>
        </div>
      </b-field>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RadixTransactionBuilder, RadixAccount, RadixIdentity } from 'radixdlt';

const toasts = [] as any;

export default Vue.extend({
  data() {
    return {
      address: '',
      applicationId: '',
      payload: '',
      encrypted: false,
    };
  },
  name: 'write_data',
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.identity;
    },
  },
  methods: {
    send() {
      try {
        const destinationAccounts: RadixAccount[] = this.address
          .split(',')
          .map(a => RadixAccount.fromAddress(a.trim()));

        RadixTransactionBuilder.createPayloadAtom(
          this.identity.account,
          [this.identity.account, ...destinationAccounts],
          this.applicationId,
          this.payload,
          this.encrypted,
        )
          .signAndSubmit(this.identity)
          .subscribe({
            next: status => this.showStatus(status),
            complete: () => this.showStatus('SENT SUCCESSFULLY', 'is-success'),
            error: error => this.showStatus(error.toString(), 'is-danger'),
          });
      } catch (e) {
        this.showStatus(e.message, 'is-danger');
      }
    },
    showStatus(message: string, type = 'is-light') {
      if (toasts.length > 0) {
        const previousToast = toasts[toasts.length - 1];
        setTimeout(() => previousToast.close(), 500);
      }

      toasts.push(
        this.$buefy.toast.open({
          queue: false,
          duration: 5000,
          position: 'is-bottom',
          message,
          type,
        }),
      );
    },
  },
});
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  margin-top: 50px;
}

.form > div {
  padding-top: 10px;
}

.input-field {
  display: flex;
  width: 100%;
}

#footer-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

#footer-row > button {
  display: flex;
  width: 200px;
}
</style>
