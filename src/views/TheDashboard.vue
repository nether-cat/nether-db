<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        <h2>Welcome to the Paleolimnological Database!</h2><hr>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'TheDashboard',
  // eslint-disable-next-line no-unused-vars
  async asyncData ({ store, route, renderContext }) {
    if (!store.getters['user/isAuthenticated']) {
      await store.dispatch('user/doRefresh', renderContext);
    }
  },
  computed: {
    ...mapState('user', [
      'user',
    ]),
  },
};
</script>

<style scoped>

</style>
