<template>
  <b-navbar toggleable="md" fixed="top" type="dark" class="bg-darkblue">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand to="/" exact>
      <img src="../assets/logo.png" :alt="title">
    </b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item to="/" exact>
          <font-awesome-icon icon="home" fixed-width/>&nbsp;<span class="text-uppercase">Home</span>
        </b-nav-item>
        <b-nav-item to="/browser">
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
</template>

<script>
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
  import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';
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
      bInputGroup,
      bInputGroupAppend,
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
      min-width: 115px;
      img {
        top: 0.2rem;
        position: absolute;
        max-height: 3.2rem;
      }
    }
  }
</style>
