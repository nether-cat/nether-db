<template>
  <b-container class="overlay" fluid>
    <b-row>
      <b-col cols="12" class="text-center">
        <img class="logo" src="../assets/palim-logo.png" alt="PaLimDB" :class="animation">
      </b-col>
    </b-row>
    <b-row v-if="messages.length">
      <b-col/>
      <b-col cols="12" sm="10" md="7" xl="5">
        <b-alert class="mt-4" :variant="messages[0]['variant']" show :class="animation">
          {{ messages[0]['text'] }}
        </b-alert>
      </b-col>
      <b-col/>
    </b-row>
    <b-row>
      <b-col/>
      <b-col cols="12" sm="10" md="7" xl="5">
        <b-card title="Login" class="container-fluid" :class="animation">
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
import crypto from 'crypto';
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
      redirect: '/',
      messages: [],
      animation: [],
      pending: false,
    };
  },
  apollo: {
    session: SESSION,
  },
  computed: {
    redirectPath () {
      return this.$route.query['redirect'] || '/';
    },
  },
  created () {
    if (this.$route.query['d'] === null) {
      this.messages.push({
        variant: 'warning',
        text: 'You need to be logged in to access this resource.',
      });
    }
  },
  methods: {
    doLogin (evt) {
      evt.preventDefault();
      const email = this.credentials.name.toLowerCase();
      const password = crypto
        .createHash('sha256')
        .update(this.credentials.password)
        .digest('hex');
      this.pending = true;
      this.$apollo.mutate({
        mutation: LOGIN,
        variables: {
          email,
          password,
          isHash: true,
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
          onLogin(
            this.$apolloProvider.defaultClient,
            data['session']['token'],
          ).then(() => this.$router.replace(this.redirectPath));
        } else {
          this.credentials.name = '';
          this.credentials.password = '';
          this.messages.splice(0, this.messages.length);
          this.messages.push({
            variant: 'danger',
            text: 'Login failed! Please check your credentials.',
          });
          this.animation.push('shake-error');
          setTimeout(() => this.animation.pop(), 300);
        }
      }).catch((error) => {
        console.error(error);
      });
    },
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
