<template>
  <b-card class="text-small">
  <b-container fluid>
    <h6> Search by location </h6>
    <br>
    <b-form-group>
      <b-form-input v-model="locationSelect.lakeName" placeholder="Lake..."></b-form-input>
    </b-form-group>

    <b-form-group>
      <b-form-input v-model="locationSelect.continent" placeholder="Continent..."></b-form-input>
    </b-form-group>

    <b-form-group>
      <b-form-input v-model="locationSelect.country" placeholder="Country..."></b-form-input>
    </b-form-group>

    <p>Latitude:</p>
    <b-form-group>
      <b-row>
        <b-col md="6">
          <b-form-input v-model="locationSelect.latMin" placeholder="min (-90)"></b-form-input>
        </b-col>
        <b-col md="6">
          <b-form-input v-model="locationSelect.latMax" placeholder="max (90)"></b-form-input>
        </b-col>
      </b-row>
    </b-form-group>

    <b-form-group
        label="Longitude:"
        label-class="text-sm-right"
        label-for="inputXY">
      <b-row id="inputXY">
        <b-col md="6">
          <b-form-input  v-model="locationSelect.lonMin" placeholder="min (-180)"></b-form-input>
        </b-col>
        <b-col md="6">
          <b-form-input v-model="locationSelect.lonMax" placeholder="max (180)"></b-form-input>
        </b-col>
      </b-row>
    </b-form-group>

    <b-form-group
        label="Elevation:"
        label-class="text-sm-right"
        label-for="inputElevation">
      <b-row id="inputElevation">
        <b-col>
          <b-form-input v-model="locationSelect.elevationMin" placeholder="any"></b-form-input>
        </b-col>
        <b-col>
          <b-form-input v-model="locationSelect.elevationMax" placeholder="any"></b-form-input>
        </b-col>
      </b-row>
    </b-form-group>
  </b-container>
  <b-row hidden>
    <p>Your selection:</p> <br>
    <div><p>{{ locationSelect }}</p></div>
  </b-row>
  </b-card>
</template>

<script>
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

export default {
name: 'browserToolsLocation',
components: {
  bFormGroup,
  bFormInput,
},

data () {
  return {
    locationSelect: {
      lakeName: "",
      continent: "",
      country: "",
      latMin: "",
      latMax: "",
      lonMin: "",
      lonMax: "",
      elevationMin: "",
      elevationMax: "",
    }
  }
}
};
</script>
<style>

</style>
