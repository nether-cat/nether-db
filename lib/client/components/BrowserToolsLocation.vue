<template>
  <b-card>
    <b-container fluid class="small">
      <h6 v-b-toggle.showLocationFilter onmouseover="" style="cursor: pointer;"> Search by location </h6>
      <hr>
      <b-collapse id="showLocationFilter" class="mt-2">
        <b-form-group label="Location:">
          <b-form-input prepend="Lake:" v-model="locationSelect.lakeName" placeholder="Lake..."></b-form-input>
        </b-form-group>

        <b-form-group>
          <b-form-input prepend="Continent:"
                        v-model="locationSelect.continent"
                        placeholder="Continent..."></b-form-input>
          </b-dropdown>
        </b-form-group>

        <b-form-group>
          <b-form-input prepend="Country:" v-model="locationSelect.country" placeholder="Country..."></b-form-input>
        </b-form-group>

        <b-form-group
            label="Latitude:"
            label-class="text-sm-right"
            label-for="inputX">
          <b-row id="inputX">
            <b-col md="6">
              <b-form-input v-model.lazy="locationSelect.latMin" placeholder="min (-90)"></b-form-input>
              <!-- "lazy" funktioniert nicht. warumn? -->
            </b-col>
            <b-col md="6">
              <b-form-input v-model.lazy="locationSelect.latMax" placeholder="max (90)"></b-form-input>
            </b-col>
          </b-row>
        </b-form-group>

        <b-form-group
            label="Longitude:"
            label-class="text-sm-right"
            label-for="inputY">
          <b-row id="inputY">
            <b-col md="6">
              <b-form-input v-model.lazy="locationSelect.lonMin" placeholder="min (-180)"></b-form-input>
            </b-col>
            <b-col md="6">
              <b-form-input v-model.lazy="locationSelect.lonMax" placeholder="max (180)"></b-form-input>
            </b-col>
          </b-row>
        </b-form-group>

        <b-form-group
            label="Elevation:"
            label-class="text-sm-right"
            label-for="inputElevation">
          <b-row id="inputElevation">
            <b-col>
              <b-form-input v-model.lazy="locationSelect.elevationMin" placeholder="any"></b-form-input>
            </b-col>
            <b-col>
              <b-form-input v-model.lazy="locationSelect.elevationMax" placeholder="any"></b-form-input>
            </b-col>
          </b-row>
        </b-form-group>

        <b-row>
          <p>Your selection:</p> <br>
          <div><p>{{ locationSelect }}</p></div>
        </b-row>
      </b-collapse>
    </b-container>
  </b-card>
</template>

<script>
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

  export default {
    name: 'BrowserToolsLocation',
    components: {
      bFormGroup,
      bFormInput,
    },

    data () {
      return {
        locationSelect: {
          lakeName: '',
          continent: '',
          country: '',
          latMin: '',
          latMax: '',
          lonMin: '',
          lonMax: '',
          elevationMin: '',
          elevationMax: '',
        },
      };
    },
  };
</script>
<style>

</style>