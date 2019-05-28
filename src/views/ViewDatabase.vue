<template>
  <KeepAlive>
    <RouterView :key="$route.fullPath" class="content"/>
  </KeepAlive>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'ViewDatabase',
  components: {
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

  /deep/.loading-cover {
    background-color: rgba(245, 245, 245, .7);
    color: #6c757d;
    text-align: center;
    vertical-align: middle;
    padding: 3rem;
    position: absolute;
    left: 1rem;
    right: 1rem;
    z-index: 99;
    > div {
      display: inline-block;
      line-height: 4.5rem;
      font-size: 1.25rem;
    }
  }
  /deep/.fade-cover-enter-active, /deep/.fade-cover-leave-active {
    transition: opacity 1s ease-in;
  }
  /deep/.fade-cover-enter, /deep/.fade-cover-leave-to {
    opacity: 0;
  }
</style>
