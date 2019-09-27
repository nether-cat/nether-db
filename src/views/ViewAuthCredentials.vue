<template>
  <BCard :title="!token ? 'Manage Account' : 'Account Recovery'" class="container-fluid">
    <BRow>
      <BCol>
        <hr class="mt-1 mb-4">
        <ApolloQuery
          v-slot="{ result: { loading: preparing, error, data } }"
          :query="require('@/graphql/queries/Credentials.graphql')"
          :variables="{ token }"
          :tag="undefined"
          @result="onQueried"
        >
          <ApolloMutation
            v-slot="{ mutate, loading }"
            :mutation="require('@/graphql/mutations/SetPassword.graphql')"
            :variables="{
              currentPassword: currentPasswordHash,
              password: passwordHash,
              token,
            }"
            class="form-container"
            @done="onMutated"
          >
            <p>
              <span v-if="token && token.length">
                An account recovery has been requested for this service.
              </span>
              <span v-else-if="payload.state === 'AUTH_PENDING'">
                You have requested to change your account's password.
              </span>
              <span v-else>
                Maybe you tried to access an account for this service.
              </span>
              <span v-if="preparing">Please wait a moment.</span>
              <span v-else-if="done">
                Your request has been processed successfully.
                Please contact us, if you face any problems.
              </span>
              <span v-else-if="payload.state === 'AUTH_PENDING'">
                In order to continue, just submit the form below.
                Please contact us, if you face any problems.
              </span>
              <span v-else-if="token && payload.state === 'AUTH_EXPIRED'">
                However, the provided token has expired.
                Please click below to get an email with a new recovery token.
              </span>
              <span v-else-if="payload.state === 'AUTH_EXPIRED'">
                However, your current session has expired.
                Please try to log in again or contact us for help.
              </span>
              <span v-else-if="invalidSessionToken || payload.state === 'AUTH_ERROR'">
                However, your browser didn't send any valid tokens.
                Please try to log in again or contact us for help.
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
            <BForm novalidate class="mt-2 mb-1" @submit.prevent="$v.$touch() || !$v.$invalid && onAction(mutate)">
              <BFormGroup v-if="!token && payload.state === 'AUTH_PENDING' && !done"
                          id="inputGroupCurrentPassword"
                          :class="{
                            'focus-explicit': true,
                            'focus-within': !!currentPasswordFocused,
                            'is-filled': !!form.currentPassword,
                            'is-invalid': $v.form.currentPassword.$error,
                          }"
                          label="Current password"
                          label-for="currentPasswordInput"
                          label-class="required"
              >
                <BInputGroup>
                  <BFormInput id="currentPasswordInput"
                              ref="currentPassword"
                              v-model="$v.form.currentPassword.$model"
                              :state="$v.form.currentPassword.$error ? false : null"
                              :disabled="loading"
                              :type="currentPasswordHidden ? 'password' : 'text'"
                              autocomplete="current-password"
                              spellcheck="false"
                              tabindex="0"
                              @focus="currentPasswordFocused = true"
                              @input="validate($v.form.currentPassword)"
                              @blur="(currentPasswordFocused = false) || validate($v.form.currentPassword, 0)"
                  />
                  <button slot="append"
                          type="button"
                          class="btn btn-context-toggle"
                          :class="currentPasswordHidden ? '' : 'active'"
                          tabindex="-1"
                          @click.stop.prevent="currentPasswordHidden = !currentPasswordHidden"
                          @mousedown.stop.prevent
                          @mouseup.stop.prevent
                  >
                    <FontAwesomeIcon
                      fixed-width
                      :icon="['far', currentPasswordHidden ? 'eye-slash' : 'eye']"
                      :flip="currentPasswordHidden ? 'horizontal' : undefined"
                    />
                  </button>
                </BInputGroup>
                <div class="full-feedback">
                  Please enter your current password.
                  <BFormInvalidFeedback v-if="$v.form.currentPassword.$dirty && !$v.form.currentPassword.required">
                    This is mandatory.
                  </BFormInvalidFeedback>
                </div>
              </BFormGroup>
              <BFormGroup v-if="payload.state === 'AUTH_PENDING' && !done"
                          id="inputGroupPassword"
                          :class="{
                            'focus-explicit': true,
                            'focus-within': !!passwordFocused,
                            'is-filled': !!form.password,
                            'is-invalid': $v.form.password.$error,
                            'is-valid': $v.form.password.$dirty && !$v.form.password.$error,
                          }"
                          label="New password"
                          label-for="passwordInput"
                          label-class="required"
              >
                <BInputGroup>
                  <BFormInput id="passwordInput"
                              ref="password"
                              v-model="$v.form.password.$model"
                              :state="$v.form.password.$dirty ? !$v.form.password.$error : null"
                              :disabled="loading"
                              :type="passwordHidden ? 'password' : 'text'"
                              autocomplete="new-password"
                              spellcheck="false"
                              tabindex="0"
                              @focus="passwordFocused = true"
                              @input="validate($v.form.password, 0)"
                              @blur="(passwordFocused = false) || validate($v.form.password, 0)"
                  />
                  <button slot="append"
                          type="button"
                          class="btn btn-context-toggle"
                          :class="passwordHidden ? '' : 'active'"
                          tabindex="-1"
                          @click.stop.prevent="passwordHidden = !passwordHidden"
                          @mousedown.stop.prevent
                          @mouseup.stop.prevent
                  >
                    <FontAwesomeIcon
                      fixed-width
                      :icon="['far', passwordHidden ? 'eye-slash' : 'eye']"
                      :flip="passwordHidden ? 'horizontal' : undefined"
                    />
                  </button>
                </BInputGroup>
                <div v-if="!$v.form.password.$dirty" class="full-feedback">
                  Must have at least 8 characters. Use uppercase, lowercase and a number.
                </div>
                <Scoped v-else v-slot="{ field }" :field="$v.form.password" class="full-feedback">
                  Must have
                  <span :class="(field.req && field.min ? 'valid-' : 'invalid-') + 'feedback'">at least 8</span> characters. Use
                  <span :class="(field.req && field.upper ? 'valid-' : 'invalid-') + 'feedback'">uppercase</span>,
                  <span :class="(field.req && field.lower ? 'valid-' : 'invalid-') + 'feedback'">lowercase</span> and
                  <span :class="(field.req && field.digit ? 'valid-' : 'invalid-') + 'feedback'">a number</span>.
                </Scoped>
              </BFormGroup>
              <BButton :disabled="$v.form.$invalid || state.waiting || preparing || loading || done || timer"
                       type="submit"
                       variant="primary"
                       class="my-3 w-100"
                       tabindex="0"
              >
                <span v-if="done">Done{{ timer ? ` (${timer})` : '' }}</span>
                <span v-else-if="token && payload.state === 'AUTH_EXPIRED'">
                  Get a new token{{ timer ? ` (${timer})` : '' }}
                </span>
                <span v-else-if="invalidSessionToken || ['AUTH_ERROR', 'AUTH_EXPIRED'].includes(payload.state)">
                  Go to log in
                </span>
                <span v-else>Set new password{{ timer ? ` (${timer})` : '' }}</span>
                <FontAwesomeIcon v-if="preparing || loading" icon="spinner" spin/>
              </BButton>
              <BButton v-if="!done && !invalidSessionToken"
                       :disabled="loading"
                       variant="link"
                       class="w-100"
                       tabindex="0"
                       :to="{ path: '/' }"
                       replace
              >
                Cancel request
              </BButton>
            </BForm>
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
import {
  helpers,
  required,
  minLength,
} from 'vuelidate/lib/validators';
import { MixinValidation } from '@/mixins/mixin-validation';
import BMedia from 'bootstrap-vue/es/components/media/media';

const passwordChecks = {
  digit: helpers.regex('lower', /[0-9]+/),
  lower: helpers.regex('lower', /[a-z]+/),
  upper: helpers.regex('upper', /[A-Z]+/),
};

const Scoped = {
  functional: true,
  render () {
    const [, { data, props, scopedSlots }] = arguments;
    return <div {...data}>
      {scopedSlots.default(props)}
    </div>;
  },
};

export default {
  name: 'ViewAuthCredentials',
  components: {
    BMedia,
    Scoped,
  },
  mixins: [MixinValidation],
  props: {
    token: { type: String, default: '' },
  },
  data () {
    return {
      form: {
        currentPassword: '',
        password: '',
      },
      currentPasswordFocused: false,
      currentPasswordHidden: true,
      passwordFocused: false,
      passwordHidden: true,
      done: false,
      timer: undefined,
      payload: {},
      result: {},
    };
  },
  validations () {
    return {
      form: {
        currentPassword: !this.token && this.payload.state === 'AUTH_PENDING' ? {
          required,
        } : {},
        password: this.payload.state === 'AUTH_PENDING' ? {
          req: required,
          min: minLength(8),
          ...passwordChecks,
        } : {},
      },
    };
  },
  computed: {
    imageUrl () {
      let hash = crypto.createHash('md5').update(get(this, 'payload.user.email')).digest('hex');
      return `https://www.gravatar.com/avatar/${hash}?s=256&d=mp`;
    },
    invalidSessionToken () {
      return (!this.payload || this.payload.state !== 'AUTH_PENDING') && (!this.token || !this.token.length);
    },
    isLoggedIn () {
      return !this.token && this.payload && this.payload.state === 'AUTH_PENDING';
    },
    currentPasswordHash () {
      return this.form.currentPassword && crypto
        .createHash('sha256')
        .update(this.form.currentPassword)
        .digest('hex') || undefined;
    },
    passwordHash () {
      return this.form.password && crypto
        .createHash('sha256')
        .update(this.form.password)
        .digest('hex') || undefined;
    },
  },
  methods: {
    onQueried ({ data: { result } }) {
      this.payload = result;
      this.$nextTick(() => {
        if (!process.env.VUE_SSR) {
          let el = document.querySelector('input#currentPasswordInput');
          if (el) {
            el.focus();
          }
        }
      });
    },
    onAction (mutate) {
      if (!this.invalidSessionToken && this.payload && this.payload.state !== 'AUTH_ERROR') {
        mutate();
      } else {
        this.$router.push({ name: 'login' });
      }
    },
    onMutated ({ data: { result } }) {
      let countdown = (s) => (!s && --this.timer || (this.timer = s)) && setTimeout(countdown, 1000);
      if (result.state === 'AUTH_UNKNOWN') {
        this.$v.form.currentPassword.$model = '';
        this.$v.form.password.$model = '';
        this.$v.$reset();
        countdown(8);
        this.$emit('message', {
          id: uuidv4(),
          variant: 'warning',
          subject: 'account',
          text: '<strong>Sorry!</strong> '
            + 'The request could not be verified. Please check your current password.',
          animation: true,
        });
      } else if (result.state === 'AUTH_EXPIRED') {
        countdown(8);
        this.$emit('message', {
          id: uuidv4(),
          variant: 'info',
          subject: 'account',
          text: '<strong>Email sent!</strong> '
            + 'Go to your inbox and click the link inside to recover your account.',
        });
      } else if (result.state === 'AUTHORIZED') {
        this.done = true;
        countdown(4);
        let message = {
          id: uuidv4(),
          variant: 'success',
          subject: 'account',
          text: '<strong>Password updated.</strong> Use it for authentication with your account.',
        };
        this.$emit('message', message);
        setTimeout(() => this.$router.replace({ name: 'login' }, () => this.$emit('message', message)), 4000);
      } else {
        this.$v.form.currentPassword.$model = '';
        this.$v.form.password.$model = '';
        this.$v.$reset();
        this.$emit('message', {
          id: uuidv4(),
          variant: 'danger',
          subject: 'account',
          text: '<strong>Request failed!</strong> '
            + 'Please try again or contact us for help.',
          animation: true,
        });
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
