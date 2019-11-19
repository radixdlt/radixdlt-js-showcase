<template>
  <form action="" ref="modalForm">
    <div class="modal-card">
      <header class="modal-card-head">
        <p v-if="action.toString() === 'mint'" class="modal-card-title">Mint Tokens</p>
        <p v-else class="modal-card-title">Burn Tokens</p>
      </header>
      <section class="modal-card-body">
        <b-field label="Token RRI" type="is-dark has-background-light">
          <b-input :value="RRI" readonly disabled />
        </b-field>
        <b-field label="Amount">
          <b-input type="number" v-model="amount" step="0.01" required />
        </b-field>
      </section>
      <footer class="modal-card-foot buttons is-right">
        <b-button type="is-secondary" class="is-quarter-width" @click="closeModal">Close</b-button>
        <b-button
          v-if="action.toString() === 'mint'"
          type="is-success"
          class="is-quarter-width"
          @click="handleMintOrBurn"
        >
          Mint
        </b-button>
        <b-button v-else type="is-danger" class="is-quarter-width" @click="handleMintOrBurn">
          Burn
        </b-button>
      </footer>
    </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    RRI: String,
    mintOrBurnTokens: Function,
    action: String,
    closeModal: Function,
  },
  data() {
    return {
      amount: 0,
    };
  },
  methods: {
    handleMintOrBurn() {
      this.mintOrBurnTokens(this.RRI, this.amount);
      this.closeModal();
    },
  },
});
</script>
