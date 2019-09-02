<template>
  <div id="app">
    <RouterView name="header"/>
    <RouterView name="navigation"/>
    <RouterView name="default"/>
    <RouterView name="footer"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SESSION from '@/graphql/queries/Session.graphql';

export default Vue.extend({
  name: 'App',
  apollo: {
    session: SESSION,
    isConnected: ESLint$0.gql`
      query isConnected {
        isConnected @client
      }
    `,
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.$apollo.queries.session.setOptions({
          fetchPolicy: 'cache-and-network',
        }).then(() => this.$apollo.queries.session.startPolling(60 * 1000));
        this.$apollo.mutate({ mutation: ESLint$0.gql`
          mutation toggleConnection {
            toggleConnection @client
          }
        ` }).catch(console.error);
      }, 100);
    });
  },
});
</script>

<style lang="scss">
  @import 'styles';

  #app {
    display: block;
    min-height: 100vh;
    > .content {
      &.container, &.container-fluid {
        padding: 1.5rem;
      }
      .card {
        > .card-header {
          h1, h2, h3, h4, h5, h6,
          .h1, .h2, .h3, .h4, .h5, .h6 {
            display: inline;
            margin-bottom: 0;
          }
        }
        > .card-body {
          > .container, > .container-fluid {
            padding: 0;
          }
        }
      }
    }
    a {
      &:focus:not(.disabled),
      &.focus:not(.disabled) {
        outline-width: 3px;
        outline-offset: .1em;
      }
      &.btn-link:focus:not(.disabled),
      &.btn-link.focus:not(.disabled) {
        outline-width: 3px;
        outline-style: auto;
        outline-offset: -3px;
      }
      &[role="button"]:focus,
      &[role="button"].focus {
        outline: 0;
      }
      &[role="button"]:not(.disabled) {
        cursor: pointer;
      }
      &.disabled:hover {
        cursor: default;
      }
      &.text-decoration-none:hover .text-decoration-hover {
        text-decoration: underline !important;
      }
    }
    .bg-theme-color {
      background-color: $theme-color;
    }
    .btn:disabled, .btn.disabled {
      &:focus, &.focus {
        &.disabled-focus-none {
          box-shadow: none !important;
          outline: 0 !important;
        }
      }
    }
    .btn > svg.fa-spin:not(:only-child) {
      margin-left: .75em;
    }
    .btn.w-100 > svg.fa-spin,
    .btn.btn-block > svg.fa-spin {
      &:not(:only-child) {
        position: absolute;
        margin-top: .25em;
      }
    }
    .comma-separated :not(:last-child)::after {
      content: ', ';
    }
    .input-group > .form-control {
      &.is-invalid, &.is-valid {
        z-index: 3;
      }
    }
    .form-container {
      .form-group {
        position: relative;
        margin-bottom: .2rem;
        &.is-filled {
          &.is-invalid label {
            color: $danger;
          }
          &.is-valid label {
            color: $success;
          }
        }
        &.is-filled,
        &.focus-explicit.focus-within,
        &:focus-within:not(.focus-explicit) {
          label {
            transform: scale(0.75) translateY(-150%);
            &.required::after {
              color: rgba($input-placeholder-color, 0);
            }
          }
        }
        &.focus-explicit.focus-within,
        &:focus-within:not(.focus-explicit) {
          label {
            color: $theme-color;
          }
        }
        &.is-invalid.focus-explicit.focus-within label,
        &.is-invalid:focus-within:not(.focus-explicit) label {
          color: $danger;
        }
        &.is-valid.focus-explicit.focus-within label,
        &.is-valid:focus-within:not(.focus-explicit) label {
          color: $success;
        }
        label {
          cursor: text;
          pointer-events: none;
          position: absolute;
          z-index: 5;
          top: 1.075rem;
          left: .25rem;
          width: unset;
          margin: 0 .3rem .5rem;
          padding: 0 .25rem;
          line-height: 1.25em;
          border-radius: 0.625rem;
          background: rgb(255,255,255);
          box-shadow: 0 0 .25em white, 0 0 .25em white,
          0 0 .25em white, 0 0 .25em white;
          color: $input-placeholder-color;
          transform-origin: bottom left;
          transform: scale(1) translateY(0);
          transition: transform 100ms linear, color 100ms linear;
          &.required::after {
            content: '*';
            color: $danger;
            transition: color 100ms linear;
            position: absolute;
            bottom: .1em;
            right: -.3em;
          }
          & + div {
            padding: .5rem 0 .3rem;
          }
        }
        .input-group .input-group-append,
        .input-group .input-group-prepend {
          .btn-context-toggle {
            color: #586169;
            background-color: #e9ecef;
            border: 1px solid #ced4da;
            &:hover {
              color: #494f54;
              background-color: #e1e4e7;
            }
            &.active, &.active:hover, &:active:hover {
              color: #3f454a !important;
              background-color: #dde0e3 !important;
            }
            &:focus {
              box-shadow: 0 0 0 0.2rem rgba(216, 217, 219, .5);
            }
          }
        }
        &.is-pending {
          .spinner-border {
            display: inline-block;
          }
        }
        .spinner-border {
          color: $input-color;
          position: absolute;
          display: none;
          top: 1.2em;
          right: .7em;
        }
        .is-invalid,
        .is-valid {
          padding-right: 2em;
        }
        .is-invalid ~ .invalid-feedback ~ .full-feedback {
          display: none;
        }
        .full-feedback {
          .invalid-feedback,
          .valid-feedback {
            display: initial;
            font-size: 1em;
          }
        }
        .full-feedback,
        .form-control ~ .invalid-feedback,
        .form-control ~ .valid-feedback {
          text-align: justify;
          font-size: .75em;
          margin-top: .25em;
          margin-right: 1em;
          position: relative;
          left: .5em;
          kbd {
            font-size: .9em;
            font-weight: 600;
            margin-right: .1rem;
            padding-top: .1rem;
            color: floralwhite;
          }
        }
      }
    }
    .long-dash {
      display: inline-block;
      border-top: 1px solid currentColor;
      height: .4em;
      width: 1.2em;
    }
  }
</style>
