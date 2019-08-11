<script>
import { pascalCase } from 'change-case';
import { Map, View } from 'vuelayers/lib/map';
import { Overlay } from 'vuelayers/lib/overlay';
import { Layer as TileLayer } from 'vuelayers/lib/tile-layer';
import { Layer as VectorLayer } from 'vuelayers/lib/vector-layer';
import { Source as OsmSource } from 'vuelayers/lib/osm-source';
import { Source as VectorSource } from 'vuelayers/lib/vector-source';
import { Source as ClusterSource } from 'vuelayers/lib/cluster-source';
import { Feature } from 'vuelayers/lib/feature';
import { Geom as PointGeom } from 'vuelayers/lib/point-geom';
import { Interaction as SelectInteraction } from 'vuelayers/lib/select-interaction';
import { Style as StyleFunc } from 'vuelayers/lib/style-func';
import { Style as StyleBox } from 'vuelayers/lib/style-box';
import { Style as StrokeStyle } from 'vuelayers/lib/stroke-style';
import { Style as FillStyle } from 'vuelayers/lib/fill-style';
import { Style as CircleStyle } from 'vuelayers/lib/circle-style';
import { createStyle } from 'vuelayers/lib/ol-ext';

const components = {
  [pascalCase(Map.name)]: Map,
  [pascalCase(View.name)]: View,
  [pascalCase(Overlay.name)]: Overlay,
  [pascalCase(TileLayer.name)]: TileLayer,
  [pascalCase(VectorLayer.name)]: VectorLayer,
  [pascalCase(OsmSource.name)]: OsmSource,
  [pascalCase(VectorSource.name)]: VectorSource,
  [pascalCase(ClusterSource.name)]: ClusterSource,
  [pascalCase(Feature.name)]: Feature,
  [pascalCase(PointGeom.name)]: PointGeom,
  [pascalCase(SelectInteraction.name)]: SelectInteraction,
  [pascalCase(StyleFunc.name)]: StyleFunc,
  [pascalCase(StyleBox.name)]: StyleBox,
  [pascalCase(StrokeStyle.name)]: StrokeStyle,
  [pascalCase(FillStyle.name)]: FillStyle,
  [pascalCase(CircleStyle.name)]: CircleStyle,
};

const props = {
  /**
   * @type {number[]}
   * @default [0, 10]
   */
  center: {
    type: Array,
    default: () => [0, 8],
    validator: value => (
      value.length === 2
      && value.every(n => typeof n === 'number')
    ),
  },
  /**
   * @type {object[]}
   * @default []
   */
  features: {
    type: Array,
    default: () => [],
  },
  /**
   * @type {number}
   * @default 0
   */
  rotation: {
    type: Number,
    default: 0,
  },
  /**
   * @type {number}
   * @default 1
   */
  zoom: {
    type: Number,
    default: 1,
  },
};

function data () {
  return {
    availableFeatures: [],
    focusedClusters: [],
    focusedFeatures: [],
  };
};

const watch = {
  features () {
    this.availableFeatures = [];
    this.focusedClusters = [];
    this.focusedFeatures = [];
  },
};

const methods = {
  filterByCluster (feature, layer) {
    try {
      return layer.get('id') === 'cluster-layer';
    } catch (err) {
      return false;
    }
  },
  filterByFeatures (feature, layer) {
    try {
      return layer.get('id') === 'features-layer';
    } catch (err) {
      return false;
    }
  },
  clusterStyleFunc () {
    const clusterCache = {};
    const featureCache = {};
    const makeFeatureStyle = this.featureStyleFunc();
    return function __clusterStyleFunc (cluster) {
      let cache, features = cluster.get('features'), size, style;
      if (features.length === 1) {
        cache = featureCache;
        size = features[0].getProperties().datasetsCount || 0;
      } else {
        cache = clusterCache;
        size = features.length || 0;
      }
      style = cache[size];
      if (!style) {
        style = cache === clusterCache ? [createStyle({
          imageRadius: 5 + Math.sqrt(Math.PI * 0.75 * (size - 1)),
          strokeColor: '#ffffff',
          fillColor: 'rgba(0, 153, 255, 0.5)',
          text: size.toString(),
          textFillColor: '#ffffbb',
          textStrokeColor: '#aaaa66',
          textStrokeWidth: 0,
          zIndex: -size,
        })] : makeFeatureStyle(features[0]);
        cache[size] = style;
      }
      return style;
    };
  },
  featureStyleFunc (hasSiblings = false) {
    return function __featureStyleFunc (feature) {
      let props = feature ? feature.getProperties() : {};
      let zOffset = (props.datasetsCount || 0) * 1000 + (props.index || 0);
      return [createStyle(Object.assign({
        imageRadius: 5,
        strokeColor: '#ffffff',
        fillColor: props.datasetsCount
          ? '#0099ff'
          : '#94adcc',
        zIndex: hasSiblings ? 0 + zOffset : 50000 + zOffset,
      }, hasSiblings && feature ? { geom: feature.getGeometry() } : {}))];
    };
  },
  focusClusterStyleFunc () {
    const hiddenCluster = createStyle({
      imageRadius: 0,
      strokeColor: 'rgba(0, 0, 0, 0)',
      fillColor: 'rgba(0, 0, 0, 0)',
      zIndex: -99999,
    });
    const makeFeatureStyle = this.featureStyleFunc(true);
    return function __focusClusterStyleFunc (cluster) {
      let styles = [hiddenCluster];
      for (let feature of cluster.get('features')) {
        styles.push(...makeFeatureStyle(feature));
      }
      return styles;
    };
  },
  focusFeatureStyleFunc () {
    return function __focusFeatureStyleFunc (feature) {
      return [createStyle(Object.assign({
        imageRadius: 5,
        strokeColor: '#ffffff',
        fillColor: '#00eb89',
        zIndex: 99999,
      }, feature ? { geom: feature.getGeometry() } : {}))];
    };
  },
  onFocusClusters (evt) {
    this.focusedClusters = evt.filter(a => !this.focusedClusters.find(b => a.id === b.id));
    this.availableFeatures = this.focusedClusters.map(f => f && f.properties && f.properties.features).flat().filter(f => !!f);
  },
  experimentalHandler (e) {
    console.log(Date.now(), e);
  },
  trySelectFeature () {
    if (this.hasSelection === true) return;
    // TODO: This gets executed far too often; Find a better trigger
    let selectedFeatures = this.$store.state.database.map.features;
    if (Array.isArray(selectedFeatures) && selectedFeatures.length) {
      if (Array.isArray(this.$refs.features)) {
        let feature = this.$refs.features.find(f => f.id === selectedFeatures[0].id);
        if (feature) {
          try {
            this.$refs.interaction.select(feature);
            this.hasSelection = true;
          } catch (e) {
            // do nothing
          }
        }
      }
    }
  },
  fixZoomButtons () {
    if (this.$el.querySelectorAll('.ol-zoom button').length < 2) {
      setTimeout(this.fixZoomButtons, 250);
    } else {
      this.$el.querySelectorAll('.ol-zoom button').forEach(btn => {
        let lastFocus = Date.now();
        btn.addEventListener('focus', () => lastFocus = Date.now());
        btn.addEventListener('click', ({ target }) => (Date.now() - lastFocus) < 60 && target.blur());
        btn.addEventListener('mouseout', ({ target }) => target.blur());
      });
    }
  },
};

const vOn = (events) => ({ on: events });

export default {
  name: 'MapOverview',
  components,
  props,
  data,
  computed: {
    clusteredFeatures () {
      return this.features.filter(a => (
        !this.availableFeatures.find(b => a.id === b.id)
        && !this.focusedFeatures.find(b => a.id === b.id)
      ));
    },
  },
  watch,
  mounted () {
    this.fixZoomButtons();
  },
  activated () {
    this.$refs.mapComponent && this.$refs.mapComponent.$map && this.$refs.mapComponent.$map.updateSize();
  },
  methods,
  render () {
    return (
      <VlMap load-tiles-while-animating={true}
             load-tiles-while-interacting={true}
             data-projection="EPSG:4326"
             ref="mapComponent"
      >
        <VlView
          min-zoom={1}
          max-zoom={18}
          zoom={this.zoom}
          center={this.center}
          rotation={this.rotation}
          constrainRotation={false}
          {...vOn({
          })}
        />
        <VlLayerTile id="osm">
          <VlSourceOsm/>
        </VlLayerTile>
        <VlLayerVector id="cluster-layer">
          <VlSourceCluster distance={25}>
            <VlSourceVector ident="cluster-source" features={this.clusteredFeatures} onMounted={() => this.$emit('loaded', this)}/>
            <VlStyleFunc factory={this.clusterStyleFunc}/>
          </VlSourceCluster>
        </VlLayerVector>
        <VlLayerVector id="features-layer">
          <VlSourceVector ident="features-source" features={this.availableFeatures}/>
          <VlStyleFunc factory={this.featureStyleFunc}/>
        </VlLayerVector>
        <VlInteractionSelect
          features={this.focusedClusters}
          filter={this.filterByCluster}
          condition={(evt) => evt.type === 'pointermove'}
          addCondition={(evt) => evt.type === 'pointermove'}
          removeCondition={() => false}
          {...vOn({
            'update:features': this.onFocusClusters,
          })}
        >
          {() => <VlStyleFunc factory={this.focusClusterStyleFunc}/>}
        </VlInteractionSelect>
        <VlInteractionSelect
          ref="interaction"
          features={this.focusedFeatures}
          filter={this.filterByFeatures}
          {...vOn({
            'update:features': (evt) => this.focusedFeatures = evt,
          })}
        >
          {(props) => [
            <VlStyleFunc factory={this.focusFeatureStyleFunc}/>,
          ].concat(props.features.map(feature => (
            <VlOverlay id={feature.id}
                        key={feature.id}
                        auto-pan={true}
                        position={[-90, -180]}
                        class="feature-popup feature-popup-lake"
            >
              <BCard>
                <div slot="header">
                  <span style="float: left; font-size: 1rem; padding: 0 1rem 0 0; max-width: 200px;">
                    {feature.properties.name}
                  </span>
                  <button type="button"
                          class="close"
                          aria-label="Close"
                          style="font-size: 1.25rem"
                          onClick={() => this.focusedFeatures = this.focusedFeatures.filter(f => f.id !== feature.id)}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                {(feature.properties.datasetsCount || 'No') + ' dataset' + (feature.properties.datasetsCount !== 1 ? 's' : '')} available<br/>
                <RouterLink
                  to={{ name: 'databaseDetails', params: { lakeId: feature.properties.uuid } }}
                  domPropsInnerHTML={feature.properties.datasetsCount ? '&#8627; View details' : '&#8627; Show lake info'}
                />
              </BCard>
            </VlOverlay>
          )))}
        </VlInteractionSelect>
      </VlMap>
    );
  },
};
</script>

<style lang="scss" scoped>
  .feature-popup {
    bottom: 1.1em;
    @media only screen and (min-width: 576px) {
      bottom: 0;
    }
    .card {
      bottom: calc(.5em + 3px);
      left: calc(.5em + 3px);
      max-width: 66.66vw;
      width: 256px;
    }
  }
</style>
