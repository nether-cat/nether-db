<template>
  <b-card title="Sign Up" class="container-fluid">
    <b-row>
      <b-col>
        <hr class="mt-1 mb-4">
        <apollo-mutation
          :mutation="require('@/graphql/Signup.graphql')"
          :variables="{ user }"
          class="form-container"
          @done="onDone"
        >
          <template slot-scope="{ mutate, loading }">
            <b-form novalidate class="mt-2 mb-1" @submit.prevent="$v.$touch(); !$v.$invalid && mutate()">
              <b-form-row>
                <b-col cols="12" sm="4" md="4">
                  <b-form-group id="inputGroupTitlePrefix"
                                :class="{
                                  'is-filled': !!form.titlePrefix,
                                  'is-invalid': !!form.titlePrefix && $v.form.titlePrefix.$error,
                                  'is-valid': !!form.titlePrefix && $v.form.titlePrefix.$dirty && !$v.form.titlePrefix.$error,
                                }"
                                label="Title"
                                label-for="titlePrefixInput"
                  >
                    <b-form-input id="titlePrefixInput"
                                  ref="titlePrefix"
                                  v-model.trim="$v.form.titlePrefix.$model"
                                  :state="!!form.titlePrefix && $v.form.titlePrefix.$dirty ? !$v.form.titlePrefix.$error : null"
                                  :disabled="loading"
                                  name="titlePrefix"
                                  type="text"
                                  list="titles"
                                  autocomplete="honorific-prefix"
                                  spellcheck="false"
                                  @focus="form.titlePrefix = ''"
                                  @input="(value) => !titles.includes(value) && validate($v.form.titlePrefix)"
                                  @blur="validate($v.form.titlePrefix, 0)"
                    />
                    <b-form-invalid-feedback v-if="!!form.titlePrefix && $v.form.titlePrefix.$error && $v.form.titlePrefix.$dirty">
                      <!--Use only <kbd>A-z</kbd> <kbd>.</kbd> <kbd>&#9141;</kbd> <kbd>-</kbd>-->
                      Use only [A-z], [&nbsp;.&nbsp;], [&nbsp;-&nbsp;] or [&nbsp;&nbsp;&nbsp;]
                    </b-form-invalid-feedback>
                    <div class="full-feedback">
                      (Academic title, if any)
                    </div>
                    <datalist id="titles">
                      <option v-for="(suggestion, index) in titles" :key="index">{{ suggestion }}</option>
                    </datalist>
                  </b-form-group>
                </b-col>
                <b-col cols="12" sm="8" md="8">
                  <b-form-group id="inputGroupFullName"
                                :class="{
                                  'is-filled': !!form.fullName,
                                  'is-invalid': $v.form.fullName.$error,
                                  'is-valid': $v.form.fullName.$dirty && !$v.form.fullName.$error,
                                }"
                                label="Full name"
                                label-for="fullNameInput"
                                label-class="required"
                  >
                    <b-form-input id="fullNameInput"
                                  ref="fullName"
                                  v-model.trim="$v.form.fullName.$model"
                                  :state="$v.form.fullName.$dirty ? !$v.form.fullName.$error : null"
                                  :disabled="loading"
                                  name="fullName"
                                  type="text"
                                  autocomplete="name"
                                  spellcheck="false"
                                  @input="validate($v.form.fullName)"
                                  @blur="validate($v.form.fullName, 0)"
                    />
                    <div class="full-feedback">
                      We ask users to sign up for individial accounts and
                      not to share credentials.
                      <span v-if="!$v.form.fullName.$dirty || $v.form.fullName.required">
                        Please enter your name.
                      </span>
                      <b-form-invalid-feedback v-if="$v.form.fullName.$dirty && !$v.form.fullName.required" tag="span">
                        Please enter your name.
                      </b-form-invalid-feedback>
                      <b-form-invalid-feedback v-else-if="$v.form.fullName.$dirty && !$v.form.fullName.min" tag="span">
                        The provided name is too short.
                      </b-form-invalid-feedback>
                    </div>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-group id="inputGroupEmail"
                            :class="{
                              'is-filled': !!form.email,
                              'is-invalid': !$v.form.email.$pending && $v.form.email.$error,
                              'is-pending': $v.form.email.$pending,
                              'is-valid': $v.form.email.$dirty && !$v.form.email.$pending && !$v.form.email.$error,
                            }"
                            label="Email address"
                            label-for="emailInput"
                            label-class="required"
              >
                <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                <b-form-input id="emailInput"
                              ref="email"
                              :state="$v.form.email.$dirty && !$v.form.email.$pending ? !$v.form.email.$error : null"
                              :disabled="loading"
                              name="email"
                              type="email"
                              autocomplete="email"
                              spellcheck="false"
                              @input="(value) => validate($v.form.email, 750, value)"
                              @change="(value) => validate($v.form.email, 0, value)"
                />
                <div class="full-feedback">
                  We send emails for verification and information purposes.
                  <b-form-invalid-feedback v-if="$v.form.email.$dirty && !$v.form.email.required">
                    This is required.
                  </b-form-invalid-feedback>
                  <b-form-invalid-feedback v-else-if="($v.form.email.$dirty && !$v.form.email.$pending)
                    && (!$v.form.email.isValid || !$v.form.email.isAvailable)"
                  >
                    Address invalid or already in use.
                  </b-form-invalid-feedback>
                </div>
              </b-form-group>
              <b-form-group id="inputGroupPassword"
                            :class="{
                              'focus-explicit': true,
                              'focus-within': !!passwordFocused,
                              'is-filled': !!form.password,
                              'is-invalid': $v.form.password.$error,
                              'is-valid': $v.form.password.$dirty && !$v.form.password.$error,
                            }"
                            label="Password"
                            label-for="passwordInput"
                            label-class="required"
              >
                <b-input-group>
                  <b-form-input id="passwordInput"
                                ref="password"
                                v-model="$v.form.password.$model"
                                :state="$v.form.password.$dirty ? !$v.form.password.$error : null"
                                :disabled="loading"
                                :type="passwordHidden ? 'password' : 'text'"
                                autocomplete="new-password"
                                spellcheck="false"
                                @focus="passwordFocused = true"
                                @input="validate($v.form.password, 0)"
                                @blur="passwordFocused = false; validate($v.form.password, 0)"
                  />
                  <button slot="append"
                          type="button"
                          class="btn btn-context-toggle"
                          :class="passwordHidden ? '' : 'active'"
                          @click.stop.prevent="passwordHidden = !passwordHidden"
                          @mousedown.stop.prevent
                          @mouseup.stop.prevent
                  >
                    <font-awesome-icon
                      :icon="['far', passwordHidden ? 'eye-slash' : 'eye']"
                      :flip="passwordHidden ? 'horizontal' : undefined"
                    />
                  </button>
                </b-input-group>
                <div v-if="!$v.form.password.$dirty" class="full-feedback">
                  Should have at least 8 characters. Use uppercase, lowercase and a number.
                </div>
                <scoped v-else v-slot="{ field }" :field="$v.form.password" class="full-feedback">
                  Should have
                  <span :class="(field.req && field.min ? 'valid-' : 'invalid-') + 'feedback'">at least 8</span> characters. Use
                  <span :class="(field.req && field.upper ? 'valid-' : 'invalid-') + 'feedback'">uppercase</span>,
                  <span :class="(field.req && field.lower ? 'valid-' : 'invalid-') + 'feedback'">lowercase</span> and
                  <span :class="(field.req && field.digit ? 'valid-' : 'invalid-') + 'feedback'">a number</span>.
                </scoped>
              </b-form-group>
              <b-button :disabled="$v.form.$invalid || state.waiting || loading" type="submit" variant="primary" class="my-3 w-100">
                Create my account <font-awesome-icon v-if="loading" icon="spinner" spin/>
              </b-button>
              <b-button :disabled="loading" variant="link" class="w-100" :to="{ name: 'login' }">
                Already have an account?
              </b-button>
            </b-form>
          </template>
        </apollo-mutation>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import crypto from 'crypto';
import pickBy from 'lodash/pickBy';
import uuidv4 from 'uuid/v4';
import {
  helpers,
  required,
  minLength,
  email,
} from 'vuelidate/lib/validators';
import Validation from '@/mixins/validation';

const setupProbe = (vm) => (value) => (!value || !value.length || !email(value)) ||
  vm.$apollo.mutate({
    mutation: require('@/graphql/Signup.graphql'),
    variables: {
      user: {
        titlePrefix: '',
        fullName: '',
        email: value,
        password: { isHash: false, value: '' },
      },
      probeOnly: true,
    },
  }).then(({ data: { result } }) => result && result.success === true).catch(() => false);
const titleCheck = helpers.regex('title', /^[A-Z]+[ .\-A-Za-z]*[.A-Za-z]$/);
const passwordChecks = {
  digit: helpers.regex('lower', /[0-9]+/),
  lower: helpers.regex('lower', /[a-z]+/),
  upper: helpers.regex('upper', /[A-Z]+/),
};

const scoped = {
  functional: true,
  render () {
    const [, { data, props, scopedSlots }] = arguments;
    return <div {...data}>
      {scopedSlots.default(props)}
    </div>;
  },
};

export default {
  name: 'user-signup',
  components: {
    scoped,
  },
  mixins: [Validation],
  data: function () {
    return {
      form: {
        titlePrefix: '',
        fullName: '',
        email: '',
        password: '',
      },
      passwordFocused: false,
      passwordHidden: true,
      titles: [
        'Dr.',
        'Prof.',
      ],
    };
  },
  validations () {
    return {
      form: {
        titlePrefix: {
          title: titleCheck,
        },
        fullName: {
          required,
          min: minLength(4),
        },
        email: {
          required,
          isValid: email,
          isAvailable: setupProbe(this),
        },
        password: {
          req: required,
          min: minLength(8),
          ...passwordChecks,
        },
      },
    };
  },
  computed: {
    user () {
      return { ...pickBy(this.form, f => !!f), password: { isHash: true, value: crypto
        .createHash('sha256')
        .update(this.form.password)
        .digest('hex') } };
    },
  },
  methods: {
    onDone ({ data }) {
      if (data['result']['success']) {
        this.$router.replace({ name: 'login' }, () => this.$emit('message', {
          id: uuidv4(),
          variant: 'success',
          subject: 'account',
          text: '<strong>Signed up!</strong> '
            + 'Please check your email inbox and click our link to verify your account.',
        }));
      } else {
        this.$emit('message', {
          id: uuidv4(),
          variant: 'danger',
          subject: 'account',
          text: "<strong>Registration failed!</strong> Please double check the details you've provided.",
          animation: true,
        });
      }
    },
  },
};
</script>

<style scoped>

</style>
