<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        <h1>Some welcome message</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        Some content
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';

  export default {
    name: 'TheBrowser',
    components: {
      bCol,
      bContainer,
      bRow,
    },
  };
</script>

<style scoped>

</style>
