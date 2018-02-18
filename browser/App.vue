<template>
  <div id="app">
    <div class="login"></div>
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
                <i class="fa fa-user-circlesp" aria-hidden="true"></i>
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
  export default {
    name: 'app',
    data () {
      return {
        msg: 'Welcome to the LSCS Database!',
      };
    },
  };
</script>

<style lang="scss">
  $fa-font-path: "~font-awesome/fonts";
  @import '~font-awesome/scss/font-awesome';
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
