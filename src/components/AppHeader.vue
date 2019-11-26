<template>
  <identity-manage />
</template>

<script lang="ts">
import Vue from 'vue';
import IdentityManage from '@/components/identity/IdentityManage.vue';

export default Vue.extend({
  name: 'AppHeader',
  components: {
    'identity-manage': IdentityManage,
  },
});
</script>
