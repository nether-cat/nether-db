<template>
  <div ref="chart" class="chart"></div>
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

  import climateCsvUrl from '../resources/klimadaten.csv';
  import eruptionCsvUrl from '../resources/vulkanausbrueche.csv';
  import lakesCsvUrl from '../resources/seen-mit-vulkanaschelagen.csv';

  export default {
    name: 'climate-chart',
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
          data1: '∂18O',
          data2: 'Tephra layers',
        };
        const dataRows = climateData
        // Daten ausdünnen (SVG hat Kackperformance mit vielen Elementen => wechselt am besten zu Chart.js bzw. ner canvas-basierten Library)
          .filter((val, i) => i % 8 === 0)
          // in C3.js-Form umwandeln
          .map((val, i) => {
            if (eruptions[i]) {
              return [val.age, val.d18o, eruptions[i].Date / 1000, -46];
            } else {
              return [val.age, val.d18o];
            }
          });
        // Chart generieren
        c3.generate({
          bindto: this.$refs.chart,
          data: {
            xs: {
              [dataLabel.data1]: 'x1', // Klima-Daten
              [dataLabel.data2]: 'x2', // Vulkanausbrueche
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
              label: 'age',
              tick: {
                // Werte auf der x-Achse
                values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
              },
            },
            y: {
              label: 'd18o',
            },
          },
          size: {
            height: 400,
          },
          // Tooltips ausgeben (ultra schlecht hingehackt - bitte nicht nachmachen! (lieber durch Vue rendern))
          tooltip: {
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
              //debugger;
              const data = d[0];
              let content = '';
              switch (data.id) {
                // Klimadaten
                case dataLabel.data1:
                  const climate = climateData[data.index * 8];
                  content = `
                    <p class="card-text">Alter: ${climate.age}</p>
                    <p class="card-text">d18o: ${climate.d18o}</p>
                  `;
                  break;
                // Vulkanausbrüche
                case dataLabel.data2:
                  const eruption = eruptions[data.index];
                  content = `
                    <h6 class="card-title">${eruption.Event}</h6>
                    <p class="card-text">Region: ${eruption.region}</p>
                    <p class="card-text">Date: ${eruption.Date}</p>
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
            r: 12,
            show: false,
          },
          // Subchart aktivieren
          subchart: {
            show: true,
          },
          // Zoom aktivieren
          zoom: {
            enabled: true,
          },
        });
      });
    },
  };
</script>

<style lang="scss" scoped>
  @import '~c3/c3.min.css';
</style>
