<template>
  <b-card>
    <b-container fluid class="card-text small">
      <h6 v-b-toggle.showAgeFilter onmouseover="" style="cursor: pointer;"> Search by age </h6>
      <hr>
      <b-collapse id="showAgeFilter" class="mt-2">
        <b-form-group
            label="Age coverage:"
            label-class="text-sm-right"
            label-for="inputAgeCoverage">
          <b-row id="inputAgeCoverage">
            <b-col>
              <b-form-input v-model.lazy="ageSelect.min" placeholder="min age [a B.P.]"></b-form-input>
            </b-col>
            <b-col>
              <b-form-input v-model.lazy="ageSelect.max" placeholder="max age [a B.P.]"></b-form-input>
            </b-col>
          </b-row>
        </b-form-group>

        <test-chart/>

        <b-form-group label="Age resolution:">
          <b-form-checkbox-group buttons id="ageCheckboxes" v-model="ageResolution" :options="classes">
          </b-form-checkbox-group>
        </b-form-group>
        <div>Selected ages: <p> {{ ageSelect }} </p>
        </div>
        <div>Selected resolution: <p> {{ ageResolution }} </p>
        </div>
      </b-collapse>
    </b-container>
  </b-card>
</template>

<script>
  import TestChart from './TestChart';

  export default {
    name: 'BrowserToolsAge',
    components: {
      TestChart,
    },

    data () {
      return {
        ageSelect: {
          min: '',
          max: '',
        },
        ageResolution: [],
        classes: [
          { text: '1 - 10 y', value: '1-10' },
          { text: '10 - 100 y', value: '10-100' },
          { text: 'lower', value: 'lower' },
        ],
      };
    },
  };
</script>

<style>

</style>