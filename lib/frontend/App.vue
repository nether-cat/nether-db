<template>
  <div id="app">
    <!--<div class="login"></div>-->
    <the-sidebar title="PalimDB"></the-sidebar>
    <div class="main">
      <the-navbar title="FooBar"></the-navbar>
      <b-container fluid>
        <b-row>
          <b-col cols="12">
            <h1>{{ msg }}</h1>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12">
            Some content
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import TheNavbar from './components/TheNavbar';
  import TheSidebar from './components/TheSidebar';

  export default {
    name: 'App',
    data () {
      return {
        msg: 'Welcome to the LSCS Database!',
      };
    },
    components: {
      bCol,
      bContainer,
      bRow,
      TheNavbar,
      TheSidebar,
    },
  };
</script>

<style lang="scss">
  @import '~bootstrap/scss/bootstrap';
  @import '~bootstrap-vue/dist/bootstrap-vue.css';

  #app {
    top: 0;
    bottom: 0;
    height: 100vh;
    min-height: 100vh;
    position: relative;
  }
  #app > div {
    display: block;
    height: 100%;
    max-height: 100%;
    min-height: 100%;
  }
  .sidebar {
    float: left;
    width: 260px;
    background-color: white;
    box-shadow: inset -1px 0px 0px 0px lightgrey;
    .logo {
      padding: 1rem 1rem;
      border-bottom: 1px solid lightgrey;
    }
  }
  .main {
    float: right;
    width: calc(100% - 260px);
    background-color: whitesmoke;
    > .navbar {
      border-bottom: 1px solid lightgrey;
    }
  }
</style>
