<template>
  <div class="section" v-if="identity">
    <h2 class="title">Send Tokens</h2>
    <section>
      <b-field label="From Address">
        <b-input :value="identity.address.toString()" readonly></b-input>
      </b-field>

      <b-field label="To Address">
        <b-input v-model="address"></b-input>
      </b-field>

      <b-field label="Reference">
        <b-input v-model="reference"></b-input>
      </b-field>

      <b-field label="Token">
        <b-select v-model="token" placeholder="Token" expanded>
          <option
            v-for="(balance, token) in tokens"
            :value="token"
            :key="token">
            {{ token }}
          </option>
        </b-select>
      </b-field>

      <b-field>
        <p class="help" v-if="token">
          Available balance: {{tokens[token].toString()}}
        </p>
      </b-field>

      <b-field>
        <b-input type="number" min="0" step="any" v-model="amount" expanded :disabled="!token"></b-input>
        <b-button @click="send" type="is-primary" :disabled="tokens[token].lt(parseFloat(amount)) || amount==0">Send</b-button>
      </b-field>

      <b-field>
        <p class="help">{{status}}</p>
      </b-field>

      
    </section>


  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RadixIdentity, RRI, radixUniverse, RadixTransactionBuilder, RadixAccount } from 'radixdlt';
import { Subscription } from 'rxjs';
import Decimal from 'decimal.js';

export default Vue.extend({
  data() {
    return {
      tokens: {} as {[uri: string]: Decimal},

      address: '',
      amount: 0,
      token: radixUniverse.nativeToken.toString(),
      reference: '',
      status: '',

      balanceSubscription: null as (Subscription | null),
    }
  },
  name: 'send',
  computed: mapState(['identity']),
  created() {
    this.updateSubscription()
  },
  watch: {
    identity(newValue, oldValue) {
      this.updateSubscription()
    }
  },
  methods: {
    updateSubscription() {
      if (this.identity) {
        if (this.balanceSubscription) {
          this.balanceSubscription.unsubscribe()
        }

        this.balanceSubscription = this.identity.account.transferSystem.getTokenUnitsBalanceUpdates().subscribe((balance: {[tokenUri: string]: Decimal}) => {
          this.updateTokenList(balance)
        })
      }
    }, 
    updateTokenList(balance: {[tokenUri: string]: Decimal}) {
      this.tokens = balance
    },
    send() {
      try {
        const toAccount = RadixAccount.fromAddress(this.address)
        RadixTransactionBuilder.createTransferAtom(this.identity.account, toAccount, this.token, this.amount, this.reference)
          .signAndSubmit(this.identity)
          .subscribe({
            next: (status) => {
              this.status = status
            },
            complete: () => {
              this.status = 'Sent'
            },
            error: (error) => {
              this.status = error
            }
          })
      } catch(e) {
        this.status = e.message
      }
    }
  }
});
</script>
