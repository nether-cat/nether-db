<template>
  <div id="app">
    <!--<div class="login"></div>-->
    <div class="sidebar">
      <div class="logo">
        PaLimDB
      </div>
      <b-nav vertical>
        <b-nav-item active>
          Dashboard
        </b-nav-item>
        <b-nav-item>
          Query Data
        </b-nav-item>
        <b-nav-item>
          Import Data
        </b-nav-item>
      </b-nav>
    </div>
    <div class="main">
      <b-navbar toggleable="md" type="light">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
        <b-navbar-brand href="#">NavBar</b-navbar-brand>
        <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav>
            <b-nav-item href="#">Link</b-nav-item>
            <b-nav-item href="#" disabled>Disabled</b-nav-item>
          </b-navbar-nav>
          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            <b-nav-form>
              <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Quick Search"/>
              <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>
            <b-nav-item-dropdown text="Language" right>
              <b-dropdown-item href="#">EN</b-dropdown-item>
              <b-dropdown-item href="#">ES</b-dropdown-item>
              <b-dropdown-item href="#">RU</b-dropdown-item>
              <b-dropdown-item href="#">FA</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown right>
              <!-- Using button-content slot -->
              <template slot="button-content">
                <font-awesome-icon icon="user-circle"/>
              </template>
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item href="#">Logout</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <b-container fluid>
        <b-row>
          <b-col cols="12">
            <h1>{{ msg }}</h1>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12">
            Some content
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bNav from 'bootstrap-vue/es/components/nav/nav';
  import bNavForm from 'bootstrap-vue/es/components/nav/nav-form';
  import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
  import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
  import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
  import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
  import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand';
  import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
  import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bButton from 'bootstrap-vue/es/components/button/button';

  export default {
    name: 'app',
    components: {
      FontAwesomeIcon,
      bContainer,
      bCol,
      bRow,
      bNav,
      bNavForm,
      bNavItem,
      bNavItemDropdown,
      bNavbar,
      bNavbarNav,
      bNavbarBrand,
      bNavbarToggle,
      bDropdownItem,
      bCollapse,
      bFormInput,
      bButton,
    },
    data () {
      return {
        msg: 'Welcome to the LSCS Database!',
      };
    },
  };
</script>

<style lang="scss">
  @import '~bootstrap/scss/bootstrap';
  @import '~bootstrap-vue/dist/bootstrap-vue.css';

  #app {
    top: 0;
    bottom: 0;
    height: 100vh;
    min-height: 100vh;
    position: relative;
  }
  #app > div {
    display: block;
    height: 100%;
    max-height: 100%;
    min-height: 100%;
  }
  .sidebar {
    float: left;
    width: 260px;
    background-color: white;
    box-shadow: inset -1px 0px 0px 0px lightgrey;
    .logo {
      padding: 1rem 1rem;
      border-bottom: 1px solid lightgrey;
    }
  }
  .main {
    float: right;
    width: calc(100% - 260px);
    background-color: whitesmoke;
    > .navbar {
      border-bottom: 1px solid lightgrey;
    }
  }
</style>
