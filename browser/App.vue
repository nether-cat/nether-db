<template>
    <div id="app">
        <h1>{{ msg }}</h1>
    </div>
</template>

<script>
  export default {
    name: 'app',
    data () {
      return {
        msg: 'Welcome to the LSCS Database',
      }
    }
  }
</script>

<style lang="scss">
    @import '../node_modules/bootstrap/scss/bootstrap';
    @import '../node_modules/bootstrap-vue/dist/bootstrap-vue.css';
</style>
