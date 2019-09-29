<template>
  <BCard title="Account Recovery" class="container-fluid">
    <BRow>
      <BCol>
        <hr class="mt-1 mb-4">
        <ApolloMutation
          :mutation="require('@/graphql/mutations/Forgot.graphql')"
          :variables="{
            email: form.email,
          }"
          class="form-container"
          @done="onDone"
        >
          <template slot-scope="{ mutate, loading }">
            <BForm novalidate class="mt-2 mb-1" @submit.prevent="$v.$touch() || !$v.$invalid && mutate()">
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
                            @input="validate($v.form.email)"
                            @blur="validate($v.form.email, 0)"
                />
                <div class="full-feedback">
                  Enter your email address to get a recovery link.
                  <BFormInvalidFeedback v-if="$v.form.email.$dirty && !$v.form.email.required">
                    This is mandatory.
                  </BFormInvalidFeedback>
                  <BFormInvalidFeedback v-else-if="$v.form.email.$dirty && !$v.form.email.isValid" tag="span">
                    Input is not valid.
                  </BFormInvalidFeedback>
                </div>
              </BFormGroup>
              <BButton :disabled="loading || timer" variant="primary" class="my-3 w-100" type="submit">
                <span>
                  Recover my account{{ timer ? ` (${timer})` : '' }}
                </span><FontAwesomeIcon v-if="loading" icon="spinner" spin/>
              </BButton>
              <BButton :disabled="loading" variant="link" class="w-100" :to="{ name: 'login' }">
                Go to log in
              </BButton>
            </BForm>
          </template>
        </ApolloMutation>
      </BCol>
    </BRow>
  </BCard>
</template>

<script>
import uuidv4 from 'uuid/v4';
import {
  required,
  email,
} from 'vuelidate/lib/validators';
import { MixinValidation } from '@/mixins/mixin-validation';

export default {
  name: 'ViewAuthForgot',
  mixins: [MixinValidation],
  props: {
    redirect: { type: String, default: undefined },
  },
  data () {
    return {
      form: {
        email: '',
      },
      timer: undefined,
      delay: 8,
    };
  },
  validations () {
    return {
      form: {
        email: {
          required,
          isValid: email,
        },
      },
    };
  },
  methods: {
    onDone ({ data }) {
      let countdown = (s) => (!s && --this.timer || (this.timer = s)) && setTimeout(countdown, 1000);
      if (data.result && data.result.success) {
        this.$v.form.email.$model = '';
        this.$v.$reset();
        countdown(8);
        this.$emit('message', {
          id: uuidv4(),
          variant: 'info',
          subject: 'account',
          text: '<strong>Request received!</strong> '
            + 'If there is an account for the provided email address, an email '
            + 'has been sent with a recovery link. Please check your inbox.',
        });
      } else {
        countdown(this.delay);
        this.delay += 4;
        this.$emit('message', {
          id: uuidv4(),
          variant: 'danger',
          subject: 'account',
          text: '<strong>Request failed!</strong> Please check the provided email address.',
          animation: true,
        });
      }
    },
  },
};
</script>
