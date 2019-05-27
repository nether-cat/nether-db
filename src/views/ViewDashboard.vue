<template>
  <BContainer fluid class="content">
    <BRow>
      <BCol cols="12" xl="8">
        <BCard title="Paleolimnological Database" img-src="@/assets/front-project_database.png" img-left class="card-feature">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Sed sed risus pretium quam vulputate. Blandit massa enim nec dui nunc mattis. Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin. Nunc scelerisque viverra mauris in.
        </BCard>
        <BCard title="PalMod — Paleoclimatology Modeling" img-src="@/assets/front-palmod_1st_circular.png" img-left class="card-feature">
          Lectus arcu bibendum at varius vel pharetra. Tempor nec feugiat nisl pretium fusce id velit ut. Duis at consectetur lorem donec. Tortor posuere ac ut consequat semper viverra nam libero justo. Posuere lorem ipsum dolor sit. Aenean sed adipiscing diam donec adipiscing tristique risus nec feugiat.
        </BCard>
        <BCard title="GFZ — Climate Dynamics and Landscape Evolution" img-src="@/assets/front-gfz_section.jpg" img-left class="card-feature">
          Eget felis eget nunc lobortis mattis aliquam faucibus. Ut eu sem integer vitae justo eget. Turpis egestas maecenas pharetra convallis posuere morbi leo urna. Sed vulputate mi sit amet mauris commodo. Enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus.
        </BCard>
      </BCol>
      <BCol cols="12" xl="4">
        <BContainer fluid class="pt-4 pt-sm-5 pt-xl-0">
          <h4>Latest Updates</h4><hr>
        </BContainer>
        <BCard title="Release v1.0.2" class="card-news">
          Eget felis eget nunc lobortis mattis aliquam faucibus. Ut eu sem integer vitae justo eget. Turpis egestas maecenas pharetra convallis posuere morbi leo urna.
        </BCard>
        <BCard title="Release v1.0.1" class="card-news">
          Lectus arcu bibendum at varius vel pharetra. Tempor nec feugiat nisl pretium fusce id velit ut. Duis at consectetur lorem donec.
        </BCard>
        <BCard title="Release v1.0.0" class="card-news">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
export default {
  name: 'ViewDashboard',
};
</script>

<style lang="scss" scoped>
  .card-feature,
  .card-news {
    margin-bottom: 1rem !important;
    align-items: flex-start;
    display: block;
    hyphens: auto;
    .card-img-left {
      height: auto;
      padding: 1.25rem .75rem .5rem 1.25rem;
      max-height: 8.0rem;
      max-width: 35%;
      display: inline;
      float: left;
    }
    @media (min-width: 768px) {
      display: flex;
      hyphens: inherit;
      .card-img-left {
        padding: 0;
        max-height: unset;
        max-width: 18rem;
        display: inherit;
        float: unset;
      }
    }
  }
  .card-feature:last-child,
  .card-news:last-child {
    margin-bottom: 0 !important;
  }
</style>
