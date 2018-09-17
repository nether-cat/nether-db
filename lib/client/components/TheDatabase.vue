<template>
  <router-view/>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';

  export default {
    name: 'TheDatabase',
    components: {
    },
    async prefetchData ({ store, route, renderContext }) {
      if (!store.getters['user/isAuthenticated']) {
        await store.dispatch('user/doRefresh', renderContext);
      }
      await store.dispatch('database/loadProxies', renderContext);
      await store.dispatch('database/loadResultData', renderContext);
    },
    data () {
      return {};
    },
    computed: {
      ...mapState('user', [
        'user',
      ]),
      ...mapState('database', [
        'proxies',
        'results',
      ]),
      ...mapGetters('database', [
        'countProxies',
        'transformedResults',
      ]),
    },
    methods: {
      ...mapActions('database', [
        'loadProxies',
        'loadProxyAttributes',
        'loadResultData',
      ]),
    },
  };
</script>

<style lang="scss" scoped>
  @import '~vuelayers/lib/style.css';
</style>
