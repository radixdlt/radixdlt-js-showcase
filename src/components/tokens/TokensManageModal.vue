<template>
  <form action="" ref="modalForm">
    <div class="modal-card">
      <header class="modal-card-head">
        <p v-if="tokenAction.toString() === 'mint'" class="modal-card-title">Mint Tokens</p>
        <p v-else class="modal-card-title">Burn Tokens</p>
      </header>
      <section class="modal-card-body">
        <b-field label="Token RRI" type="is-dark has-background-light">
          <b-input :value="tokenRRI" readonly disabled />
        </b-field>
        <b-field label="Amount">
          <b-input type="number" v-model="amount" required :use-html5-validation="false" />
        </b-field>
      </section>
      <footer class="modal-card-foot buttons is-right">
        <b-button type="is-secondary" class="is-quarter-width" @click="closeModal">Close</b-button>
        <b-button
          v-if="tokenAction.toString() === 'mint'"
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
    tokenRRI: String,
    tokenAction: String,
    tokenActionCallback: Function,
  },
  data() {
    return {
      amount: '0',
    };
  },
  methods: {
    handleMintOrBurn() {
      this.tokenActionCallback(this.tokenRRI, this.amount);
      this.closeModal();
    },
    closeModal() {
      this.$emit('close');
    },
  },
});
</script>
