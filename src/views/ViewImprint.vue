<template>
  <BContainer fluid class="content">
    <BRow align-h="center">
      <BCol cols="12" xl="7">
        <BCard class="h-100 small" title="Imprint">
          <hr class="mt-1 mb-4">
          <p>
            Legal information according to § 5 TMG (German Telemedia Act) and
            § 55 RStV (German Interstate Broadcasting Treaty)
          </p>
          <section>
            <h6>Provider</h6>
            <p>
              The provider of the VARDA internet presence is the Helmholtz Centre Potsdam &middot;
              German Research Centre for Geosciences GFZ.<br>
              VARDA is supported by the German Federal Ministry of Education and Research (BMBF)
              as Research for Sustainable Development (FONA)
              through the PalMod initiative; Grant number: 01LP15-[10][A].
            </p>
          </section>
          <section>
            <h6>Address</h6>
            <p>
              Helmholtz Centre Potsdam<br>
              German Research Centre for Geosciences GFZ<br>
              Telegrafenberg<br>
              14473 Potsdam<br>
              Germany
            </p>
            <p>
              <a class="text-dark" target="_blank" href="https://www.gfz-potsdam.de/en/" rel="noopener noreferrer">
                <span class="sr-only">— Website:</span>
                <FontAwesomeIcon icon="link" fixed-width/><span class="pl-1">www.gfz-potsdam.de</span><br>
              </a>
              <LinkPhone class="text-dark" number="+49 331 288-0"/>
            </p>
          </section>
          <section>
            <h6>Legal form</h6>
            <p>
              The Helmholtz Centre Potsdam &middot; German Research Centre for Geosciences GFZ
              is a Public Law Foundation. The GFZ is a member of the
              <a target="_blank"
                 href="https://www.helmholtz.de/en/"
                 rel="noopener noreferrer"
              >Helmholtz-Gemeinschaft Deutscher Forschungszentren e.V.</a>
              (Helmholtz Association of German Research Centres).
            </p>
          </section>
          <section>
            <h6>Authorized representatives</h6>
            <p>
              The GFZ is legally represented by
              Prof. Dr. Dr. h.c. Reinhard Hüttl (Chairman of the Board and Scientific Executive Director)
              and Dr. Stefan Schwartze (Administrative Executive Director).
            </p>
          </section>
          <section>
            <h6>Value-Added Tax ID</h6>
            <p>
              VAT Identification Number according to § 27a UStG (German Turnover Tax Act): <i>DE138407750</i>
            </p>
          </section>
          <section>
            <h6>Editorial staff</h6>
            <p>
              <span style="font-weight: 500">
                Responsible editor for the contents of the VARDA internet presence
              </span><br>
              Prof. Dr. Achim Brauer (Head of section 4.3 – Climate Dynamics and Landscape Evolution)<br>
              <LinkEmail class="text-dark" name="Prof. Dr. Achim Brauer" :address="emailEditor"/><br>
              <LinkPhone class="text-dark" number="+49 331 288-1300"/>
            </p>
            <p>
              <span style="font-weight: 500">
                Editing, conception, coordination
              </span><br>
              Dr. Arne Ramisch<br>
              <LinkEmail class="text-dark" name="VARDA Staff" :address="emailStaff"/><br>
              <LinkPhone class="text-dark" number="+49 331 288-1300"/>
            </p>
          </section>
          <section>
            <h6>Screen design</h6>
            <p>
              Mario Dorn and Alexander Brauser<br>
              <LinkEmail class="text-dark" name="VARDA Staff" :address="emailStaff"/>
            </p>
          </section>
          <section>
            <h6>Technical realization and support</h6>
            <p>
              Mario Dorn and Alexander Brauser<br>
              <LinkEmail class="text-dark" name="VARDA Staff" :address="emailStaff"/>
            </p>
          </section>
          <section>
            <h6>Copyright</h6>
            <p>
              The texts and images on this website are protected by copyright.
              Copying these files or printing the publications is only permitted for private use.
              All other uses, such as duplication, alteration or use of these graphics, recordings,
              video sequences or texts on this websites in further electronic or printed publications
              for non-commercial and commercial purposes are not permitted without the explicit consent
              of the copyright holder, even if they are not labelled as a copyright protected document.
              Content, which is published under the Creative Commons License may be used only in
              accordance with the specified license conditions.
            </p>
          </section>
          <section>
            <h6>Liability notice</h6>
            <p>
              The editorial staff controls and updates the available information on these websites
              at regular intervals. Despite all care, information, data or links may have changed
              in the meantime. There is no liability or guarantee for the currentness, accuracy
              and completeness of the information provided. The same applies to all other websites,
              which are referred to by hyperlink. There is no responsibility for the content
              of the websites that can be reached as a result of such a connection.
              Instead the relevant provider is always responsible for the contents of the linked pages.
              In establishing the initial link, the editorial staff has reviewed the relevant external
              content in order to determine that they were free of illegal content at the time of linking.
              If you detect any errors in content or technology, please let us know.
            </p>
          </section>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
const LinkEmail = {
  functional: true,
  render (h, { data, props: { address, name } }) {
    let charToHex = str => str.charCodeAt(0).toString(16);
    let entities = address.replace(/./g, match => `&#x${charToHex(match)};`);
    let urlEncoded = address.replace(/./g, match => `%${charToHex(match)}`);
    delete data.attrs.address;
    return (
      <a target="_blank"
         rel="noopener noreferrer"
         domPropsHref={`mailto:"${name || urlEncoded}" <${urlEncoded}>`}
         {...data}
      >
        <span class="sr-only">— E-Mail:</span>
        <FontAwesomeIcon icon="envelope" fixedWidth={true}/>
        <span class="pl-1" domPropsInnerHTML={entities}/>
      </a>
    );
  },
};
const LinkPhone = {
  functional: true,
  render (h, { data, props: { number } }) {
    delete data.attrs.number;
    return (
      <span {...data}>
        <span class="sr-only">— Phone:</span>
        <FontAwesomeIcon icon="phone" fixedWidth={true}/>
        <span class="pl-1" domPropsInnerHTML={number}/>
      </span>
    );
  },
};

export default {
  name: 'ViewImprint',
  components: {
    LinkEmail,
    LinkPhone,
  },
  data () {
    return {
      emailEditor: `brau${'\x40'}gfz-potsdam${'.'}de`,
      emailStaff: `varve${'\x40'}gfz-potsdam${'.'}de`,
    };
  },
};
</script>
