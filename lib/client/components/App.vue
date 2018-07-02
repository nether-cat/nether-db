<template>
  <div id="app">
    <b-row>
      <b-col>
        <div id="logo" to="/" exact>
          <img src="../assets/logo.png" :alt="title" :width=300>
        </div>
      </b-col>
      <b-col>
        <the-navbar-top/>
      </b-col>
    </b-row>
    <the-navbar/>
    <div class="main">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import TheNavbar from './TheNavbar';
  import TheNavbarTop from './TheNavbarTop';

  export default {
    name: 'App',
    components: {
      TheNavbar,
      TheNavbarTop,
    },
    data () {
      return {
        msg: 'Welcome to the PaLim Database!',
        title: 'PALIM DB',
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
