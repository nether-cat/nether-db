<template>
    <b-card header-tag="header"
            footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="info-circle"/> Publication information
    </span>
      <b-container fluid class="card-text small">
        <b-col class="text-left">
          <h6 class="font-weight-normal">
          </h6>
          <!-- Publication meta output-->
          <hr/>
          <b-row>
            <b-col class="text-right">Authors:</b-col>
            <b-col class="text-left"> {{ 'publicationAuthors' }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Year:</b-col>
            <b-col class="text-left"> {{ 'publicationYear' }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Title:</b-col>
            <b-col class="text-left"> {{ 'publicationTitle' }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col class="text-right">Source:</b-col>
            <b-col class="text-left"> {{ 'publicationSource' }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">DOI:</b-col>
            <b-col class="text-left"> {{ 'publicationDoi' }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Weblink:</b-col>
            <b-col class="text-left"> {{ 'publicationWeblink' }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col class="text-right">Contact mail:</b-col>
            <b-col class="text-left"> {{ 'publicationContact' }}</b-col>
          </b-row>
        </b-col>
      </b-container>
      <span slot="footer" class="float-right">
        <b-button variant="primary" size="sm" v-b-toggle.collapse2>More details</b-button>
      </span>
    </b-card>
</template>

<script>
  export default {
    name: 'BrowserCardPublication',
  };
</script>

<style scoped>

</style>