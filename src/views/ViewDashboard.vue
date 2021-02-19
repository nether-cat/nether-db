<template>
  <BContainer fluid class="content">
    <BRow>
      <BCol cols="12" xl="8">
        <BCard title="Welcome to VARDA" img-src="@/assets/front-project_database.png" img-left class="card-feature">
          The Varved Sediments Database <span class="text-secondary">(VARDA)</span> provides standardized proxy records from annually resolved lake archives.
          All proxy records offer full quantification of age-uncertainty from state of the art age-depth modeling routines.
          VARDA is a service provided by the Helmholtz Centre Potsdam German Research Centre for Geosciences <span class="text-secondary">(GFZ)</span> and is funded by the PalMod initiative.
        </BCard>
        <BCard title="PalMod — Paleo Modeling" img-src="@/assets/palmod-logo.png" img-left class="card-feature card-palmod">
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
        <BCard class="card-news">
          <BCardTitle title-tag="h6">
            <span>New datasets added</span><span class="float-right text-muted small">16 November 2020</span>
          </BCardTitle>
          <BCardText>
            Thanks to the efforts of Alicja
            <a href="https://doi.org/10.1016/j.quascirev.2020.106715" target="_blank" rel="noopener">Bonk et al. 2020</a>
            and Daniela
            <a href="https://doi.org/10.1111/bor.12499" target="_blank" rel="noopener">Müller et al. 2020</a>,
            varve chronologies, varve thickness and 14C datasets from lake
            Gosciaz in Poland are now available on our platform.
          </BCardText>
        </BCard>
        <BCard class="card-news">
          <BCardTitle title-tag="h6">
            <span>A swift introduction to VARDA</span><span class="float-right text-muted small">27 October 2020</span>
          </BCardTitle>
          <BCardText>
            Cécile Blanchet has published an article on her <a
              href="https://blanchetcecile.wordpress.com/"
              target="_blank"
              rel="noopener"
            >personal website</a> that gives a <a
              href="https://blanchetcecile.wordpress.com/2020/10/27/varda-looking-into-earths-past-climates-one-layer-at-the-time"
              target="_blank"
              rel="noopener"
            >brief description</a> of our ongoing project.
          </BCardText>
        </BCard>
        <BCard class="card-news">
          <BCardTitle title-tag="h6">
            <span>A detailed report on VARDA</span><span class="float-right text-muted small">25 September 2020</span>
          </BCardTitle>
          <BCardText>
            We’re pleased to announce the final release of
            <a href="https://doi.org/10.5194/essd-12-2311-2020" target="_blank" rel="noopener">our paper</a>
            in the data publishing journal
            <a href="https://www.earth-system-science-data.net/" target="_blank" rel="noopener">Earth System Science Data</a>
            <span class="text-secondary">(ESSD)</span>.
            In this paper, we report in detail on our data mining and compilation strategies,
            the software design and the provided datasets effective by 26 July 2020.
          </BCardText>
        </BCard>
        <BCard class="card-news">
          <BCardTitle title-tag="h6">
            <span>New datasets added</span><span class="float-right text-muted small">11 June 2020</span>
          </BCardTitle>
          <BCardText>
            Thanks to the efforts of Julia
            <a href="https://doi.org/10.5194/gchron-2019-18" target="_blank" rel="noopener">Kalanke et al. 2020</a>,
            varve chronologies, varve thickness and 14C datasets from lake
            Chatyr Kol in Kyrgyzstan are now available on our platform.
          </BCardText>
        </BCard>
        <BCard class="card-news">
          <BCardTitle title-tag="h6">
            <span>Released version 1.0.0</span><span class="float-right text-muted small">22 November 2019</span>
          </BCardTitle>
          <BCardText>
            This version enables open access to the compiled datasets, including varve chronologies,
            varve thickness records, tephra layers and radiocarbon measurements. More paleoclimate
            proxies will be integrated in future updates. We will keep you posted about further
            additions and developments here, on this page.
          </BCardText>
          <BCardText>Application features provided:</BCardText>
          <BCardText text-tag="ul">
            <li>Index and map locations of varved lakes</li>
            <li>Search filters: continent, country, lake, age, tephra</li>
            <li>Detailed view of lakes and datasets</li>
            <li>Simple form for contacting the team</li>
          </BCardText>
          <BCardText>Compiled datasets included:</BCardText>
          <BCardText text-tag="ul">
            <li>Radiocarbon dating: <b>96</b></li>
            <li>Tephra layers: <b>45</b></li>
            <li>Varve chronologies: <b>64</b></li>
            <li>Varve thickness records: <b>50</b></li>
            <li class="list-unstyled w-50 mx-0 my-2 border-bottom border-secondary"/>
            <li class="list-unstyled text-muted">Total datasets: <b>255</b></li>
            <li class="list-unstyled text-muted">Sampled lakes: <b>89</b></li>
          </BCardText>
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
  .card-palmod {
    align-items: center;
    .card-img-left {
      padding: .75rem;
    }
  }
  .card-feature:last-child,
  .card-news:last-child {
    margin-bottom: 0 !important;
  }
</style>
