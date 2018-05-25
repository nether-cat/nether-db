<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        <b-row>
          <b-col>
            <browser-card-meta/>
          </b-col>
          <b-col class="col-sm-4">
          </b-col>
        </b-row>
        <b-collapse id="collapse1">
          <browser-card-publication class="mt-3"/>
          <browser-card-collection class="mt-3"/>
        </b-collapse>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import BrowserCardMeta from './BrowserCardMeta';
  import BrowserCardPublication from './BrowserCardPublication';
  import BrowserCardCollection from './BrowserCardCollection';

  export default {
    name: 'TheBrowser',
    components: {
      BrowserCardMeta,
      BrowserCardPublication,
      BrowserCardCollection,
    },
  };
</script>

<style scoped>

</style>
