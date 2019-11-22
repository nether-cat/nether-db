<template>
  <BContainer fluid class="content">
    <BRow>
      <BCol cols="12" xl="8">
        <BCard title="Welcome to VARDA" img-src="@/assets/front-project_database.png" img-left class="card-feature">
          The Varved Sediments Database <span class="text-secondary">(VARDA)</span> provides standardized proxy records from annually resolved lake archives.
          All proxy records offer full quantification of age-uncertainty from state of the art age-depth modeling routines.
          VARDA is a service provided by the Helmholtz Centre Potsdam German Research Centre for Geosciences <span class="text-secondary">(GFZ)</span> and is funded by the PalMod initiative.
        </BCard>
        <BCard title="PalMod — Paleo Modeling" img-src="@/assets/front-palmod_1st_circular.png" img-left class="card-feature">
          PalMod is funded by the German Federal Ministry of Education and Science <span class="text-secondary">(BMBF)</span> to examine climate system dynamics and variability during the last glacial cycle.
          One key aspect is to identify and quantify the relative contributions of the fundamental processes that determined the Earth’s climate trajectory and variability during the last glacial cycle.
          Using comprehensive Earth System Models <span class="text-secondary">(ESM)</span> this consortium aims at simulating the climate from the peak of the last interglacial (the Eemian warm period)
          up to the present, including its changing variability. The research will assess possible future climate trajectories beyond this century with sophisticated ESMs tested this way.
        </BCard>
        <BCard title="GFZ — Climate Dynamics and Landscape Evolution" img-src="@/assets/front-gfz_section.jpg" img-left class="card-feature">
          We investigate climate change in the geological and historical past and its impacts on the human habitat as well as past changes
          in the Earth’s magnetic field. A primary concern of our research are particularly rapid climate changes that occurred within a few years or decades.
          Therefore, we exploit high-resolution terrestrial geo-archives such as annually laminated (varved) lake sediments and tree rings.
          A crucial part of our approach is to date our archives precisely and accurately as an important basis for reliable reconstructions of changes in the past.
        </BCard>
      </BCol>
      <BCol cols="12" xl="4">
        <BContainer fluid class="pt-4 pt-sm-5 pt-xl-0">
          <h4>Latest Updates</h4><hr>
        </BContainer>
        <BCard title="Release v1.0.2" class="card-news">
          <span class="card-text">
            Eget felis eget nunc lobortis mattis aliquam faucibus. Ut eu sem integer vitae justo eget. Turpis egestas maecenas pharetra convallis posuere morbi leo urna.
          </span>
        </BCard>
        <BCard title="Release v1.0.1" class="card-news">
          <span class="card-text">
            Lectus arcu bibendum at varius vel pharetra. Tempor nec feugiat nisl pretium fusce id velit ut. Duis at consectetur lorem donec.
          </span>
        </BCard>
        <BCard title="Release v1.0.0" class="card-news">
          <span class="card-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </span>
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
  .card-news {
    color: var(--secondary);
    .card-text {
      text-decoration: line-through;
    }
  }
</style>
