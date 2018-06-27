<template>
  <b-container fluid>

    <b-row class="mt-3">

      <b-col>
        <browser-tools-location/>
      </b-col>

      <b-col>
        <browser-tools-proxy/>
      </b-col>

      <b-col>
        <browser-tools-age/>
      </b-col>
      <!--
           <b-col>
             <b-card>
               <b-container fluid>
                 <h6>Publications</h6>
                 <hr>
                 <p>Such- und Filteroptionen für Publikationen</p>
               </b-container>
             </b-card>
           </b-col>
      -->

    </b-row>

  </b-container>

</template>

<script>
  import BrowserToolsAge from './BrowserToolsAge';
  import BrowserToolsLocation from './BrowserToolsLocation';
  import BrowserToolsProxy from './BrowserToolsProxy';

  export default {
    name: 'BrowserTools',
    components: {
      BrowserToolsAge,
      BrowserToolsLocation,
      BrowserToolsProxy,
    },
  };
</script>

<style>

</style>