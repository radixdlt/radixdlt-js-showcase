<template>
  <b-menu class="has-padding-left-10">
    <div class="has-padding-left-5 has-padding-bottom-50">
      <a href="https://radixdlt.com">
        <img src="../assets/radix-logo.svg" alt="Radix Logo" height="35" style="max-height: 35px" />
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
.menu-list a {
  border-radius: 0;
}
</style>
