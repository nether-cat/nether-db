<template>
  <BCard title="Account Verification" class="container-fluid">
    <BRow>
      <BCol>
        <hr class="mt-1 mb-4">
        <ApolloQuery
          v-slot="{ result: { loading: preparing, error, data } }"
          :query="require('@/graphql/queries/Confirmation.graphql')"
          :variables="{ token }"
          :skip="!token || !token.length"
          :tag="undefined"
          @result="onQueried"
        >
          <ApolloMutation
            v-slot="{ mutate, loading }"
            :mutation="require('@/graphql/mutations/Confirm.graphql')"
            :variables="{ token }"
            class="form-container"
            @done="onMutated"
          >
            <p>
              <span v-if="token && token.length">
                Your email address was linked with an account for this service.
              </span>
              <span v-else>
                Maybe you tried to confirm an email address linked with this service.
              </span>
              <span v-if="preparing">Please wait a moment.</span>
              <span v-else-if="payload.state === 'AUTH_EMAIL'">
                If that was you, just confirm the action by clicking below.
                Please let us know, if that's not your account.
              </span>
              <span v-else-if="payload.state === 'AUTH_EXPIRED'">
                However, the provided token has expired.
                Please click below to get an email with a new confirmation token.
              </span>
              <span v-else-if="!token || !token.length || payload.state === 'AUTH_ERROR'">
                However, no valid confirmation token has been provided.
                Please try to log in or contact us for help.
              </span>
            </p>
            <BMedia v-if="payload.user" class="account-info align-items-center flex-wrap">
              <BImg
                slot="aside"
                blank-color="#aaa"
                thumbnail
                rounded="circle"
                class="mb-3"
                height="64"
                width="64"
                alt="placeholder"
                :src="imageUrl"
              />
              <div class="mb-3">
                <strong>{{ [payload.user.titlePrefix, payload.user.fullName].filter(s => s).join(' ') }}</strong><br>
                <small class="text-muted">{{ payload.user.email }}</small>
              </div>
            </BMedia>
            <BButton :disabled="preparing || loading || done || timer"
                     type="button"
                     variant="primary"
                     class="mb-3 mt-1 w-100"
                     @click="onAction(mutate)"
            >
              <span v-if="!token || !token.length || payload.state === 'AUTH_ERROR'">Go to log in</span>
              <span v-else-if="payload.state === 'AUTH_EXPIRED'">Get a new token{{ timer ? ` (${timer})` : '' }}</span>
              <span v-else>Confirm email address</span>
              <FontAwesomeIcon v-if="preparing || loading" icon="spinner" spin/>
            </BButton>
          </ApolloMutation>
        </ApolloQuery>
      </BCol>
    </BRow>
  </BCard>
</template>

<script>
import crypto from 'crypto';
import uuidv4 from 'uuid/v4';
import get from 'lodash/get';
import BMedia from 'bootstrap-vue/es/components/media/media';

export default {
  name: 'ViewAuthConfirm',
  components: {
    BMedia,
  },
  props: {
    token: { type: String, default: '' },
  },
  data () {
    return {
      done: false,
      timer: undefined,
      payload: {},
      result: {},
    };
  },
  computed: {
    imageUrl () {
      let hash = crypto.createHash('md5').update(get(this, 'payload.user.email')).digest('hex');
      return `https://www.gravatar.com/avatar/${hash}?s=256&d=mp`;
    },
  },
  methods: {
    onQueried ({ data: { result } }) {
      this.payload = result;
    },
    onAction (mutate) {
      if (this.token && this.token.length && this.payload && this.payload.state !== 'AUTH_ERROR') {
        mutate();
      } else {
        this.$router.push({ name: 'login' });
      }
    },
    onMutated ({ data: { result } }) {
      let countdown = (s) => (!s && --this.timer || (this.timer = s)) && setTimeout(countdown, 1000);
      if (result.state === 'AUTH_EXPIRED') {
        countdown(8);
        this.$emit('message', {
          id: uuidv4(),
          variant: 'info',
          subject: 'account',
          text: '<strong>Email sent!</strong> '
            + 'Go to your inbox and click the link inside to verify your account.',
        });
      } else if (result.state === 'AUTH_APPROVAL') {
        this.done = true;
        let message = {
          id: uuidv4(),
          variant: 'info',
          subject: 'account',
          text: '<strong>Confirmation successful!</strong> Please wait for an approval by our moderators.',
        };
        this.$router.replace({ name: 'login' }, () => this.$emit('message', message));
      } else if (result.state === 'AUTH_PENDING') {
        this.done = true;
        let message = {
          id: uuidv4(),
          variant: 'success',
          subject: 'account',
          text: '<strong>Confirmation successful!</strong> You may now log in to your account.',
        };
        this.$router.replace({ name: 'login' }, () => this.$emit('message', message));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .media.account-info {
    font-size: calc(2.5vw + .225rem);
    img {
      height: 64px;
      width: 64px;
      max-height: 15vw;
      max-width: 15vw;
      &.img-thumbnail {
        height: calc(64px + .5rem);
        width: calc(64px + .5rem);
        border-radius: .5rem;
        &.rounded-circle {
          border-radius: 50% !important;
        }
      }
    }
    @media (min-width: 576px) {
      font-size: 1.225rem;
      img {
        max-height: initial;
        max-width: initial;
      }
    }
  }
</style>
