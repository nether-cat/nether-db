<template>
  <div>
  <b-navbar toggleable="md" class="fixed-top navbar-dark bg-darkblue text-uppercase">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand to="/" exact>
      <img src="../assets/logo.png" :alt="title">
    </b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item to="/" exact>
          <font-awesome-icon icon="home" fixed-width/><span> Dashboard</span>
        </b-nav-item>
        <b-nav-item to="/browser">
          <font-awesome-icon icon="database" fixed-width/><span> Browse Data</span>
        </b-nav-item>
        <b-nav-item disabled>
          <font-awesome-icon icon="cloud-upload-alt" fixed-width/><span> Import Data</span>
        </b-nav-item>
        <b-nav-item disabled>
          Publications
        </b-nav-item>
        <b-nav-item disabled>
          About
        </b-nav-item>
      </b-navbar-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Quick Search"/>
          <b-button size="sm" class="my-2 my-sm-0" type="submit"><font-awesome-icon icon="search"/></b-button>
        </b-nav-form>
        <b-nav-item-dropdown text="Language" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#" disabled>DE</b-dropdown-item>
          <b-dropdown-item href="#" disabled>RU</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown right no-caret>
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
  </div>
</template>

<script>
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
  import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand';
  import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
  import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';
  import bNavForm from 'bootstrap-vue/es/components/nav/nav-form';
  import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
  import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';

  export default {
    name: 'TheNavbar',
    props: [
      'title',
    ],
    components: {
      bDropdownItem,
      bFormInput,
      bNavbar,
      bNavbarBrand,
      bNavbarNav,
      bNavbarToggle,
      bNavForm,
      bNavItem,
      bNavItemDropdown,
    },
  };
</script>

<style lang="scss">

  .bg-darkblue {
    background-color: #004a9c;
    border-bottom: 2px solid lightgrey;
  }

  .navbar {
    .navbar-brand {
      min-width: 111px;
      img {
        top: 0.25rem;
        position: fixed;
        max-height: 3rem;
      }
    }
    .navbar-sidenav .nav-link > span::before {
      content: '\002002';
    }
    @media (min-width: 768px) {
      .navbar-sidenav {
        top: 0;
        left: 0;
        position: absolute;
        overflow-x: hidden;
        overflow-y: auto;
        margin-top: 56px;
        padding-top: 1px;
        background-color: aliceblue;
        border-right: 1px solid lightgrey;
        height: calc(100vh - 56px);;
        > .nav-item {
          width: 250px;
          > .nav-link {
            padding: 1.0rem;
          }
        }
      }
    }
  };
</style>
