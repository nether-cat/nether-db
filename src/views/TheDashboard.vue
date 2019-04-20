<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" lg="8">
        <b-card title="Paleolimnological Database" img-src="@/assets/front-project_database.png" img-left class="card-feature">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Sed sed risus pretium quam vulputate. Blandit massa enim nec dui nunc mattis. Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin. Nunc scelerisque viverra mauris in.
        </b-card>
        <b-card title="PalMod — Paleoclimatology Modeling" img-src="@/assets/front-palmod_1st_circular.png" img-left class="card-feature">
          Lectus arcu bibendum at varius vel pharetra. Tempor nec feugiat nisl pretium fusce id velit ut. Duis at consectetur lorem donec. Tortor posuere ac ut consequat semper viverra nam libero justo. Posuere lorem ipsum dolor sit. Aenean sed adipiscing diam donec adipiscing tristique risus nec feugiat.
        </b-card>
        <b-card title="GFZ — Climate Dynamics and Landscape Evolution" img-src="@/assets/front-gfz_section.jpg" img-left class="card-feature">
          Eget felis eget nunc lobortis mattis aliquam faucibus. Ut eu sem integer vitae justo eget. Turpis egestas maecenas pharetra convallis posuere morbi leo urna. Sed vulputate mi sit amet mauris commodo. Enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus.
        </b-card>
      </b-col>
      <b-col cols="12" lg="4">
        <b-container fluid class="pt-4 pt-lg-0">
          <h4>Latest Updates</h4><hr>
        </b-container>
        <b-card title="Release v1.0.2" class="mb-3">
          Eget felis eget nunc lobortis mattis aliquam faucibus. Ut eu sem integer vitae justo eget. Turpis egestas maecenas pharetra convallis posuere morbi leo urna.
        </b-card>
        <b-card title="Release v1.0.1" class="mb-3">
          Lectus arcu bibendum at varius vel pharetra. Tempor nec feugiat nisl pretium fusce id velit ut. Duis at consectetur lorem donec.
        </b-card>
        <b-card title="Release v1.0.0" class="mb-3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'the-dashboard',
};
</script>

<style lang="scss" scoped>
  .card-feature {
    align-items: flex-start;
    margin-bottom: 1rem !important;
    &:last-child {
      margin-bottom: 0 !important;
    }
    .card-img-left {
      height: auto;
      max-width: 16rem;
    }
  }
  .mb-3:last-child {
    margin-bottom: 0 !important;
  }
</style>
