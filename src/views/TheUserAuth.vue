<template>
  <b-container fluid class="overlay">
    <b-row align-h="center">
      <b-col cols="12" class="text-center">
        <img class="logo" src="../assets/palim-logo.png" alt="PaLimDB" :class="animation">
      </b-col>
    </b-row>
    <b-row v-if="messages.length" align-h="center">
      <b-col cols="12" sm="11" md="9" lg="7" xl="6">
        <b-alert v-for="msg of messages"
                 :key="msg.id"
                 :show="true"
                 :variant="msg.variant"
                 :class="animation"
                 class="mt-3"
                 dismissible
                 @dismissed="messages = messages.filter(m => m !== msg)"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="msg.text"/>
        </b-alert>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="12" sm="11" md="9" lg="7" xl="6">
        <router-view :class="animation" @message="onMessage"/>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="12" sm="11" md="9" lg="7" xl="6">
        <page-footer class="my-4" wrap-always/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageFooter from '@/components/PageFooter';

export default {
  name: 'the-user-auth',
  components: {
    PageFooter,
  },
  data () {
    return {
      messages: [],
      animation: [],
    };
  },
  methods: {
    onMessage (message) {
      this.messages = this.messages.filter(m => m.subject !== message.subject);
      this.messages.unshift(message);
      if (message.animation) {
        this.animation.push('animate-error');
        setTimeout(() => this.animation.pop(), 1000);
      }
    },
  },
  beforeRouteUpdate (to, from, next) {
    if (from.name !== to.name) {
      this.messages = [];
    }
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
    .logo {
      max-height: 74px;
      margin: 0 0 1.5rem;
      @media only screen and (min-width: 768px) {
        max-height: 111px;
        margin: .5rem 0 2rem;
      }
    }
    > .row > .col-12 {
      @media screen and (min-width: 1200px) {
        max-width: 730px;
      }
    }
    .alert {
      &/deep/span {
        position: relative;
        z-index: 2;
      }
      &/deep/button {
        position: absolute;
        z-index: 2;
      }
      &::after {
        left: -1px;
        top: -1px;
        z-index: 1;
        position: absolute;
        height: calc(100% + 2px);
        width: calc(100% + 2px);
        border: 1px solid rgba(0, 0, 0, .05);
        border-radius: 0.25rem;
        content: '';
      }
    }
  }
  .animate-error {
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
