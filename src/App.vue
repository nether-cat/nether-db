<template>
  <div id="app">
    <div class="header container-fluid px-0">
      <b-row class="mx-0">
        <b-col cols="12" sm="6" class="px-0">
          <router-link to="/" exact>
            <img src="./assets/palim-logo.png" alt="PaLimDB">
          </router-link>
        </b-col>
        <b-col cols="12" sm="6" class="px-0">
          <b-nav class="float-right px-3">
            <b-nav-item to="/contact" disabled>Contact</b-nav-item>
            <b-nav-item to="/imprint" disabled>Imprint</b-nav-item>
            <b-nav-item to="/privacy" disabled>Privacy</b-nav-item>
          </b-nav>
        </b-col>
      </b-row>
    </div>
    <the-navbar/>
    <div class="main">
      <router-view/>
    </div>
  </div>
</template>

<script>
import TheNavbar from '@/views/TheNavbar';
import SESSION from '@/graphql/Session.graphql';

export default {
  name: 'app',
  components: {
    TheNavbar,
  },
  apollo: {
    session: SESSION,
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.$apollo.queries.session.setOptions({
          fetchPolicy: 'cache-and-network',
        }).then(() => this.$apollo.queries.session.startPolling(60 * 1000));
      }, 100);
    });
  },
};
</script>

<style lang="scss">
  @import '~bootstrap/scss/bootstrap';
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  //noinspection CssUnknownTarget
  @import '~@fortawesome/fontawesome-svg-core/styles.css';
  //noinspection CssUnknownTarget
  @import '~@johmun/vue-tags-input/vue-tags-input/vue-tags-input';

  $primary: #00589c;

  html, body {
    margin: 0;
    padding: 0;
    background-color: whitesmoke;
  }

  #app {
    display: block;
    min-height: 100vh;
    > .header {
      display: block;
      background-color: white;
      img {
        max-height: 100px;
        padding: 5px 10px;
      }
      .nav {
        .nav-item::before {
          content: '|';
        }
        .nav-item:first-child::before {
          content: '';
        }
        .nav-link {
          display: inline-block;
          padding: 0.5rem 0.5rem;
        }
      }
    }
    > .main {
      display: block;
      > .container, > .container-fluid {
        padding: 1.5em;
      }
      .card {
        .card-body {
          .container, .container-fluid {
            padding: 0;
          }
        }
      }
    }
    a.disabled:hover {
      cursor: default;
    }
    .bg-blue {
      background-color: $primary;
    }
    button.btn > svg.fa-spin {
      margin-left: .75em;
    }
    button.btn.w-100 > svg.fa-spin,
    button.btn.btn-block > svg.fa-spin {
      position: absolute;
      margin-top: .25em;
    }
    .comma-separated :not(:last-child)::after {
      content: ', ';
    }
    .vue-tags-input {
      max-width: unset;
      .input {
        @extend .form-control;
      }
      .input:focus-within {
        @extend .input:focus;
      }
      .new-tag-input-wrapper {
        margin: 0;
        padding: 0;
        @at-root {
          #app .vue-tags-input.allow {
            &--enter, &--delete {
              .new-tag-input-wrapper:focus-within::after {
                display: none;
                color: $input-placeholder-color;
                background-color: $white;
                margin: 1px 0 0 .5em;
                padding: 0 .4em 0 .3em;
                border: 1px solid $input-border-color;
                border-radius: $input-border-radius;
              }
            }
            &--enter {
              .new-tag-input-wrapper:focus-within::after {
                display: inline-block;
                content: '\23ce';
              }
            }
            &--delete {
              .deletion-mark ~ .new-tag-input-wrapper:focus-within {
                input {
                  min-width: 1em;
                  max-width: 1em;
                  &::placeholder {
                    color: rgba(0, 0, 0, 0);
                  }
                }
                &::after {
                  display: block;
                  content: '\232b';
                  position: absolute;
                  right: 1em;
                }
              }
            }
          }
        }
      }
      .tag {
        margin: 2px .5em 1px 0;
        padding: 0 .3em 0 .5em;
        transition: background-color .25s;
        background-color: $primary;
        &.deletion-mark {
          background-color: $error !important;
        }
        &.group {
          background-color: $primary;
          border-radius: 2px 0 0 2px;
          padding-right: .5em;
          &.current {
            border-radius: 2px;
            padding-right: .3em;
            .content::after {
              content: '\2026';
              margin-bottom: .5em;
              line-height: 50%;
              padding: 0 .1em 0 .5em;
            }
            .actions {
              display: flex;
            }
          }
          .actions {
            display: none;
          }
          &.duplicate {
            background-color: $primary;
          }
        }
        &.option {
          background-color: cornflowerblue;
          border-radius: 0 2px 2px 0;
          margin-left: -.5em;
        }
      }
      .selected-item {
        background-color: $primary;
        .group {
          background-color: $primary;
        }
        .option {
          background-color: cornflowerblue;
        }
      }
      input {
        font-size: 1rem;
        line-height: 1.5;
        color: $input-color;
        &::placeholder {
          @extend .form-control::placeholder;
        }
      }
    }
  }
</style>