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
          <FontAwesomeIcon icon="question-circle" fixed-width/>&nbsp;<span class="text-uppercase">About</span>
        </BNavItem>
      </BNavbarNav>
      <!-- Right aligned nav items -->
      <BNavbarNav class="ml-auto">
        <BNavForm @submit.prevent="">
          <BInputGroup class="mr-md-2">
            <BFormInput size="sm" type="text" placeholder="Quick Search" disabled/>
            <BInputGroupAppend>
              <BButton size="sm" class="my-0 my-sm-0" type="submit" disabled>
                <FontAwesomeIcon icon="search" fixed-width/>
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
      <ApolloQuery
        v-if="session.state === 'AUTHORIZED'"
        v-slot="{ result: { loading, error, data } }"
        :query="require('@/graphql/queries/ListUsers.graphql')"
        :skip="session.userRole !== 'ADMIN'"
        :update="parseEvents"
        :tag="undefined"
      >
        <BNavItemDropdown right no-caret>
          <template slot="button-content">
            <FontAwesomeLayers fixed-width>
              <FontAwesomeIcon icon="bell"/>
              <FontAwesomeLayers v-if="data && data.unreadCount" class="fa-layers-counter">
                {{ data.unreadCount }}
              </FontAwesomeLayers>
            </FontAwesomeLayers>
          </template>
          <div class="bs-popover-bottom popover fix">
            <div class="arrow"/>
          </div>
          <BDropdownGroup v-if="!data || !data.recent.length" class="dropdown-group" header="Last 7 days">
            <BDropdownText class="my-n2 px-5 py-4 bg-light text-center">
              <small class="font-weight-light text-secondary">No recent events</small>
            </BDropdownText>
          </BDropdownGroup>
          <ListUserEvents v-else :data="data" :activity.sync="activity" group="recent" header="Last 7 days"/>
          <ListUserEvents v-if="data && data.before.length" :data="data" :activity.sync="activity" group="before" header="Earlier"/>
        </BNavItemDropdown>
      </ApolloQuery>
      <BNavItem v-if="session.state === 'AUTH_PENDING'" disabled>
        <FontAwesomeIcon icon="spinner" fixed-width spin/>
      </BNavItem>
      <BNavItem v-else-if="session.state !== 'AUTHORIZED'" :to="{ name: 'login', query: { redirect: $route.fullPath } }">
        <FontAwesomeIcon icon="sign-in-alt" fixed-width/>
      </BNavItem>
      <BNavItemDropdown v-else-if="session.state === 'AUTHORIZED'" right no-caret>
        <template slot="button-content">
          <FontAwesomeIcon icon="user-circle" fixed-width/>
        </template>
        <div class="bs-popover-bottom popover fix">
          <div class="arrow"/>
        </div>
        <BDropdownItem to="/user/profile" disabled>Profile</BDropdownItem>
        <BDropdownItem to="/user/settings" disabled>Settings</BDropdownItem>
        <BDropdownItem @click="doLogout">
          Logout
        </BDropdownItem>
      </BNavItemDropdown>
    </BNavbarNav>
  </BNavbar>
</template>

<script>
import moment from 'moment';
import { onLogout } from '@/vue-apollo';
import ListUserEvents from '@/components/ListUserEvents';
import LOGOUT from '@/graphql/mutations/Logout.graphql';
import SESSION from '@/graphql/queries/Session.graphql';

export default {
  name: 'ViewNavigation',
  components: {
    ListUserEvents,
  },
  data () {
    return {
      session: {
        state: 'UNAUTHORIZED',
      },
      collapsed: true,
      activity: false,
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
    parseEvents(data) {
      let initial = {
        users: [],
      };
      if (!data) {
        data = {};
      }
      data = { ...initial, ...data };
      data.users = data.users.map(u => ({ ...u, duration: moment(u.created.formatted).fromNow() }));
      let result = {
        recent: data.users.filter(u => moment(u.created.formatted).isAfter(moment().subtract(7, 'days'))),
        before: data.users.filter(u => moment(u.created.formatted).isSameOrBefore(moment().subtract(7, 'days'))),
        unreadCount: data.users.filter(u => u.userRole === 'NONE' && u.frozen !== true).length,
      };
      return result;
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
        > li {
          width: max-content;
          min-width: 100%;
          .dropdown-group {
            padding: .5rem 0;
          }
          &:last-of-type .dropdown-group {
            padding-bottom: 0;
            .b-dropdown-text.bg-light {
              border-bottom: 1px solid #dee2e6;
              margin-bottom: 0 !important;
            }
          }
          .dropdown-header {
            padding: .125rem 1rem;
            border: solid #dee2e6;
            border-width: 1px 0;
            font-weight: 500;
          }
          &:first-of-type .dropdown-header {
            margin-top: -.25rem;
            border-top: 0;
          }
          .dropdown-item {
            padding: .25rem 1rem;
          }
          form.dropdown-item {
            cursor: pointer;
            &:active {
              color: inherit;
              background-color: inherit;
              text-decoration: inherit;
            }
          }
        }
        .dropdown {
          .dropdown-toggle {
            &::before {
              position: absolute;
              left: .6875em;
              top: .6875em;
            }
            &::after {
              margin-left: .6875em;
            }
          }
          .dropdown-menu {
            margin-left: 0;
            margin-right: 0;
            top: calc(-.5rem - 1px);
          }
        }
      }
    }
    .popover.fix {
      top: -.5rem;
      width: max-content;
      min-width: 100%;
      box-shadow: none;
      .arrow {
        top: -.5rem;
        right: .25rem;
        box-shadow: none;
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
    transform: scale(0.6) translate(.75em, -1em);
    max-width: 2.5em;
    width: auto;
  }
</style>
