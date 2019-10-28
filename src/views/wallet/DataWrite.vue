<template>
  <div class="section" v-if="identity">
    <h2 class="title">Write Data</h2>
    <section>
      <b-field>
        <p class="control"><span class="button is-static input-label">From Address</span></p>
        <b-input :value="identity.address.toString()" class="input-field" readonly></b-input>
      </b-field>
      <br/>
      <b-field>
        <p class="control"><span class="button is-static input-label">To Address</span></p>
        <b-input v-model="address" class="input-field"></b-input>
      </b-field>
      <br/>
      <b-field>
        <p class="control"><span class="button is-static input-label">Application ID</span></p>
        <b-input v-model="applicationId" class="input-field"></b-input>
      </b-field>
      <br/>
      <b-field label="Data payload">
        <b-input type="textarea" placeholder="..." v-model="payload"></b-input>
      </b-field>
      <div id="footer-row">
        <b-switch v-model="encrypted">
          Encrypt
        </b-switch>
        <b-field>
          <b-button @click="send" type="is-primary" class="send-button"
                    :disabled="!payload.length || !address.length || !applicationId.length">Send
          </b-button>
        </b-field>
      </div>
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
  .input-field {
    display: flex;
    width: 100%;
  }

  .input-label {
    display: flex;
    width: 160px;
  }

  #footer-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .send-button {
    display: flex;
    width: 200px;
  }
</style>