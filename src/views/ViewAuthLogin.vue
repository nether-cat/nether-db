<template>
  <BCard title="Log In" class="container-fluid">
    <BRow>
      <BCol>
        <hr class="mt-1 mb-4">
        <ApolloMutation
          :mutation="require('@/graphql/mutations/Login.graphql')"
          :variables="{
            email: form.email,
            password: passwordHash,
            isHash: true,
          }"
          class="form-container"
          @done="onDone"
        >
          <template slot-scope="{ mutate, loading }">
            <BForm novalidate class="mt-2 mb-1" @submit.prevent="$v.$touch(); !$v.$invalid && mutate()">
              <BFormGroup id="inputGroupEmail"
                          :class="{
                            'is-filled': !!form.email,
                            'is-invalid': $v.form.email.$error,
                          }"
                          label="Email address"
                          label-for="emailInput"
                          label-class="required"
              >
                <BFormInput id="emailInput"
                            ref="email"
                            v-model.trim="$v.form.email.$model"
                            :state="$v.form.email.$error ? false : null"
                            :disabled="loading"
                            type="email"
                            autocomplete="username"
                            spellcheck="false"
                            tabindex="1"
                            @input="validate($v.form.email)"
                            @blur="validate($v.form.email, 0)"
                />
                <div class="full-feedback">
                  Your email address is required for authentication.
                  <BFormInvalidFeedback v-if="$v.form.email.$dirty && !$v.form.email.required">
                    This is mandatory.
                  </BFormInvalidFeedback>
                  <BFormInvalidFeedback v-else-if="$v.form.email.$dirty && !$v.form.email.isValid" tag="span">
                    Input is not valid.
                  </BFormInvalidFeedback>
                </div>
              </BFormGroup>
              <BFormGroup id="inputGroupPassword"
                          :class="{
                            'focus-explicit': true,
                            'focus-within': !!passwordFocused,
                            'is-filled': !!form.password,
                            'is-invalid': $v.form.password.$error,
                          }"
                          label="Password"
                          label-for="passwordInput"
                          label-class="required"
              >
                <BInputGroup>
                  <BFormInput id="passwordInput"
                              ref="password"
                              v-model="$v.form.password.$model"
                              :state="$v.form.password.$error ? false : null"
                              :disabled="loading"
                              :type="passwordHidden ? 'password' : 'text'"
                              autocomplete="current-password"
                              spellcheck="false"
                              tabindex="2"
                              @focus="passwordFocused = true"
                              @input="validate($v.form.password)"
                              @blur="passwordFocused = false; validate($v.form.password, 0)"
                  />
                  <button slot="append"
                          type="button"
                          class="btn btn-context-toggle"
                          :class="passwordHidden ? '' : 'active'"
                          tabindex="4"
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
                <div class="full-feedback">
                  Please enter your current password.
                  <BFormInvalidFeedback v-if="$v.form.password.$dirty && !$v.form.password.required">
                    Should not be empty.
                  </BFormInvalidFeedback>
                  &rarr;&nbsp;<a class="forgot-password" tabindex="5" href="#">Forgot password?</a>
                </div>
              </BFormGroup>
              <BButton :disabled="loading" variant="primary" class="my-3 w-100" tabindex="3" type="submit">
                Log in <FontAwesomeIcon v-if="loading" icon="spinner" spin/>
              </BButton>
              <BButton :disabled="loading" variant="link" class="w-100" tabindex="6" :to="{ name: 'signup' }">
                Create new account
              </BButton>
            </BForm>
          </template>
        </ApolloMutation>
      </BCol>
    </BRow>
  </BCard>
</template>

<script>
import crypto from 'crypto';
import uuidv4 from 'uuid/v4';
import {
  required,
  email,
} from 'vuelidate/lib/validators';
import { MixinValidation } from '@/mixins/mixin-validation';
import { onLogin } from '@/vue-apollo';

export default {
  name: 'ViewAuthLogin',
  mixins: [MixinValidation],
  props: {
    q: { type: String, default: undefined },
    redirect: { type: String, default: undefined },
  },
  data () {
    return {
      form: {
        email: '',
        password: '',
      },
      passwordFocused: false,
      passwordHidden: true,
    };
  },
  validations () {
    return {
      form: {
        email: {
          required,
          isValid: email,
        },
        password: {
          required,
        },
      },
    };
  },
  computed: {
    passwordHash () {
      return crypto
        .createHash('sha256')
        .update(this.form.password)
        .digest('hex');
    },
  },
  created () {
    if (this.$props.q === 'showInfo') {
      this.$emit('message', {
        id: uuidv4(),
        variant: 'warning',
        subject: 'restriction',
        text: '<strong>Warning!</strong> You need to log in to access this resource.',
      });
    }
  },
  methods: {
    onDone ({ data }) {
      if (data.session && data.session.token) {
        onLogin(
          this.$apolloProvider.defaultClient,
          data.session.token,
        ).then(() => this.$router.replace(this.$props.redirect || '/'));
      } else if (data.session && ['AUTH_APPROVAL', 'AUTH_EMAIL'].includes(data.session.state)) {
        this.$v.form.password.$model = '';
        this.$v.form.password.$reset();
        this.$emit('message', {
          id: uuidv4(),
          variant: 'warning',
          subject: 'account',
          text: data.session.state === 'AUTH_APPROVAL'
            ? '<strong>Account not enabled.</strong> '
              + 'Please wait for a moderator to approve your account. '
              + 'You will receive an email as soon as this has happened.'
            : '<strong>Account not verified.</strong> '
              + 'Please check your emails and click our confirmation link.',
        });
      } else {
        this.$emit('message', {
          id: uuidv4(),
          variant: 'danger',
          subject: 'account',
          text: '<strong>Authentication failed!</strong> Please check your credentials.',
          animation: true,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .forgot-password {
    padding: .2rem;
    margin: -.2rem -.1rem;
  }
  .animate-error .forgot-password {
    border-radius: .25rem;
    animation: flash 1.0s;
  }
  @keyframes flash {
    0% { background-color: transparent; }
    30% { background-color: transparent; }
    50% { background-color: var(--primary); color: var(--light); }
    80% { background-color: var(--primary); color: var(--light); }
    100% { background-color: transparent; }
  }
</style>
