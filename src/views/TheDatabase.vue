<template>
  <router-view/>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import gql from 'graphql-tag';

export default {
  name: 'TheDatabase',
  components: {
  },
  // eslint-disable-next-line no-unused-vars
  async asyncData ({ store, route, renderContext }) {
    if (!store.getters['user/isAuthenticated']) {
      await store.dispatch('user/doRefresh', renderContext);
    }
    await store.dispatch('database/loadProxies', renderContext);
    await store.dispatch('database/loadResultData', renderContext);
  },
  data () {
    return {};
  },
  apollo: {
    lakes: {
      query: gql`
        query lakes {
          lakes: Lake(orderBy: "name_asc") {
            uuid
            name
            longitude
            latitude
            countries {
              uuid
              code
              name
            }
            cores {
              uuid
              label
              collections {
                uuid
                label
                file
                proxy {
                  uuid
                  name
                }
              }
            }
          }
        }
      `,
    },
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
