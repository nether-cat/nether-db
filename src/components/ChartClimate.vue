<template>
  <div ref="chart" class="climate chart"/>
</template>

<script>
  /**
   * ACHTUNG:
   * Dirty Code!
   * Nur für die Präsentation!
   *
   * Die CSV-Daten sollten besser als JSON über die API (REST o.ä.) ausgeliefert werden.
   * Auch das Filtern der Seen sollte via API laufen und nicht im Client (Siehe Zeile 84).
   */
import * as d3 from 'd3';
import * as c3 from 'c3';

import climateCsvUrl from '@/assets/klimadaten.csv';
import eruptionCsvUrl from '@/assets/vulkanausbrueche.csv';
import lakesCsvUrl from '@/assets/seen-mit-vulkanaschelagen.csv';

export default {
  name: 'ChartClimate',
  /**
   * Properties
   */
  props: {
    climateCsvUrl: {
      type: String,
      default: climateCsvUrl,
    },
    eruptionCsvUrl: {
      type: String,
      default: eruptionCsvUrl,
    },
    lakesCsvUrl: {
      type: String,
      default: lakesCsvUrl,
    },
  },
  data () {
    return {
      chart: {},
    };
  },
  /**
   * Mounted Hook
   */
  mounted () {
    Promise.all([
      d3.csv(String(this.climateCsvUrl)),
      d3.csv(String(this.eruptionCsvUrl)),
      d3.csv(String(this.lakesCsvUrl)),
    ]).then(([climateData, eruptions, lakes]) => {
      // Daten-Bezeichnungen
      const dataLabel = {
        data1: '𝛿18O (NGRIP)',
        data2: 'Tephra events (global)',
      };
      const dataRows = climateData
        // Daten ausdünnen (SVG hat Kackperformance mit vielen Elementen => wechselt am besten zu Chart.js bzw. ner canvas-basierten Library)
        .filter((val, i) => i % 4 === 0)
        // in C3.js-Form umwandeln
        .map((val, i) => {
          if (eruptions[i]) {
            return [val['age'], val['d18o'], eruptions[i].Date / 1000, -52];
          } else {
            return [val['age'], val['d18o']];
          }
        });
      // Chart generieren
      this.chart = c3.generate({
        bindto: this.$refs.chart,
        data: {
          xs: {
            [dataLabel.data1]: 'x1', // Klima-Daten
            [dataLabel.data2]: 'x2', // Vulkanausbrueche
          },
          axes: {
            age: 'x',
            d18o: 'y',
          },
          types: {
            [dataLabel.data2]: 'scatter', // Bubbles für 'data2' (Vulkanausbrueche)
          },
          rows: [['x1', dataLabel.data1, 'x2', dataLabel.data2], ...dataRows], // Spalten-Bezeichnung + x-Achsen vorne anhängen
          // Filtert die Seen nach dem "Klima-Event" und wirft dann das "filterLakes"-Event (siehe: DatabaseViewIndex.vue)
          onclick: (data) => {
            if (data.id === dataLabel.data2 && eruptions[data.index]) {
              const event = eruptions[data.index].Event;
              const filteredLakes = lakes.filter(lake => lake.Event === event);
              this.$emit('filterLakes', filteredLakes, event);
            }
          },
        },
        axis: {
          x: {
            label: 'ka BP',
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
        // Tooltips ausgeben (ultra schlecht hingehackt - bitte nicht nachmachen! Besser durch Vue.js rendern)
        tooltip: {
          // eslint-disable-next-line no-unused-vars
          contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
            const data = d[0];
            let climate, eruption, content = '';
            switch (data.id) {
            // Klimadaten
            case dataLabel.data1:
              climate = climateData[data.index * 4];
              content = `
                    <p class="card-text">Date:&nbsp;${climate.age}&nbsp;ka&nbsp;BP</p>
                    <p class="card-text">Value:&nbsp;${climate.d18o}&nbsp;𝛿<sup>18</sup>O</p>
                  `;
              break;
            // Vulkanausbrüche
            case dataLabel.data2:
              eruption = eruptions[data.index];
              content = `
                    <h6 class="card-title">${eruption.Event}</h6>
                    <p class="card-text">Region: ${eruption.region}</p>
                    <p class="card-text">Date: ${eruption.Date} a BP</p>
                    <p class="card-text">Uncertainty: ${eruption.Uncertainty}</p>
                    <p class="card-text">Reference: ${eruption.Reference}</p>
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
        // Line-Punkte ausblenden (sieht kacke aus)
        point: {
          r: 16,
          show: false,
        },
        regions: [
          { axis: 'y', end: -48, class: 'events' },
        ],
        // Subchart aktivieren
        subchart: {
          show: true,
          onbrush: domain => console.log('onBrush:', domain),
        },
        // Zoom aktivieren
        zoom: {
          enabled: true,
          onzoom: domain => console.log('onZoom:', domain),
        },
        oninit: () => {
          this.$emit('init');
          this.$nextTick(() => {
            let padding = 1.2295;
            let { min: { x: min }, max: { x: max } } = this.chart.axis.range();
            this.chart.zoom([min - padding, max + padding]);
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
    .c3-axis-y > .tick:first-of-type > text {
      transform: rotate(-90deg) translate(24px, -14px);
    }
    .c3-axis-y-label {
      font: 11px cursive;
      font-weight: bolder;
    }
    .c3-region.events {
      fill: none;
      stroke: black;
      stroke-width: 1;
      stroke-dasharray: 8, 2;
      transform: scaleX(1.01);
    }
    .c3-tooltip-container > .tooltip-card {
      word-wrap: normal;
    }
  }
</style>
