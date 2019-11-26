<template>
  <section class="section">
    <h2 class="title">Token Loookup</h2>

    <b-field class="columns is-gapless has-padding-top-15 has-padding-bottom-15">
      <b-field class="column" message="Lookup token definition details">
        <b-input placeholder="Token RRI" type="search" icon="magnify" v-model="searchValue" class="is-fullwidth " />
      </b-field>
      <p class="control column">
        <button class="button is-primary" @click="lookupToken(searchValue)">Search</button>
      </p>
    </b-field>

    <token-detail-row label="Name" :content="this.token.name" />
    <token-detail-row label="Symbol" :content="this.token.symbol" />
    <token-detail-row label="Address" :content="this.token.address" />
    <token-detail-row label="Icon URL" :content="this.token.iconUrl" />
    <token-detail-row label="Granularity" :content="this.token.granularity" />
    <token-detail-row label="Total Supply" :content="this.token.totalSupply" />
    <token-detail-row label="Supply Type" :content="this.token.supplyType" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { radixTokenManager } from 'radixdlt';
import { NotificationType } from '@/constants';
import TokensLookupDetailRow from '@/components/tokens/TokensLookupDetailRow.vue';

export default Vue.extend({
  name: 'TokensLookup',
  components: {
    'token-detail-row': TokensLookupDetailRow,
  },
  data() {
    return {
      token: {
        symbol: '',
        name: '',
        address: '',
        description: '',
        iconUrl: '',
        granularity: '',
        totalSupply: '',
        supplyType: '',
      },
      searchValue: '',
    };
  },
  methods: {
    lookupToken(reference: string) {
      radixTokenManager
        .getTokenDefinition(reference)
        .then(tokenDefinition => {
          this.token.symbol = tokenDefinition.symbol;
          this.token.name = tokenDefinition.name;
          this.token.address = tokenDefinition.address.getAddress();
          this.token.description = tokenDefinition.description;
          this.token.iconUrl = tokenDefinition.iconUrl;
          this.token.granularity = tokenDefinition.getTokenUnitsGranularity().toString();
          this.token.totalSupply = tokenDefinition.getTokenUnitsTotalSupply().toString();
        })
        .catch(error => {
          this.showStatus(error.message, NotificationType.ERROR);
        });
    },
    showStatus(message: string, type?: string) {
      this.$parent.$emit('show-notification', message, type);
    },
  },
});
</script>
