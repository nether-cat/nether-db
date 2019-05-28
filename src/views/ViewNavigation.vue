<template>
  <BNavbar toggleable="md" type="dark" class="bg-theme-color" :sticky="true">
    <BNavbarToggle target="nav_collapse" class="order-0"/>
    <BCollapse id="nav_collapse" is-nav class="order-2 order-md-0">
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
      </BNavbarNav>
    </BCollapse>
    <BNavbarNav class="d-flex--icons ml-auto order-1">
      <BNavItemDropdown right no-caret text="EN">
        <div class="bs-popover-bottom popover fix">
          <div class="arrow"/>
        </div>
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
          <FontAwesomeLayers>
            <FontAwesomeIcon icon="user-circle"/>
            <!--<FontAwesomeLayers class="fa-layers-counter">3</FontAwesomeLayers>-->
          </FontAwesomeLayers>
        </template>
        <div class="bs-popover-bottom popover fix">
          <div class="arrow"/>
        </div>
        <BDropdownItem to="/user/profile" disabled>Profile</BDropdownItem>
        <BDropdownItem @click="doLogout">Logout</BDropdownItem>
      </BNavItemDropdown>
    </BNavbarNav>
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
    .d-flex--icons {
      -webkit-box-orient: horizontal;
      -webkit-box-direction: normal;
      -ms-flex-direction: row;
      flex-direction: row;
      -ms-flex-flow: row nowrap;
      flex-flow: row nowrap;
      -webkit-box-pack: start;
      -ms-flex-pack: start;
      justify-content: flex-start;
      /deep/.nav-link {
        padding-right: 0.5rem !important;
        padding-left: 0.5rem !important;
      }
      /deep/.dropdown-menu {
        position: absolute;
        top: calc(100% + .5rem - 2px * 1.5);
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .125);
      }
    }
    .popover.fix {
      top: -.5rem;
      width: 100%;
      .arrow {
        top: -.5rem;
        right: 2px;
        &::before {
          top: calc(-.25rem - 1px);
          border-bottom-width: .75rem;
        }
        &::after {
          top: calc(-.25rem + 1px);
          border-bottom-width: .75rem;
        }
      }
      @at-root .navbar .collapse.show ~ .d-flex--icons .popover.fix {
        border: 1px solid rgba(0, 0, 255, 0.1);
      }
    }
  }
  .fa-layers-counter {
    font-weight: 500;
    font-size: 1.125em;
    transform: scale(0.6) translate(.8em, -1em);
    max-width: 2.5em;
    width: auto;
  }
</style>
