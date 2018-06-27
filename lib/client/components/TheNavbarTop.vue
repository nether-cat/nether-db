<template>
  <div>
    <b-navbar toggleable="md" class="text-uppercase">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav class="ml-auto">
          <b-nav-item>
            <span> | </span>
          </b-nav-item>
          <b-nav-item to="/contact">
            <span> Contact </span>
          </b-nav-item>
          <b-nav-item>
            <span> | </span>
          </b-nav-item>
          <b-nav-item disabled>
            <span> Legal information </span>
          </b-nav-item>
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
    background-color: #005a97;
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
  }

  ;
</style>