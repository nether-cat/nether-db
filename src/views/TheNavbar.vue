<template>
  <b-navbar toggleable="md" type="dark" class="bg-theme-color" :sticky="true">
    <b-navbar-toggle target="nav_collapse"/>
    <!-- BEGIN -- Icon buttons for breakpoints xs, sm -->
    <b-navbar-nav class="icons d-flex d-md-none">
      <b-nav-item-dropdown right no-caret text="EN">
        <b-dropdown-item href="#">EN</b-dropdown-item>
        <b-dropdown-item href="#" disabled>DE</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item v-if="session.state === 'AUTH_PENDING'" disabled>
        <font-awesome-icon icon="spinner" spin/>
      </b-nav-item>
      <b-nav-item v-else-if="session.state !== 'AUTHORIZED'" :to="{ name: 'login', query: { redirect: $route.fullPath } }">
        <font-awesome-icon icon="sign-in-alt"/>
      </b-nav-item>
      <b-nav-item-dropdown v-else-if="session.state === 'AUTHORIZED'" right no-caret>
        <template slot="button-content">
          <font-awesome-icon icon="user-circle"/>
        </template>
        <b-dropdown-item to="/user/profile" disabled>Profile</b-dropdown-item>
        <b-dropdown-item @click="doLogout">Logout</b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
    <!-- END -- Icon buttons for breakpoints xs, sm -->
    <!-- TODO: Fix collapse state on leaving the route -->
    <b-collapse id="nav_collapse" is-nav>
      <b-navbar-nav class="py-1 py-md-0">
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
        <b-nav-form @submit.prevent="">
          <b-input-group class="mr-md-2">
            <b-form-input size="sm" type="text" placeholder="Quick Search" disabled/>
            <b-input-group-append>
              <b-button size="sm" class="my-0 my-sm-0" type="submit" disabled>
                <font-awesome-icon icon="search"/>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-nav-form>
        <!-- BEGIN -- Icon buttons for breakpoints md, lg, xl -->
        <b-nav-item-dropdown right no-caret text="EN" class="d-none d-md-inline">
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#" disabled>DE</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item v-if="session.state === 'AUTH_PENDING'" disabled class="d-none d-md-inline">
          <font-awesome-icon icon="spinner" spin/>
        </b-nav-item>
        <b-nav-item v-else-if="session.state !== 'AUTHORIZED'" :to="{ name: 'login', query: { redirect: $route.fullPath } }" class="d-none d-md-inline">
          <font-awesome-icon icon="sign-in-alt"/>
        </b-nav-item>
        <b-nav-item-dropdown v-else-if="session.state === 'AUTHORIZED'" right no-caret class="d-none d-md-inline">
          <!-- Using button-content slot -->
          <template slot="button-content">
            <font-awesome-icon icon="user-circle"/>
          </template>
          <b-dropdown-item to="/user/profile" disabled>Profile</b-dropdown-item>
          <b-dropdown-item @click="doLogout">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
        <!-- END -- Icon buttons for breakpoints md, lg, xl -->
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { onLogout } from '@/vue-apollo';
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';
import LOGOUT from '@/graphql/mutations/Logout.graphql';
import SESSION from '@/graphql/queries/Session.graphql';

export default {
  name: 'the-navbar',
  components: {
    bNavbar,
    bNavbarNav,
    bNavbarToggle,
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
    & .nav-item {
      padding-right: 0.5rem !important;
      padding-left: 0.5rem !important;
    }
  }
</style>

<style lang="scss">
  .navbar-nav.icons .dropdown-menu {
    position: absolute;
  }
</style>
