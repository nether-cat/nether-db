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
    /deep/ .vl-map {
      height: 485px !important;
      min-height: 485px !important;
      @media only screen and (min-width: 992px) {
        height: 100% !important;
      }
    }
    /deep/ .ol-viewport canvas {
      height: auto !important;
    }
    /deep/ .ol-control button {
      &:focus {
        outline-width: 0;
        background-color: rgba(0, 60, 136, 0.7);
        &:not(:hover) {
          outline-width: 3px;
        }
      }
      &:hover {
        background-color: rgba(0, 60, 136, 0.7);
      }
    }
    /deep/ .ol-scale-line-inner {
      border-top: 1px solid #eee;
      padding-top: 1px;
    }
    /deep/ .table, /deep/ .table-hover {
      tbody tr.b-table-bottom-row {
        background-color: inherit !important;
        color: inherit !important;
        > td {
          padding: .5rem;
        }
      }
    }
    /deep/ .loading-cover {
      background-color: rgba(245, 245, 245, .7);
      color: #6c757d;
      text-align: center;
      justify-content: center;
      align-items: center;
      display: flex;
      padding: 3rem;
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 99;
      > div, span {
        display: inline-block;
        line-height: 4.5rem;
        font-size: 1.25rem;
      }
    }
    /deep/ .card-body > .table {
      margin-bottom: .5rem;
    }
    /deep/ .table pre,
    /deep/ .grid-format-data pre {
      color: inherit;
      display: inline-block;
      font-size: 1em;
      margin: 0 0;
    }
    /deep/ .grid-format-data .row {
      > div:not(:nth-of-type(3)) {
        text-align: right !important;
      }
      > div:nth-of-type(2) {
        padding-right: 0 !important;
      }
      > div:nth-of-type(3) {
        text-align: left !important;
        padding-left: 0 !important;
      }
    }
    /deep/ .table-actions {
      padding-right: inherit;
      padding-top: inherit;
      position: absolute;
      right: 0;
      top: 0;
    }

    /deep/ ::-webkit-scrollbar {
      -webkit-appearance: none;
    }
    /deep/ ::-webkit-scrollbar:vertical {
      width: 16px;
    }
    /deep/ ::-webkit-scrollbar:horizontal {
      height: 16px;
    }
    /deep/ ::-webkit-scrollbar-thumb {
      background-clip: content-box;
      background-color: rgba(0, 0, 0, 0.4);
      border: 3px solid transparent;
      border-radius: 8px;
      /*box-shadow: inset 0 16px 0 0 rgba(0, 0, 0, 0.1);*/
      &:horizontal {
        border-top-width: 4px;
      }
      &:vertical {
        border-left-width: 4px;
      }
    }
    /deep/ ::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, 1);
      border: inherit;
      border-radius: inherit;
      & {
        border-width: 0;
      }
      &:horizontal {
        border-top-width: 1px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
      &:vertical {
        border-left-width: 1px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    /deep/ ::-webkit-scrollbar-track-piece {
      /*margin: calc(1.25rem - 3px);*/
      &:vertical {
        /*margin-bottom: calc(1.25rem - 3px + .5rem);*/
      }
    }
    /deep/ ::-webkit-scrollbar-track-piece:start {
      border-right-width: 0;
    }
    /deep/ ::-webkit-scrollbar-track-piece:end {
      border-left-width: 0;
    }
  }
</style>
