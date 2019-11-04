<template>
  <div ref="chart" class="c3 climate chart" :class="{ 'has-events': events.length }"/>
</template>

<script>
/*
 * --------------------------------------------------------------------------------
 * TODO: This is a rough implementation and it should be replaced with a better one
 * --------------------------------------------------------------------------------
 */
import * as d3 from 'd3';
import * as c3 from 'c3';

import ngripDataUrl from '@/assets/ngrip-d13o.csv';

const dataLabels = {
  data1: '𝛿18O (NGRIP)',
  data2: 'Tephra events (global)',
};

export default {
  name: 'ChartClimate',
  props: {
    events: {
      type: Array,
      default: () => [],
    },
    selection: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      chart: {},
    };
  },
  watch: {
    events (newVal, oldVal) {
      let options = !newVal || newVal && oldVal && oldVal.length
        ? { unload: [dataLabels.data2] } : {};
      let toggleEvents = () => {
        try {
          if (newVal && newVal.length) {
            this.chart.show(dataLabels.data2);
            this.chart.select([dataLabels.data2], [...newVal.entries()]
              .filter(([, e]) => this.selection.includes(e))
              .map(([i]) => i),
            );
          } else {
            this.chart.hide(dataLabels.data2);
          }
        } catch (e) {
          console.error('[APP] Error while updating chart values!');
        }
      };
      if ('function' === typeof this.chart.load) {
        this.chart.load({
          ...options,
          columns: [
            ['x2', ...(newVal && newVal.map(e => e.ageMean / 1000) || [])],
            [dataLabels.data2, ...(newVal && newVal.map(e => -52) || [])],
          ],
          done: toggleEvents,
        });
      } else {
        setTimeout(toggleEvents, 1000);
      }
    },
  },
  mounted () {
    Promise.all([
      d3.csv(String(ngripDataUrl)),
    ]).then(([chronology]) => {
      const dataRows = chronology
        // Reduce amount of data points for better SVG performance
        .filter((val, i) => i % 4 === 0)
        // Transform data into rows for C3.js
        .map((val, i) => {
          if (this.events[i]) {
            return [val['age'], val['d18o'], this.events[i].ageMean / 1000, -52];
          } else {
            return [val['age'], val['d18o']];
          }
        });
      // Generate chart
      this.chart = c3.generate({
        bindto: this.$refs.chart,
        data: {
          xs: {
            [dataLabels.data1]: 'x1', // NGRIP
            [dataLabels.data2]: 'x2', // Events
          },
          axes: {
            age: 'x',
            d18o: 'y',
          },
          hide: this.events.length ? [] : [dataLabels.data2],
          types: {
            // Render circles for x2 (events)
            [dataLabels.data2]: 'scatter',
          },
          // Prepend column labels and x-axes
          rows: [['x1', dataLabels.data1, 'x2', dataLabels.data2], ...dataRows],
          selection: {
            // Enable interactive multi-selections for event circles
            enabled: true,
            isselectable: (data) => data.id === dataLabels.data2 && this.events[data.index],
          },
          onselected: ({ index }, elem) => {
            // Emit the selected event and an arrow function that
            // allows the parent component to unselect that event
            let selectedEvent = this.events[index];
            this.$emit('selectEvent', selectedEvent, () => {
              let i = this.events.findIndex(e => selectedEvent === e);
              if (i > -1) {
                this.chart.unselect([dataLabels.data2], [i]);
              }
            });
          },
          onunselected: ({ index }, elem) => {
            // Emit the unselected event
            this.$emit('unselectEvent', this.events[index]);
          },
        },
        axis: {
          x: {
            label: 'kyr BP',
            min: -0.075,
            max: 122.875,
            tick: {
              outer: false,
              values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
            },
          },
          y: {
            label: '𝛿¹⁸O',
            max: -30,
            min: -54,
            tick: {
              format: (d) => d === -52 ? 'Events' : d,
              outer: false,
              values: [-52, -46, -44, -42, -40, -38, -36, -34, -32],
            },
          },
        },
        padding: { left: 30 },
        size: {
          height: 400,
        },
        // Callback to display tooltips with custom HTML
        tooltip: {
          // eslint-disable-next-line no-unused-vars
          contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
            const data = d[0];
            let step, event, ageString, content = '';
            switch (data.id) {
            // NGRIP
            case dataLabels.data1:
              step = chronology[data.index * 4];
              ageString = step.age < 10
                ? Math.round(step.age * 1000) + ' yr BP'
                : Number.parseFloat(step.age).toFixed(2) + ' kyr BP';
              content = `
                    <h6 class="card-title mb-3">NGRIP Data</h6>
                    <h6 class="card-subtitle text-muted mb-2">${step.d18o}&nbsp;𝛿<sup>18</sup>O</h6>
                    <p class="card-text"><small>(${ageString})</small></p>
                  `;
              break;
            // Events
            case dataLabels.data2:
              event = this.events[data.index];
              ageString = event.ageMean < 10000
                ? Math.round(event.ageMean) + ' yr BP'
                : (event.ageMean / 1000).toFixed(2) + ' kyr BP';
              content = `
                    <h6 class="card-title mb-3">Event Layer</h6>
                    <h6 class="card-subtitle text-muted mb-2">${event.name}</h6>
                    <p class="card-text"><small>(${ageString})</small></p>
                  `;
              break;
            default:
              return defaultValueFormat;
            }
            return `
                <div class="card tooltip-card">
                  <div class="card-body">
                    ${content}
                  </div>
                </div>
              `;
          },
        },
        // Hide line dots (they don't look good)
        point: {
          r: 16,
          show: false,
        },
        regions: [
          { axis: 'y', end: -48, class: 'events' },
        ],
        // Enable the sub-chart
        subchart: {
          show: true,
          onbrush: domain => { this.$emit('selectDomain', domain); /* console.log('onBrush:', domain); */ },
        },
        // Enable zoom feature
        zoom: {
          enabled: true,
          onzoom: domain => { this.$emit('selectDomain', domain); /* console.log('onZoom:', domain); */ },
        },
        oninit: () => {
          this.$nextTick(() => {
            let padding = 1.2295;
            let { min: { x: min }, max: { x: max } } = this.chart.axis.range();
            let defaultDomain = [min - padding, max + padding];
            this.chart.zoom(defaultDomain);
            this.$emit('loaded', (domain, fix = false) => {
              this.chart.flush();
              this.chart.zoom(domain || defaultDomain);
              fix && this.chart.flush();
            });
          });
        },
      });
    });
  },
};
</script>

<style lang="scss">
  @import '~c3/c3.min.css';

  .climate.chart {
    .c3-brush > .selection {
      fill: rgb(31, 119, 180);
      fill-opacity: 0.2;
      stroke: rgb(0, 0, 0);
      stroke-opacity: 0.125;
      stroke-width: 1px;
    }
    .c3-axis-y > .tick:first-of-type {
      display: none;
    }
    &.has-events .c3-axis-y > .tick:first-of-type {
      display: inline;
    }
    .c3-axis-y > .tick:first-of-type > text {
      transform: rotate(-90deg) translate(24px, -14px);
    }
    .c3-axis-y-label {
      font: 11px cursive;
      font-weight: bolder;
    }
    .c3-region.events {
      fill: gray;
    }
    &.has-events .c3-region.events {
      fill: none;
    }
    .c3-region.events {
      stroke: black;
      stroke-width: 1;
      stroke-dasharray: 8, 2;
      transform: scaleX(1.01);
    }
    .c3-tooltip-container > .tooltip-card {
      word-wrap: normal;
    }
    //noinspection CssUnknownProperty
    .c3-selected-circle {
      r: 29;
    }
  }
</style>
