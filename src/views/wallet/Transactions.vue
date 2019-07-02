<template>
  <div class="section">
    <h2 class="title">My Transactions</h2>

    <b-table 
      :data="transactions" 
      show-detail-icon
      detailed
      detail-key="aid"
      >

      <template slot-scope="props">
        <b-table-column field="timestamp" label="Timestamp" sortable>
            {{props.row.timestamp}}
        </b-table-column>

        <b-table-column field="balance" label="Balance">
            <div v-for="(amount, symbol) in props.row.balance" :key="symbol">
              {{amount}} {{symbol}}
            </div>
        </b-table-column>

        <b-table-column field="participants" label="Participants">
            <div v-for="address in props.row.participants" :key="address">
              {{address}}
            </div>
        </b-table-column>

        <b-table-column field="reference" label="Reference">
            {{props.row.reference}}
        </b-table-column>

      </template>


      <template slot="detail" slot-scope="props">
        <table class="table">
          <tr>
            <td>AID</td>
            <td>{{props.row.aid}}</td>
          </tr>
        </table>
      </template>

    </b-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RadixIdentity, RadixTransactionUpdate, RadixTransaction, RRI } from 'radixdlt';
import { Subscription } from 'rxjs';

export default Vue.extend({
  data() {
    return {
      transactions: [] as Array<{
        balance: {[symbol: string]: string},
        participants: string[],
        reference: string,
        timestamp: string,
        aid: string,
      }>,

      transactionSubscription: null as (Subscription | null),
    }
  },
  name: 'transactions',
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
        if (this.transactionSubscription) {
          this.transactionSubscription.unsubscribe()
        }

        this.updateTransactionList(this.identity.account.transferSystem.transactions.values())
        
        this.transactionSubscription = this.identity.account.transferSystem.getAllTransactions().subscribe((tx: RadixTransactionUpdate) => {
          this.updateTransactionList(this.identity.account.transferSystem.transactions.values())
        })
      }
    },
    updateTransactionList(transactions: RadixTransaction[]) {
      this.transactions = []

      for (let tx of transactions) {
        
        const balance = {} as {[symbol: string]: string}
        for (let tokenUri in tx.tokenUnitsBalance) {
          const rri = RRI.fromString(tokenUri)
          balance[rri.getName()] = tx.tokenUnitsBalance[tokenUri].toString()
        }

        const participants = []
        for (let address in tx.participants) {
          participants.push(address)
        }

        this.transactions.push({
          balance,
          participants,
          timestamp: new Date(tx.timestamp).toISOString(),
          reference: tx.message,
          aid: tx.aid.toString(),
        })
      }
    },
  }
});
</script>
