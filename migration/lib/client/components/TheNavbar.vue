<template>
  <b-navbar toggleable="md" type="dark" class="bg-blue" :sticky="true">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item to="/" exact>
          <font-awesome-icon icon="home" fixed-width/>&nbsp;<span class="text-uppercase">Home</span>
        </b-nav-item>
        <b-nav-item to="/database">
          <font-awesome-icon icon="database" fixed-width/>&nbsp;<span class="text-uppercase">Database</span>
        </b-nav-item>
        <b-nav-item disabled>
          <font-awesome-icon icon="info-circle" fixed-width/>&nbsp;<span class="text-uppercase">About</span>
        </b-nav-item>
      </b-navbar-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-input-group class="mr-md-2">
            <b-form-input size="sm" type="text" placeholder="Quick Search"/>
            <b-input-group-append>
              <b-button size="sm" class="my-2 my-sm-0" type="submit">
                <font-awesome-icon icon="search"/>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-nav-form>
        <b-nav-item-dropdown right no-caret text="EN">
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#" disabled>DE</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item to="/user/login" v-if="!user">
          <font-awesome-icon icon="sign-in-alt"/>
        </b-nav-item>
        <b-nav-item-dropdown right no-caret v-if="user">
          <!-- Using button-content slot -->
          <template slot="button-content">
            <font-awesome-icon icon="user-circle"/>
          </template>
          <b-dropdown-item to="/user/profile" disabled>Profile</b-dropdown-item>
          <b-dropdown-item to="/user/logout">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
  import { mapState } from 'vuex';
  import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
  import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand';
  import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
  import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';

  export default {
    name: 'TheNavbar',
    components: {
      bNavbar,
      bNavbarBrand,
      bNavbarNav,
      bNavbarToggle,
    },
    computed: {
      ...mapState('user', [
        'user',
      ]),
    },
  };
</script>

<style lang="scss" scoped>
  .navbar {
    border-bottom: 2px solid rgba(255, 255, 255, .5);
  }
</style>
