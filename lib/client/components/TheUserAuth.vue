<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" class="text-center">
        <router-link to="/" exact>
          <img class="logo" src="../assets/logo.png" alt="PaLimDB">
        </router-link>
      </b-col>
    </b-row>
    <b-row>
      <b-col/>
      <b-col cols="12" sm="10" md="7" xl="5">
        <b-card title="Login" class="container-fluid">
          <b-row>
            <b-col>
              <b-form @submit="onLogin" class="my-4">
                <div v-if="!user">
                  <b-form-group id="inputGroupEmail"
                                label="Email address:"
                                label-for="emailInput"
                                description="We'll never share your email with anyone else.">
                    <b-form-input id="emailInput"
                                  type="text"
                                  v-model="credentials.name"
                                  required
                                  placeholder="Enter your email address"
                                  autocomplete="username">
                    </b-form-input>
                  </b-form-group>
                  <b-form-group id="inputGroupPassword"
                                label="Password:"
                                label-for="passwordInput">
                    <b-form-input id="passwordInput"
                                  type="password"
                                  v-model="credentials.password"
                                  required
                                  placeholder="Enter your password"
                                  autocomplete="current-password">
                    </b-form-input>
                  </b-form-group>
                </div>
                <b-button type="submit" variant="primary" class="mt-4" block>
                  {{ user ? 'Logout' : 'Login' }}
                </b-button>
              </b-form>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
      <b-col/>
    </b-row>
  </b-container>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import bForm from 'bootstrap-vue/src/components/form/form';
  import bFormGroup from 'bootstrap-vue/src/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/src/components/form-input/form-input';

  export default {
    name: 'TheUserAuth',
    components: {
      bForm,
      bFormGroup,
      bFormInput,
    },
    props: {
      action: String,
    },
    async prefetchData ({ store, route, renderContext }) {
      let { params: { action } } = route;
      if (!store.getters['user/isAuthenticated']) {
        await store.dispatch('user/doRefresh', renderContext);
      }
      switch (action) {
        case 'login':
          if (store.getters['user/isAuthenticated']) {
            return { name: 'dashboard' };
          }
          break;
        case 'logout':
          if (store.getters['user/isAuthenticated']) {
            await store.dispatch('user/doLogout', renderContext);
          }
          return { name: 'auth', params: { action: 'login' } };
      }
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
      ...mapGetters('user', [
        'isAuthenticated'
      ]),
    },
    methods: {
      ...mapActions('user', [
        'doLogin',
        'doLogout',
        'doRefresh',
      ]),
      onLogin (evt) {
        evt.preventDefault();
        if (!this.user) {
          const credentials = {
            name: this.credentials.name,
            password: this.credentials.password,
          };
          this.doLogin(credentials)
            .then(() => this.$router.replace({ name: 'dashboard' }));
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .card {
    border-radius: 0.5rem;
  }
  .logo {
    max-height: 100px;
    margin: 40px 0 30px;
  }
</style>
