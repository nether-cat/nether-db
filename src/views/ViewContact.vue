<template>
  <BContainer fluid class="content">
    <BRow align-h="center">
      <BCol cols="12" xl="7">
        <BAlert :show="sent"
                variant="success"
                class="mt-3 alert-dismissible"
        >
          <span><strong>Thank you!</strong> Your message has been sent. We will contact you shortly!</span>
          <button type="button"
                  aria-label="Close"
                  class="close"
                  tabindex="-1"
                  @click="sent = false"
                  v-text="'×'"
          />
        </BAlert>
        <BCard class="h-100" title="Contact">
          <hr class="mt-1 mb-4">
          <ApolloMutation
            :mutation="require('@/graphql/mutations/ContactStaff.graphql')"
            :variables="variables"
            class="form-container"
            @done="onDone"
          >
            <template slot-scope="{ mutate, loading }">
              <BForm novalidate class="mt-2 mb-1" @submit.prevent="$v.$touch() || !$v.$invalid && mutate()">
                <p class="mb-3">
                  Having some feedback, suggestions or questions regarding VARDA?
                </p>
                <p class="mb-3 pb-2">
                  <FontAwesomeIcon :icon="['far', 'hand-point-right']" fixed-width/>
                  Just submit the form below in order to get in touch with us.
                </p>
                <BFormRow>
                  <BCol cols="12" sm="4" md="4">
                    <BFormGroup id="inputGroupTitlePrefix"
                                :class="{
                                  'is-filled': !!form.titlePrefix,
                                  'is-invalid': !!form.titlePrefix && $v.form.titlePrefix.$error,
                                  'is-valid': !!form.titlePrefix && $v.form.titlePrefix.$dirty && !$v.form.titlePrefix.$error,
                                }"
                                label="Title"
                                label-for="titlePrefixInput"
                                :label-class="loading ? ['disabled'] : []"
                    >
                      <BFormInput id="titlePrefixInput"
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
                      <BFormInvalidFeedback v-if="!!form.titlePrefix && $v.form.titlePrefix.$error && $v.form.titlePrefix.$dirty">
                        Use only [A-z], [&nbsp;.&nbsp;], [&nbsp;-&nbsp;] or [&nbsp;&nbsp;&nbsp;]
                      </BFormInvalidFeedback>
                      <div class="full-feedback">
                        (Academic title, if any)
                      </div>
                      <datalist id="titles">
                        <option v-for="(suggestion, index) in titles" :key="index">{{ suggestion }}</option>
                      </datalist>
                    </BFormGroup>
                  </BCol>
                  <BCol cols="12" sm="8" md="8">
                    <BFormGroup id="inputGroupFullName"
                                :class="{
                                  'is-filled': !!form.fullName,
                                  'is-invalid': $v.form.fullName.$error,
                                  'is-valid': $v.form.fullName.$dirty && !$v.form.fullName.$error,
                                }"
                                label="Full name"
                                label-for="fullNameInput"
                                :label-class="loading ? ['disabled', 'required'] : ['required']"
                    >
                      <BFormInput id="fullNameInput"
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
                        Who is contacting us?
                        <span v-if="!$v.form.fullName.$dirty || $v.form.fullName.required">
                          Please enter your name.
                        </span>
                        <BFormInvalidFeedback v-if="$v.form.fullName.$dirty && !$v.form.fullName.required" tag="span">
                          Please enter your name.
                        </BFormInvalidFeedback>
                        <BFormInvalidFeedback v-else-if="$v.form.fullName.$dirty && !$v.form.fullName.name" tag="span">
                          Contains disallowed symbols: {{ nameIllegalPortions }}.
                        </BFormInvalidFeedback>
                        <BFormInvalidFeedback v-else-if="$v.form.fullName.$dirty && !$v.form.fullName.min" tag="span">
                          The provided name is too short.
                        </BFormInvalidFeedback>
                      </div>
                    </BFormGroup>
                  </BCol>
                </BFormRow>
                <BFormGroup id="inputGroupEmail"
                            :class="{
                              'is-filled': !!form.email,
                              'is-invalid': $v.form.email.$error,
                              'is-valid': $v.form.email.$dirty && !$v.form.email.$error,
                            }"
                            label="Email address"
                            label-for="emailInput"
                            :label-class="loading ? ['disabled', 'required'] : ['required']"
                >
                  <BFormInput id="emailInput"
                              ref="email"
                              v-model.trim="$v.form.email.$model"
                              :state="$v.form.email.$dirty ? !$v.form.email.$error : null"
                              :disabled="loading"
                              type="email"
                              autocomplete="username"
                              spellcheck="false"
                              tabindex="0"
                              @input="(value) => validate($v.form.email, 750, value)"
                              @change="(value) => validate($v.form.email, 0, value)"
                  />
                  <div class="full-feedback">
                    Where should we send our email reply to?
                    <BFormInvalidFeedback v-if="$v.form.email.$dirty && !$v.form.email.required">
                      This is mandatory.
                    </BFormInvalidFeedback>
                    <BFormInvalidFeedback v-else-if="$v.form.email.$dirty && !$v.form.email.isValid" tag="span">
                      Input is not valid.
                    </BFormInvalidFeedback>
                  </div>
                </BFormGroup>
                <BFormGroup id="inputGroupMessage"
                            :class="{
                              'is-filled': !!form.message,
                              'is-invalid': $v.form.message.$error,
                              'is-valid': $v.form.message.$dirty && !$v.form.message.$error,
                            }"
                            label="Your message"
                            label-for="messageInput"
                            :label-class="loading ? ['disabled', 'required'] : ['required']"
                >
                  <BFormTextarea id="messageInput"
                                 ref="message"
                                 v-model.trim="$v.form.message.$model"
                                 :state="$v.form.message.$dirty ? !$v.form.message.$error : null"
                                 :disabled="loading"
                                 class="no-icon"
                                 name="message"
                                 rows="3"
                                 max-rows="15"
                                 spellcheck="true"
                                 style="min-height: calc(5.25rem + 2px); max-height: calc(100vh - 45rem);"
                                 @input="validate($v.form.message, 750)"
                                 @blur="validate($v.form.message, 0)"
                  />
                  <!-- FIXME: Put textarea style in a seperate class and respect breakpoints -->
                  <div class="full-feedback">
                    Message length:
                    <span v-if="!$v.form.message.$invalid">{{ form.message.length }}</span>
                    <BFormInvalidFeedback v-else tag="span">{{ form.message.length }}</BFormInvalidFeedback> / 5000
                    {{ $v.form.message.$error ? '—' : '' }}
                    <BFormInvalidFeedback v-if="$v.form.message.$dirty && !$v.form.message.required" tag="span">
                      Please enter some text.
                    </BFormInvalidFeedback>
                    <BFormInvalidFeedback v-else-if="$v.form.message.$dirty && !$v.form.message.min" tag="span">
                      Input is too short.
                    </BFormInvalidFeedback>
                    <BFormInvalidFeedback v-else-if="$v.form.message.$dirty && !$v.form.message.max" tag="span">
                      Input is too long.
                    </BFormInvalidFeedback>
                  </div>
                </BFormGroup>
                <BButton :disabled="$v.form.$invalid || state.waiting || loading" type="submit" variant="primary" class="my-3 w-100">
                  <span>Send my message</span><FontAwesomeIcon v-if="loading" icon="spinner" spin/>
                </BButton>
              </BForm>
            </template>
          </ApolloMutation>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import {
  helpers,
  required,
  minLength,
  maxLength,
  email,
} from 'vuelidate/lib/validators';
import { MixinValidation } from '@/mixins/mixin-validation';
import pickBy from 'lodash/pickBy';

const titleCheck = helpers.regex('title', /^[A-Z][.\-A-Za-z]+ ?[.A-Za-z]+$/);
const nameCheck = helpers.regex('name', /^[^@$%<>#"\\[\]{}]*$/);

export default {
  name: 'ViewContact',
  mixins: [MixinValidation],
  apollo: {
    user: {
      query: ESLint$1.gql`
        query getUserData {
          user: Session {
            titlePrefix
            fullName
            email: user
            _id
          }
        }
      `,
    },
  },
  data () {
    return {
      user: {
        titlePrefix:  '',
        fullName: '',
        email: '',
      },
      form: {
        titlePrefix: '',
        fullName: '',
        email: '',
        message: '',
      },
      titles: [
        'Dr.',
        'Prof.',
      ],
      sent: false,
    };
  },
  computed: {
    variables () {
      const sender = {
        ...pickBy(this.form, (v, k) => !!v && (
          ['titlePrefix', 'fullName', 'email']
        ).includes(k)),
      };
      return { sender, message: this.form.message };
    },
    nameIllegalPortions () {
      const re = /[@$%<>#\\[\]{}]+/g;
      let illegalPortions = '';
      if (this.form.fullName) {
        let illegalPortion = undefined;
        while (([illegalPortion] = re.exec(this.form.fullName) || []) && illegalPortion) {
          illegalPortions += illegalPortion;
        }
      }
      return illegalPortions;
    },
  },
  watch: {
    user (newVal) {
      if (newVal && newVal.email && newVal.email !== 'guest') {
        Object.keys(newVal).forEach(key => {
          if (newVal[key] && this.$v.form[key]) {
            this.$v.form[key].$model = newVal[key];
          }
        });
      }
    },
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
          name: nameCheck,
        },
        email: {
          required,
          isValid: email,
        },
        message: {
          required,
          min: minLength(25),
          max: maxLength(5000),
        },
      },
    };
  },
  methods: {
    onDone ({ data }) {
      let maybe = data.result && data.result.success ? '' : 'not ';
      console.log(`[API] Message has ${ maybe }been sent.`);
      if (!maybe) {
        this.sent = true;
        let prefill = this.user.email !== 'guest' ? this.user : {};
        this.$v.form.$reset();
        Object.keys(this.form).forEach(key => {
          if (prefill[key]) {
            this.$v.form[key].$model = prefill[key];
          } else {
            this.form[key] = '';
          }
        });
      }
    },
  },
};
</script>
