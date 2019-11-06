<template>
  <div class="section" v-if="identity">
    <h2 class="title">Write Data</h2>
    <section class="form">
      <b-field horizontal label="Source address" type="is-dark has-background-light" >
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
      <b-field>
        <p class="help">{{status}}</p>
      </b-field>
    </section>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {mapState} from 'vuex';
  import {RadixTransactionBuilder, RadixAccount} from 'radixdlt';

  export default Vue.extend({
    data() {
      return {
        address: '',
        applicationId: '',
        status: '',
        payload: '',
        encrypted: false,
      }
    },
    name: 'write_data',
    computed: mapState(['identity']),
    methods: {
      send() {
        try {
          const toAccount = RadixAccount.fromAddress(this.address);
          RadixTransactionBuilder.createPayloadAtom(
              this.identity.account, [this.identity.account, toAccount], this.applicationId, this.payload, this.encrypted)
              .signAndSubmit(this.identity)
              .subscribe({
                next: status => this.status = status,
                complete: () => this.status = 'Sent',
                error: error => this.status = error
              })
        } catch (e) {
          this.status = e.message;
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
</style>