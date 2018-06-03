<template>
  <!-- ++++ Version 2 - Kacheln +++ Version 1 siehe unten +++ -->
    <b-container fluid>
      <b-row>
        <b-col>
          <b-card>
            <b-container fluid>
              <h6>Lakes</h6>
              <hr>
              <p>Such- und Filteroptionen für Seen</p>
            </b-container>
          </b-card>
        </b-col>

        <b-col>
          <b-card>
            <b-container fluid>
              <h6>Proxy records</h6>
              <hr>
              <p>Such- und Filteroptionen für Proxies</p>
              <hr>
              <b-form-group label="proxySelection">
                <b-form-checkbox-group id="proxyCheckboxes" v-model="selected" :options="options">
                </b-form-checkbox-group>
              </b-form-group>
              <hr>
              <div>Selected proxies: <p>{{ selected }}</p></div>
            </b-container>
          </b-card>
        </b-col>

        <b-col>
          <b-card>
            <b-container fluid>
              <h6> Tephra layers</h6>
              <hr>
              <p>Such- und Filteroptionen für Tephren</p>
            </b-container>
          </b-card>
        </b-col>

        <b-col>
          <b-card>
            <b-container fluid>
              <h6>Publications</h6>
              <hr>
              <p>Such- und Filteroptionen für Publikationen</p>
            </b-container>
          </b-card>
        </b-col>
      </b-row>
    </b-container>


 <!-- +++++ Version 1 - TABS ++++++++++++++++++
 <div>
  <b-card no-body>
    <b-tabs card v-model="tabIndex">
      <b-tab title="Lakes" :title-link-class="linkClass(0)" active>
        <browser-list-lakes/>
      </b-tab>
      <b-tab title="Proxy records" :title-link-class="linkClass(1)">
          <b-tabs pills card vertical>
            <b-tab title="Diatoms">
              {{ 'ListAll.diatoms.parameters' }}
            </b-tab>
            <b-tab title="Varves" active>
              {{ 'listAll.varves.parameters' }}
            </b-tab>
            <b-tab title="XRF"  disabled>
              {{ 'listAll.xrfs.parameters' }}
            </b-tab>
          </b-tabs>
        {{ 'listAll.proxies' }}
      </b-tab>
      <b-tab title="Tephra layers" :title-link-class="linkClass(2)">
        {{ 'listAll.tephras' }}
      </b-tab>
      <b-tab title="Publications" :title-link-class="linkClass(3)">
        {{ 'listAll.publications' }}
      </b-tab>
    </b-tabs>
  </b-card>
 </div>
    -->
</template>

<script>
  import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';
  import bFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group';
  import bTabs from 'bootstrap-vue/es/components/tabs/tabs';
  import bTab from 'bootstrap-vue/es/components/tabs/tab';
  import browserListLakes from './BrowserTableLakes';

  export default {
    name: 'browserTools',
    components: {
      bFormCheckboxGroup,
      bFormCheckbox,
      browserListLakes,
      bTabs,
      bTab,
    },
    data () {
      return {
        tabIndex: 0, //version 1 - tab-identifikation

        selected: [], //proxy selection
        options: [
          {text: 'Alkanes', value: 'alkanes'},
          {text: 'Diatoms', value: 'diatoms'},
          {text: 'Varves', value: 'varves'},
        ]
      }
    },
    methods: {
      linkClass (idx) {
        if (this.tabIndex === idx) {
          return ['text-primary', 'font-bold']
        } else {
          return ['bg-darkblue', 'text-light']
        }
      }
    }
  }

</script>

<style lang="scss">
  .bg-darkblue {
    background-color: #004a9c;
  }
  .text-bold {
    font-weight: bold;
  }

</style>