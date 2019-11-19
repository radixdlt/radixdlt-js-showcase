<template>
  <section class="section">
    <h2 class="title">Manage Tokens</h2>
    <b-table
      :data="tokenDefinitions"
      :paginated="tokenDefinitions.length > pageSize"
      :per-page="pageSize"
      ref="table"
      hoverable
      default-sort="symbol"
      default-sort-direction="asc"
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
          {{ props.row.granularity }}
        </b-table-column>
        <b-table-column field="supply" label="Supply">
          {{ props.row.supply }}
        </b-table-column>
        <b-table-column label="Actions">
          <div class="buttons" v-if="props.row.supplyType === 'mutable'">
            <b-button
              type="is-success"
              class="has-padding-right-30 has-padding-left-30"
              icon-left="leaf"
              @click="isMintModalOpen = true"
            >
              Mint
            </b-button>
            <b-button
              type="is-danger"
              class="has-padding-right-30 has-padding-left-30"
              icon-left="fire"
              @click="isBurnModalOpen = true"
            >
              Burn
            </b-button>
            <b-modal
              :active.sync="isModalOpen"
              has-modal-card
              trap-focus
              aria-role="dialog"
              aria-modal
              ref="modalDialog"
            >
              <tokens-mint-modal
                :RRI="props.row.reference"
                :action="isMintModalOpen ? 'mint' : 'burn'"
                :mintOrBurnTokens="isMintModalOpen ? mintTokens : burnTokens"
                :closeModal="closeModal"
              />
            </b-modal>
          </div>
          <span v-else></span>
        </b-table-column>
      </template>

      <template slot="detail" slot-scope="props">
        <table class="table" aria-colspan="4">
          <tr>
            <td class="has-text-weight-bold">Token RRI</td>
            <td>{{ props.row.reference }}</td>
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
import { RadixIdentity, RadixTransactionBuilder } from 'radixdlt';
import TokensMintModal from './TokensMintBurnModal.vue';
import { NotificationType } from '@/constants';

export default Vue.extend({
  name: 'TokensManage',
  components: {
    'tokens-mint-modal': TokensMintModal,
  },
  data() {
    return {
      pageSize: 10,
      isMintModalOpen: false,
      isBurnModalOpen: false,
    };
  },
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.identity;
    },
    tokenDefinitions(): Array<{}> {
      const identity: RadixIdentity = this.$store.state.identity;

      if (!identity) return [];

      const tokenDefinitions = identity.account.tokenDefinitionSystem.tokenDefinitions;

      return tokenDefinitions.values().map(td => ({
        symbol: td.symbol,
        name: td.name,
        granularity: td.getTokenUnitsGranularity().toString(),
        supply: td.getTokenUnitsTotalSupply(),
        address: td.address,
        description: td.description,
        iconUrl: td.iconUrl,
        supplyType: td.tokenSupplyType.toString(),
        reference: '/' + td.address + '/' + td.symbol,
      }));
    },
    isModalOpen(): boolean {
      return this.isMintModalOpen || this.isBurnModalOpen;
    },
  },
  methods: {
    mintTokens(reference: string, amount: number) {
      try {
        RadixTransactionBuilder.createMintAtom(this.identity.account, reference, amount)
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
    burnTokens(reference: string, amount: number) {
      try {
        RadixTransactionBuilder.createBurnAtom(this.identity.account, reference, amount)
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
    closeModal() {
      this.isMintModalOpen = this.isBurnModalOpen = false;
    },
    showStatus(message: string, type?: string) {
      this.$parent.$emit('show-notification', message, type);
    },
  },
});
</script>
