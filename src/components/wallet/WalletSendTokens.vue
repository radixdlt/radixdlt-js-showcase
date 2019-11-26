<template>
  <div class="section" v-if="identity">
    <h2 class="title">Send Tokens</h2>
    <div class="form">
      <b-field label="Source address" type="is-dark has-background-light">
        <b-input :value="identity.address.toString()" readonly></b-input>
      </b-field>

      <b-field label="Destination address">
        <b-input v-model="address"></b-input>
      </b-field>

      <b-field label="Reference">
        <b-input v-model="reference"></b-input>
      </b-field>

      <b-field label="Token RRI">
        <b-select v-model="token" placeholder="Token" expanded>
          <option v-for="(balance, token) in tokens" :value="token" :key="token">
            {{ token }}
          </option>
        </b-select>
      </b-field>
      <b-field label="Amount">
        <div id="footer-row">
          <b-field :message="getBalance()">
            <b-input type="number" min="0" step="any" v-model="amount" expanded :disabled="!token"></b-input>
          </b-field>
          <div class="glue"></div>
          <b-button @click="clear" type="is-secondary">Clear</b-button>
          <b-button @click="send" type="is-primary" :disabled="tokens[token].lt(amount || 0)">Send</b-button>
        </div>
      </b-field>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { radixUniverse, RadixTransactionBuilder, RadixAccount } from 'radixdlt';
import { Subscription } from 'rxjs';
import Decimal from 'decimal.js';
import { NotificationType } from '@/constants';

export default Vue.extend({
  name: 'WalletSendTokens',
  data() {
    return {
      tokens: {} as { [uri: string]: Decimal },
      address: '',
      amount: 0,
      token: radixUniverse.nativeToken.toString(),
      reference: '',
      status: '',
      balanceSubscription: Subscription.EMPTY as Subscription,
    };
  },
  computed: mapState(['identity']),
  created() {
    this.updateSubscription();
  },
  beforeDestroy() {
    this.balanceSubscription.unsubscribe();
  },
  watch: {
    identity(newValue, oldValue) {
      this.updateSubscription();
    },
  },
  methods: {
    updateSubscription() {
      if (this.identity) {
        this.balanceSubscription = this.identity.account.transferSystem
          .getTokenUnitsBalanceUpdates()
          .subscribe((balance: { [tokenUri: string]: Decimal }) => {
            this.updateTokenList(balance);
          });
      }
    },
    updateTokenList(balance: { [tokenUri: string]: Decimal }) {
      this.tokens = balance;
    },
    getBalance() {
      return this.token ? 'Available balance: ' + this.tokens[this.token].toString() : '';
    },
    send() {
      try {
        const toAccount = RadixAccount.fromAddress(this.address);

        RadixTransactionBuilder.createTransferAtom(
          this.identity.account,
          toAccount,
          this.token,
          this.amount,
          this.reference,
        )
          .signAndSubmit(this.identity)
          .subscribe({
            next: status => this.showStatus(status),
            complete: () => this.showStatus('SENT SUCCESSFULLY', NotificationType.SUCCESS),
            error: error => this.showStatus(error.toString(), NotificationType.ERROR),
          });
      } catch (e) {
        this.showStatus(e.message, NotificationType.ERROR);
      }
    },
    clear() {
      this.address = '';
      this.reference = '';
      this.amount = 0;
    },
    showStatus(message: string, type?: string) {
      this.$parent.$emit('show-notification', message, type);
    },
  },
});
</script>
