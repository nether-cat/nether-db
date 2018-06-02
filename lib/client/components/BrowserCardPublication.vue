<template>
    <b-card header-tag="header"
            footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="book"/> Publication
    </span>
      <b-container fluid class="card-text small">
        <b-col class="text-left">
          <h6 class="font-weight-normal">
          </h6>
          <!-- Publication meta output-->
          <hr/>
          <b-row>
            <b-col cols="4" lg="2" class="text-right">Authors:</b-col>
            <b-col class="text-left"> {{ publicationAuthors }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="4" lg="2" class="text-right">Year:</b-col>
            <b-col class="text-left"> {{ publicationYear }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="4" lg="2" class="text-right">Title:</b-col>
            <b-col class="text-left"> {{ 'publicationTitle' }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="4" lg="2" class="text-right">Source:</b-col>
            <b-col class="text-left"> {{ 'publicationSource' }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="4" lg="2" class="text-right">DOI:</b-col>
            <b-col class="text-left"> {{ 'publicationDoi' }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="4" lg="2" class="text-right">Weblink:</b-col>
            <b-col class="text-left"> {{ 'publicationWeblink' }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="4" lg="2" class="text-right">Contact mail:</b-col>
            <b-col class="text-left"> {{ 'publicationContact' }}</b-col>
          </b-row>
          <hr>
          <b-collapse id="showAbstract" class="mt-2">
          <b-row>
            <b-col class="text-left text-bold">Abstract:</b-col>
          </b-row>
            <b-row>
              <b-col>
                <p class="card-text">
                  {{ publicationAbstract }}
                </p>
              </b-col>
            </b-row>
          </b-collapse>
        </b-col>
      </b-container>
      <span slot="footer" class="float-right">
        <b-button v-b-toggle.showAbstract variant="primary" size="sm">Read abstract...</b-button>
      </span>
    </b-card>
</template>

<script>
  export default {
    name: 'BrowserCardPublication',

    data () {
      return {
        publicationAbstract: `
        This is an abstract.
        This is an abstract.
        This is an abstract.
        This is an abstract.This is an abstract.This is an abstract.
        This is an abstract.
        This is an abstract.This is an abstract.This is an abstract.This is an abstract.This is an abstract.
      `,
        publicationAuthors:`Adam Ries`,
        publicationYear:`2018`
      }
    }
  };
</script>

<style>

</style>