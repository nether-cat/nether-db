<template>
  <b-card>
    <b-container fluid>
      <h6>Proxy records</h6>
      <hr>
      <p>Such- und Filteroptionen für Proxies</p>
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
  import bFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';

  export default {
    name: 'BrowserToolsProxy',
    components: {
      bFormCheckboxGroup,
      bFormGroup,
    },

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