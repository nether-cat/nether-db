<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        <browser-meta-card/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import BrowserMetaCard from './BrowserMetaCard';

  export default {
    name: 'TheBrowser',
    components: {
      BrowserMetaCard,
    },
  };
</script>

<style scoped>

</style>
