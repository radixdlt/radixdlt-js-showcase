<template>
  <div class="section">
    <h2 class="title">My Balance</h2>
    <b-table :data="balance" :columns="columns"></b-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RRI } from 'radixdlt';
import { Subscription } from 'rxjs';
import Decimal from 'decimal.js';

export default Vue.extend({
  name: 'WalletBalance',
  data() {
    return {
      balance: [] as Array<{
        symbol: string;
        address: string;
        balance: string;
        uri: string;
      }>,
      columns: [
        {
          field: 'uri',
          label: 'Token RRI',
        },
        {
          field: 'balance',
          label: 'Balance',
        },
      ],
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
            this.updateBalance(balance);
          });
      }
    },
    updateBalance(balance: { [tokenUri: string]: Decimal }) {
      this.balance = [];

      for (const tokenUri of Object.keys(balance)) {
        const rri = RRI.fromString(tokenUri);
        this.balance.push({
          symbol: rri.getName(),
          address: rri.getAddress().toString(),
          uri: tokenUri,
          balance: balance[tokenUri].toString(),
        });
      }
    },
  },
});
</script>
