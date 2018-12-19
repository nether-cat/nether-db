<template>
  <b-card>
    <b-container fluid>
      <h6>Proxy records</h6>
      <hr>
      <p>Search and filter results by proxy</p>
      <hr>
      <b-form-group label="proxySelection">
        <b-form-checkbox-group buttons stacked id="proxyCheckboxes" v-model="proxySelect" :options="options">
        </b-form-checkbox-group>
      </b-form-group>
      <hr>
      <div>Selected proxies: <p>{{ proxySelect }}</p>
      </div>
    </b-container>
  </b-card>
</template>

<script>
  export default {
    name: 'BrowserToolsProxy',
    data () {
      return {
        proxySelect: [],
        options: [
          {text: 'Alkanes', value: 'alkanes'},
          {text: 'Diatoms', value: 'diatoms'},
          {text: 'Varves', value: 'varves'},
        ]
      }
    }
  };
</script>

<style scoped>

</style>
