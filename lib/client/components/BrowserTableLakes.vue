<template>
    <b-container fluid>
      <!-- User Interface controls -->
      <b-row mt="3">
        <h3>Check this ouuut! </h3>
      </b-row>

      <b-row>
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Filter" class="mb-0">
            <b-input-group>
              <b-form-input v-model="filter" placeholder="Type to Search" />
              <b-input-group-append>
                <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Sort" class="mb-0">
            <b-input-group>
              <b-form-select v-model="sortBy" :options="sortOptions">
                <option slot="first" :value="null">-- none --</option>
              </b-form-select>
              <b-form-select :disabled="!sortBy" v-model="sortDesc" slot="append">
                <option :value="false">Asc</option>
                <option :value="true">Desc</option>
              </b-form-select>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Per page" class="mb-0">
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
        <template slot="name" slot-scope="row">{{row.value.first}} {{row.value.last}}</template>
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
  import bBtn from 'bootstrap-vue/es/components/button/button';
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
  import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
  import bTable from 'bootstrap-vue/es/components/table/table';




  const items = [
    // { datasetId: '', proxyType: '', lakeName: '', coreLabel: '', coreLatitude: '', coreLongitude: '', publicationAuthors: '', publicationDate: '', proxyParameters: '' },
    { datasetId: '1', proxyType: 'Varves', lakeName: 'Meerfelder Maar', coreLabel: '1', coreLatitude: '31.00000', coreLongitude: '52.00000', publicationAuthors: 'A.B.', publicationDate: '03/06/2018', proxyParameters: 'total thickness; dark layer thickness' },
    { datasetId: '2', proxyType: 'Alkanes', lakeName: 'Meerfelder Maar', coreLabel: '2', coreLatitude: '31.00000', coreLongitude: '52.00000', publicationAuthors: 'A.C.', publicationDate: '03/06/2018', proxyParameters: 'a; b; c; ' },
    { datasetId: '3', proxyType: 'Diatoms', lakeName: 'Kummerower See', coreLabel: '3', coreLatitude: '32.00000', coreLongitude: '57.00000', publicationAuthors: 'A.B.', publicationDate: '03/06/2018', proxyParameters: 'Diatom 1; Diatom 2; Diatom 3' },
    ]


  export default {
    name: 'BrowserTableLakes',
    components: {
      bBtn,
      bFormGroup,
      bFormInput,
      bFormSelect,
      bInputGroup,
      bTable,
    },

    data () {
        return {
          items: items,
          fields: [
            { key: 'datasetId', label: 'ID', sortable: true, sortDirection: 'asc' },
            { key: 'proxyType', label: 'Proxy type'},
            { key: 'lakeName', label: 'Lake', sortable: true },
            { key: 'coreLabel', label: 'Core label' },
            { key: 'coreLatitude', label: 'Latitude' },
            { key: 'coreLongitude', label: 'Longitude' },
            { key: 'publicationAuthors', label: 'Contributor',  sortable: true,},
            { key: 'publicationDate', label: 'Year',  sortable: true, 'class': 'text-center'},
            { key: 'proxyParameters', label: 'parameters'},
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
<style>

</style>