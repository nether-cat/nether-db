<template>
  <BDropdownGroup v-if="data[group].length" class="dropdown-group" :header="header">
    <BDropdownForm
      v-for="user in data[group]"
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
            :variables="{ uuid: user.uuid, frozen: !user.frozen }"
            :tag="undefined"
            @loading="(status) => $emit('update:activity', status)"
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
  </BDropdownGroup>
</template>

<script>
export default {
  name: 'ListUserEvents',
  props: {
    header: {
      type: String,
      default: 'Events',
    },
    data: {
      type: Object,
      default: () => {},
    },
    group: {
      type: String,
      default: 'events',
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
    };
  },
  created() {
    this.data[this.group].forEach(e => this.selected[e.uuid] = false);
  },
  methods: {
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
  },
};
</script>

<style lang="scss" scoped>
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
      filter: saturate(8) brightness(1 - 1/64);
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
