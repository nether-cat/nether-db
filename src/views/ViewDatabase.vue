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
  }
</style>
