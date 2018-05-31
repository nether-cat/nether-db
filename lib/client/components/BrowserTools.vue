<template>
  <div>
  <p>What are you looking for?</p>
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
</template>

<script>
  import bTabs from 'bootstrap-vue/es/components/tabs/tabs';
  import bTab from 'bootstrap-vue/es/components/tabs/tab';
  import browserListLakes from './BrowserListLakes';

  export default {
    name: 'browserTools',
    components: {
      browserListLakes,
      bTabs,
      bTab,
    },
    data () {
      return {
        tabIndex: 0
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