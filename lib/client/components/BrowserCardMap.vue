<template>
  <b-card header-tag="header"
          footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="map"/> Map
    </span>
    <b-container fluid class="card-text small">
        <h6 class="font-weight-normal">The map should be displayed here</h6>
    </b-container>
    <span slot="footer" class="float-right">
        <b-button variant="primary" size="sm" v-b-toggle.collapse2>Zoom in</b-button>
      </span>
  </b-card>
</template>

<script>
  export default {
    name: 'BrowserCardMap',
  };
</script>

<style scoped>

</style>
