<template>
  <b-container class="overlay" fluid>
    <b-row>
      <b-col cols="12" class="text-center">
        <router-link :to="target" exact replace>
          <img class="logo" src="../assets/palim-logo.png" alt="PaLimDB" :class="animation">
        </router-link>
      </b-col>
    </b-row>
    <b-row>
      <b-col/>
      <b-col cols="12" sm="10" md="7" xl="5">
        <b-card title="Login" class="container-fluid" :class="animation">
          <router-link class="close" aria-label="Close" :to="target" exact replace>
            <font-awesome-icon icon="times"/>
          </router-link>
          <b-row>
            <b-col>
              <b-form class="my-4" @submit="doLogin">
                <div>
                  <b-form-group id="inputGroupEmail"
                                label="Email address:"
                                label-for="emailInput"
                  >
                    <b-form-input id="emailInput"
                                  ref="email"
                                  v-model="credentials.name"
                                  :disabled="pending"
                                  type="email"
                                  required
                                  placeholder="Enter your email address"
                                  autocomplete="username"
                    />
                  </b-form-group>
                  <b-form-group id="inputGroupPassword"
                                label="Password:"
                                label-for="passwordInput"
                  >
                    <b-form-input id="passwordInput"
                                  ref="password"
                                  v-model="credentials.password"
                                  :disabled="pending"
                                  type="password"
                                  required
                                  placeholder="Enter your password"
                                  autocomplete="current-password"
                    />
                  </b-form-group>
                </div>
                <b-button :disabled="pending" type="submit" variant="primary" class="mt-4" block>
                  Login <font-awesome-icon v-if="pending" icon="spinner" spin/>
                </b-button>
                <b-alert v-if="error" class="mt-4" variant="danger" show>
                  Login failed! Please check your credentials.
                </b-alert>
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
import { onLogin } from '@/vue-apollo';
import LOGIN from '@/graphql/Login.graphql';
import SESSION from '@/graphql/Session.graphql';

export default {
  name: 'TheUserAuth',
  data () {
    return {
      session: {
        state: 'UNAUTHORIZED',
      },
      credentials: {
        name: '',
        password: '',
      },
      target: '/',
      error: false,
      pending: false,
      animation: [],
    };
  },
  apollo: {
    session: SESSION,
  },
  methods: {
    doLogin (evt) {
      evt.preventDefault();
      const email = this.credentials.name.toLowerCase();
      const password = this.credentials.password;
      this.pending = true;
      this.$apollo.mutate({
        mutation: LOGIN,
        variables: {
          email,
          password,
          isHash: false,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          session: {
            __typename: 'Session',
            _id: '0',
            user: 'Guest',
            userRole: 'NONE',
            token: null,
            expires: -1,
            state: 'AUTH_PENDING',
          },
        },
      }).then(({ data }) => {
        this.pending = false;
        if (data['session']['token']) {
          this.error = false;
          this.credentials.password = '';
          this.$router.replace(this.target);
          return onLogin(
            this.$apolloProvider.defaultClient,
            data['session']['token'],
          );
        } else {
          this.error = true;
          this.animation.push('shake-error');
          setTimeout(() => this.animation.pop() && this.$refs.password.$el.focus(), 300);
        }
      }).catch((error) => {
        console.error(error);
      });
    },
  },
  beforeRouteEnter (to, from, next) {
    let { name, params } = from;
    if (!name) {
      name = 'dashboard';
      params = {};
    }
    next(vm => {
      if (vm.session.state === 'AUTHORIZED') {
        vm.$router.replace({ name, params });
      } else {
        vm.target = { name, params };
      }
    });
  },
  beforeRouteLeave (to, from, next) {
    // TODO: Check behaviour while login mutation is in flight
    this.error = false;
    next();
  },
};
</script>

<style lang="scss" scoped>
  .overlay {
    background: #f5f5f5;
    position: absolute;
    z-index: 9999;
    height: 100vh;
    width: 100vw;
    top: 0;
  }
  .logo {
    max-height: 100px;
    margin: 40px 0 30px;
  }
  .card .close {
    color: #212529;
    font-size: 1rem;
    position: absolute;
    top: 1.25em;
    right: 2.5em;
  }
  .shake-error {
    animation: shake 0.3s;
  }
  @keyframes shake {
    0% {
      transform: translate(0, 0);
    }
    10% {
      transform: translate(0.7em, 0.3em);
    }
    20% {
      transform: translate(-0.5em, -0.5em);
    }
    30% {
      transform: translate(0.5em, 0.1em);
    }
    40% {
      transform: translate(-0.6em, 0.4em);
    }
    50% {
      transform: translate(0.0em, -0.2em);
    }
    60% {
      transform: translate(0.5em, 0.5em);
    }
    70% {
      transform: translate(-0.7em, 0.3em);
    }
    80% {
      transform: translate(-0.1em, 0.1em);
    }
    90% {
      transform: translate(0.7em, -0.4em);
    }
    100% {
      transform: translate(0, 0);
    }
  }
</style>
