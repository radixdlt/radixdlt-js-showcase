<template>
  <section class="section" v-if="identity">
    <h2 class="title">Create Tokens</h2>
    <div class="form">
      <b-field grouped>
        <b-field label="Symbol">
          <b-input v-model="symbol" placeholder="BTC" />
        </b-field>
        <b-field label="Name" expanded>
          <b-input v-model="name" placeholder="Bitcoin" />
        </b-field>
      </b-field>

      <b-field label="Description">
        <b-input v-model="description" placeholder="A blockchain based decentralized digital currency token"></b-input>
      </b-field>

      <b-field grouped>
        <b-field label="Granularity">
          <b-input type="number" v-model="granularity" :use-html5-validation="false"></b-input>
        </b-field>
        <b-field
          label="Amount"
          expanded
          :type="isAmountValid ? 'is-normal' : 'is-danger'"
          :message="isAmountValid ? null : `Amount has to be a multiple of token's granularity`"
        >
          <b-input type="number" v-model="amount" :use-html5-validation="false"></b-input>
        </b-field>
      </b-field>

      <b-field label="Icon URL">
        <b-input v-model="iconUrl"></b-input>
      </b-field>

      <b-field label="Issuance type">
        <div id="footer-row">
          <b-field class="radio-group" expanded>
            <b-radio v-model="multiIssuance" native-value="false">
              Single-Issuance
            </b-radio>
            <b-radio v-model="multiIssuance" native-value="true" class="has-padding-left-10">
              Multi-Issuance
            </b-radio>
          </b-field>
          <div class="glue"></div>
          <b-button @click="handleClear" type="is-secondary">Clear</b-button>
          <b-button
            @click="handleSubmit"
            type="is-primary"
            :disabled="!(this.symbol && this.name && this.description && this.amount > 0 && this.granularity > 0)"
          >
            Create Token
          </b-button>
        </div>
      </b-field>
    </div>
  </section>
</template>

<script lang="ts">
import { RadixTransactionBuilder, RadixIdentity } from 'radixdlt';
import Vue from 'vue';
import { NotificationType } from '@/constants';
import { Decimal } from 'decimal.js';

const defaultIconURL = 'https://i.imgur.com/mP71VI7.png';

export default Vue.extend({
  name: 'TokensCreate',
  data() {
    return {
      symbol: '',
      name: '',
      description: '',
      granularity: '1',
      amount: '1000',
      iconUrl: '',
      multiIssuance: false,
      isAmountValid: true,
    };
  },
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.identity;
    },
  },
  methods: {
    handleSubmit() {
      this.isAmountValid = this.validateAmount();

      if (!this.isAmountValid) return;

      try {
        const transactionBuilder = new RadixTransactionBuilder();
        this.multiIssuance
          ? this.defineToken(transactionBuilder.createTokenMultiIssuance.bind(transactionBuilder))
          : this.defineToken(transactionBuilder.createTokenSingleIssuance.bind(transactionBuilder));
      } catch (e) {
        this.showStatus(e.message, NotificationType.ERROR);
      }
    },
    handleClear() {
      this.symbol = '';
      this.name = '';
      this.description = '';
      this.granularity = '1';
      this.amount = '1000';
      this.iconUrl = '';
    },
    showStatus(message: string, type?: string) {
      this.$parent.$emit('show-notification', message, type);
    },
    defineToken(tokenConstructor: (...args: any) => RadixTransactionBuilder) {
      tokenConstructor(
        this.identity.account,
        this.name,
        this.symbol,
        this.description,
        this.granularity,
        this.amount,
        this.iconUrl || defaultIconURL,
      )
        .signAndSubmit(this.identity)
        .subscribe({
          next: status => this.showStatus(status),
          complete: () => this.showStatus('TOKEN DEFINITION CREATED', NotificationType.SUCCESS),
          error: error => this.showStatus(error.message || error, NotificationType.ERROR),
        });
    },
    validateAmount(): boolean {
      return new Decimal(this.amount)
        .times(100)
        .modulo(new Decimal(this.granularity).times(100))
        .dividedBy(100)
        .isZero();
    },
  },
});
</script>
