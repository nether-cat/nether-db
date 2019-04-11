<template>
  <router-view/>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import gql from 'graphql-tag';

export default {
  name: 'the-database',
  components: {
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

<style lang="scss">
  .loading-cover {
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
  .fade-cover-enter-active, .fade-cover-leave-active {
    transition: opacity .75s;
  }
  .fade-cover-enter, .fade-cover-leave-to {
    opacity: 0;
  }
</style>

<style lang="scss" scoped>
  @import '~vuelayers/lib/style.css';
</style>
