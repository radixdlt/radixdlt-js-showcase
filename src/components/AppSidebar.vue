<template>
  <b-menu class="has-padding-left-15">
    <div class="has-padding-top-50 has-padding-right-15 has-padding-bottom-50 has-text-centered">
      <a href="https://radixdlt.com">
        <img src="../assets/radix-logo.svg" alt="Radix Logo" class="logo" />
      </a>
    </div>
    <b-menu-list
      v-for="route in $router.options.routes.filter(r => r.name !== 'About')"
      :label="route.name"
      tag="router-link"
      :to="route"
    >
      <b-menu-item
        v-for="subRoute in route.children"
        :label="subRoute.name"
        tag="router-link"
        :to="subRoute"
        :active="subRoute.name === $route.name"
      ></b-menu-item>
    </b-menu-list>
    <b-menu-list>
      <template slot="label">
        <span>JS LIBRARY SHOWCASE</span>
      </template>
      <b-menu-item
        label="About"
        tag="router-link"
        :to="$router.options.routes.find(r => r.path === '/about')"
      >
      </b-menu-item>
    </b-menu-list>
  </b-menu>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AppSidebar',
});
</script>

<style scoped>
.logo {
  height: 40px;
  max-height: 40px;
}
</style>
