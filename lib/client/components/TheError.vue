<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        <h1>Oops!</h1>
        <h2>Requested page not found</h2>
        <p>Looks like you've followed a broken link or entered a URL that doesn't exist on this site.</p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';

  export default {
    name: 'TheError',
    components: {
      bCol,
      bContainer,
      bRow,
    },
  };
</script>

<style scoped>

</style>
