<template>
  <b-container fluid>
    <!-- User Interface controls -->
    <p>Filter and sorting options:</p>
    <b-row class="mt-1 mb-3">
      <b-col>
        <b-form-group horizontal class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="..." />
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col >
        <b-form-group horizontal class="mb-0">
          <b-input-group>
            <b-form-select v-model="sortBy" :options="sortOptions">
              <option slot="first" :value="null">-- none --</option>
            </b-form-select>
            <b-form-select :disabled="!sortBy" v-model="sortDesc">
              <option :value="false">Asc</option>
              <option :value="true">Desc</option>
            </b-form-select>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group horizontal class="mb-0">
          <b-form-select :options="pageOptions" v-model="perPage" />
        </b-form-group>
      </b-col>
    </b-row>

    <!-- Main table element -->
    <b-table show-empty
             stacked="md"
             :items="items"
             :fields="fields"
             :current-page="currentPage"
             :per-page="perPage"
             :filter="filter"
             :sort-by.sync="sortBy"
             :sort-desc.sync="sortDesc"
             :sort-direction="sortDirection"
             @filtered="onFiltered"
    >
      <template slot="lake" slot-scope="row">{{row.value.first}} {{row.value.last}}</template>
      <template slot="actions" slot-scope="row">
        <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
        <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">
          Info modal
        </b-button>
        <b-button size="sm" @click.stop="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-button>
      </template>
      <template slot="row-details" slot-scope="row">
        <b-card>
          <ul>
            <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value}}</li>
          </ul>
        </b-card>
      </template>
    </b-table>

    <b-row>
      <b-col md="6" class="my-1">
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
      </b-col>
    </b-row>

    <!-- Info modal -->
    <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only>
      <pre>{{ modalInfo.content }}</pre>
    </b-modal>

  </b-container>
</template>

<script>
  import bModal from 'bootstrap-vue/es/components/modal/modal';
  import bPagination from 'bootstrap-vue/es/components/pagination/pagination';
  import bTable from 'bootstrap-vue/es/components/table/table';

  const items = [
    {
      lakeName: 'Meerfelder Maar',
      proxyType: 'Diatoms',
      coreLabel: '1',
      ageMin: '11000',
      ageMax: '25000',
      ageResolution: '1 y',
      proxyParameters: 'diatom1, diatom2, diatom3 ',
      publication: 'A.B. (2017): Hello diatoms',
      moreInfo: 'additional info not shown in table',
    },
    {
      lakeName: 'Meerfelder Maar',
      proxyType: 'Varves',
      coreLabel: '2',
      ageMin: '2000',
      ageMax: '80000',
      ageResolution: '1 y',
      proxyParameters: 'total thickness, dark layer thickness',
      publication: 'A.B. (2018): Hello World',
      moreInfo: 'additional info not shown in table',
      moreInfo2: 'additional info not shown in table, too',
    },
    {
      lakeName: 'Kummerower See',
      proxyType: 'Varves',
      coreLabel: '3',
      ageMin: '10',
      ageMax: '5200',
      ageResolution: '1 y',
      proxyParameters: 'total thickness',
      publication: 'A.B. (2013): Hello MV',
      moreInfo: 'more info than shown in table',
      moreInfo2: 'additional info not shown in table, too',
    },
  ];

  export default {
    name: 'BrowserTableLakes',
    components: {
      bModal,
      bPagination,
      bTable,
    },
    data () {
      return {
        items: items,
        fields: [
          { key: 'lakeName', label: 'Lake', sortable: true, sortDirection: 'asc' },
          { key: 'proxyType', label: 'Proxy', sortable: true },
          { key: 'coreLabel', label: 'Core' },
          { key: 'ageMin', label: 'Age min', sortable: true },
          { key: 'ageMax', label: 'Age max', sortable: true },
          { key: 'ageResolution', label: 'Age resolution' },
          { key: 'proxyParameters', label: 'Parameters' },
          { key: 'publication', label: 'Publication', sortable: true },
          { key: 'actions', label: 'Actions' }
        ],
        currentPage: 1,
        perPage: 5,
        totalRows: items.length,
        pageOptions: [ 5, 10, 15 ],
        sortBy: null,
        sortDesc: false,
        sortDirection: 'asc',
        filter: null,
        modalInfo: { title: '', content: '' }
      }
    },
    computed: {
      sortOptions () {
        // Create an options list from our fields
        return this.fields
          .filter(f => f.sortable)
          .map(f => { return { text: f.label, value: f.key } })
      }
    },
    methods: {
      info (item, index, button) {
        this.modalInfo.title = `Row index: ${index}`
        this.modalInfo.content = JSON.stringify(item, null, 2)
        this.$root.$emit('bv::show::modal', 'modalInfo', button)
      },
      resetModal () {
        this.modalInfo.title = ''
        this.modalInfo.content = ''
      },
      onFiltered (filteredItems) {
        // Trigger pagination to update the number of buttons/pages due to filtering
        this.totalRows = filteredItems.length
        this.currentPage = 1
      }
    }
  }
</script>

<style lang="scss" scoped>
  .table {
    font-size: x-small;
    }

</style>
