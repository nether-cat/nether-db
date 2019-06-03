<template>
  <KeepAlive>
    <RouterView :key="$route.path" class="content"/>
  </KeepAlive>
</template>

<script>
export default {
  name: 'ViewDatabase',
};
</script>

<style lang="scss" scoped>
  @import '~vuelayers/lib/style.css';

  .container-fluid {
    /deep/ .btn-overlay {
      z-index: 1024;
      position: fixed;
      bottom: 1.75rem;
      right: 1.75rem;
      > .btn {
        padding: 0;
        border-width: 0;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0);
        &:hover {
          background-color: rgba(0, 0, 0, .05);
        }
      }
    }
    /deep/ .table, /deep/ .table-hover {
      tbody tr.b-table-bottom-row {
        background-color: inherit !important;
        color: inherit !important;
      }
    }
    /deep/ .loading-cover {
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
    /deep/ .fade-opacity-enter-active,
    /deep/ .fade-opacity-leave-active {
      transition: opacity 1s ease;
    }
    /deep/ .fade-opacity-enter,
    /deep/ .fade-opacity-leave-to {
      opacity: 0;
    }
    /deep/ .fade-opacity-enter-to,
    /deep/ .fade-opacity-leave {
      opacity: 1;
    }
  }
</style>
