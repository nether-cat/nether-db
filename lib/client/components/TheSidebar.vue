<template>
  <div class="sidebar">
    <div class="logo">
      {{ title }}
    </div>
    <b-nav vertical>
      <b-nav-item active>
        <router-link to="/">Dashboard</router-link>
      </b-nav-item>
      <b-nav-item>
        <router-link to="/browser">Browse Data</router-link>
      </b-nav-item>
      <b-nav-item>
        Import Data
      </b-nav-item>
    </b-nav>
  </div>
</template>

<script>
  import bNav from 'bootstrap-vue/es/components/nav/nav';
  import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';

  export default {
    name: 'TheSidebar',
    props: [
      'title',
    ],
    components: {
      bNav,
      bNavItem,
    },
  };
</script>

<style scoped>

</style>
