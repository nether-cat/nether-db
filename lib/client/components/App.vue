<template>
  <div id="app">
    <the-navbar title="PaLimDB"/>
    <div class="main">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import TheNavbar from './TheNavbar';

  export default {
    name: 'App',
    components: {
      TheNavbar,
    },
    data () {
      return {
        msg: 'Welcome to the PaLim Database!',
      };
    },
  };
</script>

<style lang="scss">
  @import '~bootstrap/scss/bootstrap';
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  @import "~@fortawesome/fontawesome/styles.css";

  html, body {
    margin: 0;
    padding: 0;
  }

  #app {
    min-height: 100vh;
    > .main {
      display: block;
      padding-top: 58px;
      min-height: calc(100vh - 58px);
      background-color: white;
      > .container-fluid {
        padding: 1.5em;
      }
    }
  }
</style>
