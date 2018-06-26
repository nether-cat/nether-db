<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        User: <strong>{{ user ? user.email : 'not logged in' }}</strong><hr/>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-form @submit="onSubmit" novalidate>
          <div v-if="!user">
            <b-form-group id="inputGroupEmail"
                          label="Email address:"
                          label-for="emailInput"
                          description="We'll never share your email with anyone else.">
              <b-form-input id="emailInput"
                            type="email"
                            v-model="credentials.name"
                            required
                            placeholder="Enter your e-mail address">
              </b-form-input>
            </b-form-group>
            <b-form-group id="inputGroupPassword"
                          label="Your Password:"
                          label-for="passwordInput">
              <b-form-input id="passwordInput"
                            type="password"
                            v-model="credentials.password"
                            required
                            placeholder="Enter your password">
              </b-form-input>
            </b-form-group>
          </div>
          <b-button type="submit" variant="primary" size="sm">
            {{ user ? 'Logout' : 'Login' }}
          </b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import bForm from 'bootstrap-vue/src/components/form/form';
  import bFormGroup from 'bootstrap-vue/src/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/src/components/form-input/form-input';

  export default {
    name: 'TheDashboard',
    asyncData ({ renderContext, store }) {
      return store.dispatch('user/getStatus', renderContext);
    },
    data () {
      return {
        credentials: {
          name: '',
          password: '',
        },
        pending: false,
      };
    },
    computed: {
      ...mapState('user', [
        'user',
      ]),
    },
    methods: {
      ...mapActions('user', [
        'doLogin',
        'doLogout',
        'getStatus',
      ]),
      onSubmit (evt) {
        evt.preventDefault();
        if (this.user) {
          this.doLogout();
        } else {
          const credentials = {
            name: this.credentials.name,
            password: this.credentials.password
          };
          this.doLogin(credentials);
        }
      },
    },
    components: {
      bForm,
      bFormGroup,
      bFormInput,
    },
  };
</script>

<style scoped>

</style>
