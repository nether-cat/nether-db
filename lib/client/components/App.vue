<template>
  <div id="app">
    <div class="header">
      <router-link to="/" exact>
        <img src="../assets/logo.png" alt="PaLimDB">
      </router-link>
      <b-nav class="float-right px-3">
        <b-nav-item to="/contact">Contact</b-nav-item>
        <b-nav-item to="/imprint" disabled>Imprint</b-nav-item>
        <b-nav-item to="/privacy" disabled>Privacy</b-nav-item>
      </b-nav>
    </div>
    <the-navbar/>

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
    display: block;
    background-color: whitesmoke;

    .header {
      display: block;
      background-color: white;

      img {
        max-height: 100px;
        padding: 5px 10px;
      }
      .nav {
        .nav-item::before {
          content: '|';
        }
        .nav-item:first-child::before {
          content: '';
        }
        .nav-link {
          display: inline-block;
          padding: 0.5rem 0.5rem;
        }
      }
    }

    .main {
      display: block;

      .container-fluid {
        padding: 1.5em;
      }
    }
    .bg-blue {
      background-color: #00589c;
    }
    a.disabled:hover {
      cursor: default;
    }

  }
</style>
