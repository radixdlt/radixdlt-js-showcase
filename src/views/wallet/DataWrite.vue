<template>
  <div class="section" v-if="identity">
    <h2 class="title">Write Data</h2>
    <section class="form">
      <b-field horizontal label="Source address" type="is-dark has-background-light">
        <b-input :value="identity.address.toString()" class="input-field" readonly></b-input>
      </b-field>
      <b-field horizontal label="Destination address">
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
          <b-button @click="send" type="is-primary"
                    :disabled="!payload.length || !address.length || !applicationId.length">Send
          </b-button>
        </div>
      </b-field>
      <b-message :type="status.type" class="status" v-show="status.message">
        {{status.message.toUpperCase()}}
      </b-message>
    </section>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {RadixTransactionBuilder, RadixAccount, RadixIdentity} from 'radixdlt';

  export default Vue.extend({
    data() {
      return {
        address: '',
        applicationId: '',
        payload: '',
        encrypted: false,
        status: {
          message: '',
          type: ''
        }
      };
    },
    name: 'write_data',
    computed: {
      identity(): RadixIdentity {
        return this.$store.state.identity;
      }
    },
    methods: {
      send() {
        try {
          const toAccount = RadixAccount.fromAddress(this.address);
          RadixTransactionBuilder.createPayloadAtom(
              this.identity.account, [this.identity.account, toAccount], this.applicationId, this.payload, this.encrypted)
              .signAndSubmit(this.identity)
              .subscribe({
                next: status => this.status = {message: status, type: 'is-dark'},
                complete: () => this.status = {message: 'Sent successfully', type: 'is-success'},
                error: error => this.status = {message: error.toString(), type: 'is-danger'}
              })
        } catch (e) {
          this.status = {message: e.message, type: 'is-danger'};
        }
      }
    }
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

  .status {
    position: absolute;
    bottom: 0;
    font-weight: bold;
  }
</style>