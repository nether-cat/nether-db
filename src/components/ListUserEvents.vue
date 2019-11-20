<template>
  <BNavItemDropdown right no-caret>
    <template slot="button-content">
      <FontAwesomeLayers fixed-width>
        <FontAwesomeIcon icon="bell" title="Notifications"/>
        <FontAwesomeLayers v-if="listData && listData.unreadCount" class="fa-layers-counter">
          {{ listData.unreadCount }}
        </FontAwesomeLayers>
      </FontAwesomeLayers>
    </template>
    <div class="bs-popover-bottom popover fix">
      <div class="arrow"/>
    </div>
    <BDropdownGroup
      v-observe-visibility="{ callback: state => onVisibilityChange('may-change', state) }"
      class="dropdown-group dropdown-scroll"
      header="Recent notifications"
      :class="hasMore"
    >
      <div v-observe-visibility="{ callback: state => onVisibilityChange('more-top', !state), throttle: 50 }"
           class="dropdown-ledge"
      />
      <BDropdownForm
        v-for="user in (listData && listData.items || [])"
        :id="`notification-${user.uuid}`"
        :key="user.uuid"
        novalidate
        class="dropdown-item"
        @mousedown="(event) => onMouseDown(user.uuid, event)"
        @mouseup.prevent.stop
        @focus="onFocus(user.uuid)"
        @blur="onBlur(user.uuid)"
      >
        <BFormRow class="align-middle text-nowrap">
          <BCol cols="10">
            <small>
              <strong v-if="user.titlePrefix">{{ `${user.titlePrefix} ${user.fullName}` }}</strong>
              <strong v-else>{{ user.fullName }}</strong>
              <span> has signed up.</span>
            </small>
          </BCol>
          <BCol cols="2" class="pl-2 text-right">
            <small>
              <span v-if="user.userRole === 'NONE' && user.emailVerified && !user.frozen" class="text-danger">
                <FontAwesomeIcon icon="exclamation-circle"/>
              </span>
              <span v-else-if="user.frozen" class="text-secondary">
                <FontAwesomeIcon icon="times-circle"/>
              </span>
              <span v-else-if="user.userRole === 'NONE'" class="text-primary">
                <FontAwesomeIcon icon="question-circle"/>
              </span>
              <span v-else class="text-secondary">
                <FontAwesomeIcon icon="check-circle"/>
              </span>
            </small>
          </BCol>
        </BFormRow>
        <BFormRow v-show="selected[user.uuid]" class="align-middle mt-2 text-nowrap">
          <BCol>
            <small>
              <FontAwesomeIcon icon="envelope" fixed-width/>
              <span>
                {{ user.email }}
              </span>
              <span v-if="user.emailVerified" class="text-success">
                (verified)
              </span>
              <span v-else class="text-danger">
                (unverified)
              </span>
            </small>
          </BCol>
        </BFormRow>
        <BFormRow v-show="selected[user.uuid]" class="align-middle mt-2 text-nowrap">
          <BCol>
            <small>
              <span v-if="user.frozen">
                <FontAwesomeIcon icon="times-circle" fixed-width/>
                Account has been frozen.
              </span>
              <span v-else-if="user.userRole === 'NONE'">
                <FontAwesomeIcon :icon="`${user.emailVerified ? 'exclamation' : 'question'}-circle`" fixed-width/>
                Account requires an approval.
              </span>
              <span v-else>
                <FontAwesomeIcon icon="check-circle" fixed-width/>
                Account has been approved.
              </span>
            </small>
          </BCol>
        </BFormRow>
        <BFormRow v-show="selected[user.uuid]" class="align-middle mt-2 mb-1 text-nowrap">
          <BCol>
            <ApolloMutation
              v-slot="{ mutate, loading }"
              :mutation="require('@/graphql/mutations/UpdateUser.graphql')"
              :variables="{ uuid: user.uuid, frozen: !user.frozen, userRole: user.userRole || 'NONE' }"
              :tag="undefined"
              @loading="(status) => $emit('update:activity', status)"
              @done="() => listQuery.refetch({ offset: 0, first: listData.currentLength })"
            >
              <BButton
                block
                size="sm"
                :title="user.frozen ? 'Unfreeze account' : 'Freeze account'"
                :variant="loading || user.frozen ? 'info' : 'outline-info'"
                :disabled="activity"
                @click.stop.prevent="mutate()"
                @mousedown.stop.prevent
                @mouseup.stop.prevent
              >
                <FontAwesomeIcon v-if="loading" icon="spinner" fixed-width spin/>
                <FontAwesomeLayers v-else-if="user.frozen" fixed-width>
                  <FontAwesomeIcon icon="slash" :mask="['fas', 'snowflake']" transform="down-2"/>
                  <FontAwesomeIcon icon="slash"/>
                </FontAwesomeLayers>
                <FontAwesomeIcon v-else icon="snowflake" fixed-width/>
              </BButton>
            </ApolloMutation>
          </BCol>
          <BCol v-if="!user.frozen && user.userRole === 'NONE'">
            <ApolloMutation
              v-slot="{ mutate, loading }"
              :mutation="require('@/graphql/mutations/UpdateUser.graphql')"
              :variables="{ uuid: user.uuid, userRole: 'USER' }"
              :tag="undefined"
              @loading="(status) => $emit('update:activity', status)"
              @done="() => listQuery.refetch({ offset: 0, first: listData.currentLength })"
            >
              <BButton
                block
                size="sm"
                title="Approve account"
                :variant="user.emailVerified ? 'success' : 'outline-success'"
                :disabled="activity"
                @click.stop.prevent="mutate()"
                @mousedown.stop.prevent
                @mouseup.stop.prevent
              >
                <FontAwesomeIcon v-if="loading" icon="spinner" fixed-width spin/>
                <FontAwesomeIcon v-else icon="check" fixed-width/>
              </BButton>
            </ApolloMutation>
          </BCol>
          <BCol v-if="!user.frozen && !user.emailVerified">
            <ApolloMutation
              v-slot="{ mutate, loading }"
              :mutation="require('@/graphql/mutations/UpdateUser.graphql')"
              :variables="{ uuid: user.uuid, emailVerified: false }"
              :tag="undefined"
              @loading="(status) => $emit('update:activity', status)"
              @done="onSent(user.uuid)"
            >
              <BButton
                block
                size="sm"
                variant="primary"
                :title="cooldown[user.uuid] ? 'Mail has been sent' : 'Resend verification'"
                :disabled="activity || cooldown[user.uuid]"
                @click.stop.prevent="mutate()"
                @mousedown.stop.prevent
                @mouseup.stop.prevent
              >
                <FontAwesomeIcon v-if="loading" icon="spinner" fixed-width spin/>
                <FontAwesomeLayers v-else fixed-width>
                  <FontAwesomeIcon icon="circle" :mask="['fas', 'envelope']" transform="shrink-7 right-8 down-5"/>
                  <FontAwesomeIcon
                    :class="{ cooldown: cooldown[user.uuid] === true }"
                    :icon="cooldown[user.uuid] ? 'check' : 'share'"
                    transform="shrink-7 right-11 down-5"
                  />
                </FontAwesomeLayers>
              </BButton>
            </ApolloMutation>
          </BCol>
        </BFormRow>
      </BDropdownForm>
      <BDropdownText v-if="!listData || !listData.currentLength" class="my-n2 px-5 py-4 bg-light text-center">
        <small class="font-weight-light text-secondary">No items to display</small>
      </BDropdownText>
      <BDropdownForm
        v-else-if="mayFetchMore"
        id="fetchMoreBtn"
        class="dropdown-item"
        @mousedown.prevent.stop
        @mouseup.prevent.stop="fetchMore(listQuery, listData.currentLength)"
        @focus="fetchMore(listQuery, listData.currentLength, true)"
      >
        <BFormRow class="align-middle flex-nowrap text-nowrap text-muted">
          <BCol cols="5" style="flex-shrink: 1"><i class="long-dash w-100"/></BCol>
          <BCol cols="auto" class="load-more">
            <small v-if="listQuery.loading" class="px-4"><FontAwesomeIcon icon="spinner" fixed-width spin/></small>
            <small v-else><em>Load more items</em></small>
          </BCol>
          <BCol cols="6" style="flex-shrink: 1"><i class="long-dash w-100"/></BCol>
        </BFormRow>
      </BDropdownForm>
      <div v-observe-visibility="{ callback: state => onVisibilityChange('more-bottom', !state), throttle: 50 }"
           class="dropdown-ledge"
      />
    </BDropdownGroup>
  </BNavItemDropdown>
</template>

<script>
export default {
  name: 'ListUserEvents',
  props: {
    listQuery: {
      type: Object,
      default: () => ({}),
    },
    listData: {
      type: Object,
      default: () => ({
        items: [],
        currentLength: 0,
        unreadCount: 0,
      }),
    },
    pageSize: {
      type: Number,
      default: 5,
    },
    activity: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: {},
      cooldown: {},
      hasMore: {
        'more-top': false,
        'more-bottom': false,
        'may-change': false,
      },
      mayFetchMore: true,
      pointerEl: null,
    };
  },
  watch: {
    listData(newVal, oldVal) {
      if (!newVal || !oldVal) {
        return;
      }
      let newFirst = newVal.items.length && newVal.items[0].uuid;
      let oldFirst = oldVal.items.length && oldVal.items[0].uuid;
      if (newFirst !== oldFirst) {
        this.mayFetchMore = true;
      }
      if (this.pointerEl) {
        let el = this.pointerEl;
        this.pointerEl = null;
        this.$nextTick(() => {
          if (el.nextSibling.firstElementChild) {
            el.nextSibling.firstElementChild.focus();
          } else {
            el.firstElementChild.focus();
          }
        });
      }
    },
  },
  created() {
    if (!this.listData || !this.listData.items) {
      return;
    }
    this.listData.items.forEach(item => this.selected[item.uuid] = false);
  },
  methods: {
    fetchMore(query, offset, focus = false) {
      if (query.loading) {
        return;
      }
      let el, previousItem;
      if (focus) {
        el = document.getElementById('fetchMoreBtn');
        this.pointerEl = el.parentNode.previousSibling;
      }
      query.fetchMore({
        variables: { offset },
        updateQuery: (prev, { fetchMoreResult: more }) => {
          if (!more || !more.users || !more.users.length) {
            this.mayFetchMore = false;
            return prev;
          } else {
            this.mayFetchMore = !(more.users.length < this.pageSize);
            prev.users.push(...more.users);
            return prev;
          }
        },
      });
    },
    onFocus(uuid) {
      this.selected = { ...this.selected, [uuid]: true };
    },
    onBlur(uuid) {
      this.selected = { ...this.selected, [uuid]: false };
    },
    onMouseDown(uuid, event) {
      event.preventDefault();
      event.stopPropagation();
      let el = document.getElementById(`notification-${uuid}`);
      if (this.selected[uuid]) {
        el.addEventListener('mouseup', () => el.blur(), { once: true });
      } else {
        el.addEventListener('mouseup', () => el.focus(), { once: true });
      }
    },
    onSent(uuid) {
      this.cooldown = { ...this.cooldown, [uuid]: true };
      setTimeout(() => (this.cooldown = { ...this.cooldown, [uuid]: false }), 8000);
    },
    onVisibilityChange(key, hasMore) {
      if (key !== 'may-change' && !this.hasMore['may-change']) {
        return;
      }
      this.hasMore[key] = hasMore;
    },
  },
};
</script>

<style lang="scss" scoped>
  $more-color: hsla(206, 60%, 31%, 0.3);

  /deep/ .dropdown-menu {
    padding-bottom: 0;
  }
  .dropdown-group.dropdown-scroll {
    padding-bottom: .5rem !important;
    max-height: calc(32px * 8 + 1rem);
    overflow-y: scroll;
    &::before, &::after {
      content: '';
      z-index: 1;
      opacity: 0;
      display: block;
      position: absolute;
      pointer-events: none;
      width: calc(100% + 2px);
      height: 1.5rem;
      margin: -1px;
      background-clip: content-box;
      border: 1px solid transparent;
      transition: opacity .2s ease-in;
    }
    &::before {
      top: 1.875rem;
      box-shadow: inset 0 1rem 1rem -1rem $more-color;
    }
    &::after {
      bottom: 0;
      border-radius: 0 0 .25rem .25rem;
      box-shadow: inset 0 -1rem 1rem -1rem $more-color;
    }
    &.more-top::before, &.more-bottom::after {
      opacity: 1.0;
    }
    .dropdown-ledge {
      height: 1px;
      width: 100%;
    }
    .b-dropdown-text.bg-light {
      margin-bottom: 0 !important;
      border-bottom: 1px solid hsla(210, 14%, 89%, 1.0);
    }
    #fetchMoreBtn {
      padding-bottom: .125rem;
    }
    .long-dash {
      min-width: 1.5rem;
      border-top-color: hsla(210, 14%, 67%, 1.0) !important;
      border-top-style: dashed !important;
    }
    .load-more {
      min-width: fit-content;
      text-align: center;
    }
  }
  .dropdown-item:focus:not(:active) {
    position: relative;
    border: solid lightblue;
    border-width: 1px 0;
    margin: -1px 0;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: inherit;
      filter: saturate(4) brightness(1 - 1/64);
    }
  }
  .cooldown {
    animation-name: pulse;
    animation-delay: 3000ms;
    animation-duration: 500ms;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
  @keyframes pulse {
    0% {
      opacity: 1.0;
    }
    100% {
      opacity: .33;
    }
  }
</style>
