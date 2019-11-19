<template>
  <div class="columns subtitle" v-if="content">
    <div class="column is-2 has-text-weight-light">
      {{ this.label }}
    </div>
    <div class="column is-10 has-text-weight-semibold">
      {{ this.content }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    label: String,
    content: String,
  },
});
</script>
