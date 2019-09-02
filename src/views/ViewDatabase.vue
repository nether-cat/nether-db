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

<style lang="scss">
  .tooltip-table-cell .tooltip-inner {
    max-width: 200px;
    text-align: left;
    @media (min-width: 992px) {
      max-width: 20vw;
    }
    @media (min-width: 1200px) {
      max-width: 25vw;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~vuelayers/lib/style.css';

  @keyframes border-glow {
    0% {
      border-color: hsla(0, 0%, 85%, .5);
    }
    50% {
      border-color: hsla(0, 0%, 80%, .75);
    }
  }

  .container-fluid {
    /deep/ .vl-map {
      height: 485px !important;
      min-height: 485px !important;
      @media (min-width: 992px) {
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
    /deep/ .table-hover {
      tbody tr {
        &:hover {
          cursor: pointer;
          background-color: hsl(200, 60%, 95%);
        }

        &:focus {
          background-color: hsl(200, 60%, 95%);
          outline: 0;
        }
      }
    }
    /deep/ .table, /deep/ .table-hover {
      tbody tr.b-table-details > td {
        padding: 0;
      }
      tbody tr.b-table-details, tbody tr.b-table-has-details {
        background-color: hsl(240, 100%, 99%) !important;
      }
      tbody tr.b-table-bottom-row {
        cursor: inherit !important;
        background-color: inherit !important;
        color: inherit !important;
        > td {
          padding: .5rem;
        }
      }
    }
    /deep/ .table-hover.table-toggle {
      tbody tr:hover {
        cursor: zoom-in;
      }
      tbody tr.b-table-details, tbody tr.b-table-has-details {
        cursor: zoom-out;
      }
    }
    /deep/ .table-responsive tr:not(.b-table-details) {
      th, td {
        white-space: nowrap !important;
      }
      td:last-of-type .btn {
        min-width: 4rem;
      }
    }
    /deep/ .loading-bar {
      display: inline;
      position: relative;
      color: transparent;
      user-select: none;
      &::before {
        content: ' ';
        top: .25em;
        right: auto;
        left: 0;
        position: absolute;
        width: calc(100% + 25%);
        animation: border-glow 2s infinite;
        border-bottom: 0.75em solid hsla(0, 0%, 85%, .5);
        border-radius: .375em;
      }
      &.align-right::before {
        right: 0;
        left: auto;
      }
      &.connect {
        &.right::before {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        &.left::before {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        &.both::before {
          border-radius: 0;
        }
      }
    }
    /deep/ .loading-cover,
    /deep/ .b-table-empty-row {
      background-color: rgba(245, 245, 245, .7) !important;
      color: #6c757d !important;
      text-align: center !important;
      line-height: 4.5rem;
      font-size: 1.25rem;
    }
    /deep/ .loading-cover {
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
      }
    }
    /deep/ .card-body > .table {
      margin-bottom: .5rem;
    }
    /deep/ .table pre,
    /deep/ .grid-format-data pre {
      color: inherit;
      display: inline;
      font-size: 1em;
      margin: 0 0;
    }
    /deep/ .grid-format-data pre {
      line-height: 2.0;
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
