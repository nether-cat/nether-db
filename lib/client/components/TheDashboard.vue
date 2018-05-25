<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        <h1>Some welcome message</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        Some content: {{ count }}
        <hr/>
        <b-button @click="increment" variant="primary" size="sm">Increment</b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';

  export default {
    name: 'TheDashboard',
    computed: {
      ...mapState([
        'count',
      ]),
    },
    methods: {
      ...mapMutations([
        'increment',
      ]),
    },
  };
</script>

<style scoped>

</style>
