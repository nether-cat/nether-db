<template>
  <div id="app">
    <the-sidebar title="PalimDB"/>
    <div class="main">
      <the-navbar title="FooBar"/>
      <the-browser></the-browser>
    </div>
  </div>
</template>

<script>
  import TheBrowser from './TheBrowser';
  import TheNavbar from './TheNavbar';
  import TheSidebar from './TheSidebar';

  export default {
    name: 'App',
    data () {
      return {
        msg: 'Welcome to the LSCS Database!',
      };
    },
    components: {
      TheBrowser,
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
