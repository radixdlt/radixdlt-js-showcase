<template>
  <section class="section">
    <h2 class="title">Manage Tokens</h2>
    <b-table
      :data="tokenDefinitionsData"
      :paginated="tokenDefinitions.size > pageSize"
      :per-page="pageSize"
      ref="table"
      hoverable
      detailed
      detail-key="description"
      show-detail-icon
    >
      <template slot-scope="props">
        <b-table-column width="30">
          <div v-if="props.row.iconUrl" class="image is-24x24"><img :src="props.row.iconUrl" alt="" /></div>
        </b-table-column>
        <b-table-column field="symbol" label="Symbol" width="150" sortable>
          {{ props.row.symbol }}
        </b-table-column>
        <b-table-column field="name" label="Name" sortable>
          {{ props.row.name }}
        </b-table-column>
        <b-table-column field="granularity" label="Granularity">
          {{ props.row.getTokenUnitsGranularity() }}
        </b-table-column>
        <b-table-column field="supply" label="Supply">
          {{ props.row.getTokenUnitsTotalSupply() }}
        </b-table-column>
        <b-table-column label="Actions">
          <div class="buttons" v-if="props.row.tokenSupplyType === 'mutable'">
            <b-button
              type="is-success"
              class="has-padding-right-30 has-padding-left-30"
              icon-left="leaf"
              @click="openModal(getTokenRRI(props.row), 'mint')"
            >
              Mint
            </b-button>
            <b-button
              type="is-danger"
              class="has-padding-right-30 has-padding-left-30"
              icon-left="fire"
              @click="openModal(getTokenRRI(props.row), 'burn')"
            >
              Burn
            </b-button>
          </div>
          <span v-else></span>
        </b-table-column>
      </template>

      <template slot="detail" slot-scope="props">
        <table class="table" aria-colspan="4">
          <tr>
            <td class="has-text-weight-bold">Token RRI</td>
            <td>{{ getTokenRRI(props.row) }}</td>
          </tr>
          <tr>
            <td class="has-text-weight-bold">Description</td>
            <td>{{ props.row.description }}</td>
          </tr>
        </table>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="emoticon-sad" size="is-large" />
            </p>
            <p>No data.</p>
          </div>
        </section>
      </template>
    </b-table>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { RadixIdentity, RadixTokenDefinition, RadixTransactionBuilder } from 'radixdlt';
import TokensActionModal from './TokensActionModal.vue';
import { NotificationType } from '@/constants';
import Decimal from 'decimal.js';
import { Subscription } from 'rxjs';

export default Vue.extend({
  name: 'TokensManage',
  data() {
    return {
      pageSize: 10,
      tokenDefinitions: new Map<String, RadixTokenDefinition>(),
      tokenUpdatesSubscription: {} as Subscription,
      tokenUpdatesTracker: 1,
    };
  },
  created() {
    if (this.identity) {
      this.loadTokenDefinitions();
      this.subscribeToUpdates();
    }
  },
  beforeDestroy() {
    this.tokenUpdatesSubscription.unsubscribe();
  },
  watch: {
    identity(newValue, oldValue) {
      if (newValue) {
        this.loadTokenDefinitions();
        this.subscribeToUpdates();
      }
    },
  },
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.identity;
    },
    tokenDefinitionsData(): any {
      return this.tokenUpdatesTracker && Array.from(this.tokenDefinitions.values());
    },
  },
  methods: {
    loadTokenDefinitions() {
      this.identity.account.tokenDefinitionSystem.tokenDefinitions
        .values()
        .map(td => this.tokenDefinitions.set(this.getTokenRRI(td), td));
    },
    subscribeToUpdates() {
      this.tokenUpdatesSubscription = this.identity.account.tokenDefinitionSystem
        .getAllTokenDefinitionObservable()
        .subscribe(td => {
          this.tokenDefinitions.set(this.getTokenRRI(td), td);
          this.tokenUpdatesTracker += 1;
        });
    },
    mintTokens(tokenReference: string, amount: string) {
      try {
        RadixTransactionBuilder.createMintAtom(this.identity.account, tokenReference, new Decimal(amount))
          .signAndSubmit(this.identity)
          .subscribe({
            next: status => this.showStatus(status),
            complete: () => this.showStatus('Tokens have been minted', NotificationType.SUCCESS),
            error: error => this.showStatus(error.message, NotificationType.ERROR),
          });
      } catch (e) {
        this.showStatus(e.message, NotificationType.ERROR);
      }
    },
    burnTokens(tokenReference: string, amount: string) {
      try {
        RadixTransactionBuilder.createBurnAtom(this.identity.account, tokenReference, new Decimal(amount))
          .signAndSubmit(this.identity)
          .subscribe({
            next: status => this.showStatus(status),
            complete: () => this.showStatus('Tokens have been burned', NotificationType.SUCCESS),
            error: error => this.showStatus(error.message, NotificationType.ERROR),
          });
      } catch (e) {
        this.showStatus(e.message, NotificationType.ERROR);
      }
    },
    getTokenRRI(td: RadixTokenDefinition) {
      return '/' + td.address + '/' + td.symbol;
    },
    openModal(tokenReference: string, action: string) {
      this.$buefy.modal.open({
        parent: this,
        component: TokensActionModal,
        hasModalCard: true,
        trapFocus: true,
        ariaModal: true,
        ariaRole: 'dialog',
        props: {
          tokenRRI: tokenReference,
          tokenAction: action,
          tokenActionCallback: action === 'mint' ? this.mintTokens : this.burnTokens,
        },
      });
    },
    showStatus(message: string, type?: string) {
      this.$parent.$emit('show-notification', message, type);
    },
  },
});
</script>
