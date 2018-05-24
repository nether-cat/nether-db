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
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bContainer from 'bootstrap-vue/es/components/layout/container';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bButton from 'bootstrap-vue/es/components/button/button';

  export default {
    name: 'TheDashboard',
    components: {
      bCol,
      bContainer,
      bRow,
      bButton,
    },
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
