<script>
export default {
  name: 'ViewFooter',
  props: {
    wrapAlways: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      icon: process.env.VUE_SSR
        ? <font-awesome-icon fixed-width icon="spinner" spin/>
        : <font-awesome-icon fixed-width icon={['fab', 'vuejs']}/>,
    };
  },
  computed: {
    classesDefaultBlock() {
      return { 'd-block': true, 'd-lg-inline': !this.wrapAlways };
    },
    classesDefaultNone() {
      return { 'd-none': true, 'd-lg-inline': !this.wrapAlways };
    },
  },
  render () {
    return (
      <div class="footer container-fluid text-muted">
        <span class={this.classesDefaultBlock}>© Helmholtz-Zentrum Potsdam</span>
        <span class={this.classesDefaultNone}>&nbsp;&middot;&nbsp;</span>
        <a class="font-weight-bold text-muted" href="#">Deutsches GeoForschungsZentrum GFZ</a>
        <span class={this.classesDefaultNone}>&nbsp;&middot;&nbsp;</span>
        <span class={this.classesDefaultBlock}>Provided by nether-db v1.0.0 {this.icon}</span>
      </div>
    );
  },
};
</script>

<style lang="scss" scoped>
  .footer {
    display: block;
    padding: .5rem 0 2rem 0;
    text-align: center;
    font-size: 0.8rem;
  }
</style>
