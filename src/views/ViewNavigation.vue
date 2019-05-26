<template>
  <BNavbar toggleable="md" type="dark" class="bg-theme-color" :sticky="true">
    <BNavbarToggle target="nav_collapse"/>
    <!-- BEGIN -- Icon buttons for breakpoints xs, sm -->
    <BNavbarNav class="icons d-flex d-md-none">
      <BNavItemDropdown right no-caret text="EN">
        <BDropdownItem href="#">EN</BDropdownItem>
        <BDropdownItem href="#" disabled>DE</BDropdownItem>
      </BNavItemDropdown>
      <BNavItem v-if="session.state === 'AUTH_PENDING'" disabled>
        <FontAwesomeIcon icon="spinner" spin/>
      </BNavItem>
      <BNavItem v-else-if="session.state !== 'AUTHORIZED'" :to="{ name: 'login', query: { redirect: $route.fullPath } }">
        <FontAwesomeIcon icon="sign-in-alt"/>
      </BNavItem>
      <BNavItemDropdown v-else-if="session.state === 'AUTHORIZED'" right no-caret>
        <template slot="button-content">
          <FontAwesomeIcon icon="user-circle"/>
        </template>
        <BDropdownItem to="/user/profile" disabled>Profile</BDropdownItem>
        <BDropdownItem @click="doLogout">Logout</BDropdownItem>
      </BNavItemDropdown>
    </BNavbarNav>
    <!-- END -- Icon buttons for breakpoints xs, sm -->
    <!-- TODO: Fix collapse state on leaving the route -->
    <BCollapse id="nav_collapse" is-nav>
      <BNavbarNav class="py-1 py-md-0">
        <BNavItem to="/" exact>
          <FontAwesomeIcon icon="home" fixed-width/>&nbsp;<span class="text-uppercase">Home</span>
        </BNavItem>
        <BNavItem to="/database">
          <FontAwesomeIcon icon="database" fixed-width/>&nbsp;<span class="text-uppercase">Database</span>
        </BNavItem>
        <BNavItem disabled>
          <FontAwesomeIcon icon="info-circle" fixed-width/>&nbsp;<span class="text-uppercase">About</span>
        </BNavItem>
      </BNavbarNav>
      <!-- Right aligned nav items -->
      <BNavbarNav class="ml-auto">
        <BNavForm @submit.prevent="">
          <BInputGroup class="mr-md-2">
            <BFormInput size="sm" type="text" placeholder="Quick Search" disabled/>
            <BInputGroupAppend>
              <BButton size="sm" class="my-0 my-sm-0" type="submit" disabled>
                <FontAwesomeIcon icon="search"/>
              </BButton>
            </BInputGroupAppend>
          </BInputGroup>
        </BNavForm>
        <!-- BEGIN -- Icon buttons for breakpoints md, lg, xl -->
        <BNavItemDropdown right no-caret text="EN" class="d-none d-md-inline">
          <BDropdownItem href="#">EN</BDropdownItem>
          <BDropdownItem href="#" disabled>DE</BDropdownItem>
        </BNavItemDropdown>
        <BNavItem v-if="session.state === 'AUTH_PENDING'" disabled class="d-none d-md-inline">
          <FontAwesomeIcon icon="spinner" spin/>
        </BNavItem>
        <BNavItem v-else-if="session.state !== 'AUTHORIZED'" :to="{ name: 'login', query: { redirect: $route.fullPath } }" class="d-none d-md-inline">
          <FontAwesomeIcon icon="sign-in-alt"/>
        </BNavItem>
        <BNavItemDropdown v-else-if="session.state === 'AUTHORIZED'" right no-caret class="d-none d-md-inline">
          <!-- Using button-content slot -->
          <template slot="button-content">
            <FontAwesomeIcon icon="user-circle"/>
          </template>
          <BDropdownItem to="/user/profile" disabled>Profile</BDropdownItem>
          <BDropdownItem @click="doLogout">Logout</BDropdownItem>
        </BNavItemDropdown>
        <!-- END -- Icon buttons for breakpoints md, lg, xl -->
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<script>
import { onLogout } from '@/vue-apollo';
import BNavbar from 'bootstrap-vue/es/components/navbar/navbar';
import BNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import BNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';
import LOGOUT from '@/graphql/mutations/Logout.graphql';
import SESSION from '@/graphql/queries/Session.graphql';

export default {
  name: 'ViewNavigation',
  components: {
    BNavbar,
    BNavbarNav,
    BNavbarToggle,
  },
  data () {
    return {
      session: {
        state: 'UNAUTHORIZED',
      },
      collapsed: true,
    };
  },
  apollo: {
    session: SESSION,
  },
  methods: {
    collapseNavbar() {
      if (this.collapsed === false) {
        this.collapsed = true;
      }
    },
    async doLogout () {
      this.$apollo.mutate({
        mutation: LOGOUT,
        optimisticResponse: {
          __typename: 'Mutation',
          session: {
            __typename: 'Session',
            _id: 'SESSION_INFO',
            user: 'Guest',
            userRole: 'NONE',
            token: null,
            expires: -1,
            state: 'AUTH_PENDING',
          },
        },
      }).then(() => {
        this.$router.replace(
          { name: 'login', query: { redirect: this.$route.fullPath } },
          () => onLogout(this.$apolloProvider.defaultClient),
        );
      }).catch((error) => {
        console.error(error);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .navbar {
    border-bottom: 2px solid rgba(255, 255, 255, .5);
  }
  .navbar-nav.icons {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -ms-flex-flow: row nowrap;
    flex-flow: row nowrap;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    .nav-item {
      padding-right: 0.5rem !important;
      padding-left: 0.5rem !important;
    }
    /deep/.dropdown-menu {
      position: absolute;
    }
  }
</style>
