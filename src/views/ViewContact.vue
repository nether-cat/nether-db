<template>
  <BContainer class="content">
    <BRow>
      <BCol>
        <BCard>
          <BContainer fluid class="small">
            <h6> Contributors: </h6>
            <p>Mario Dorn (GFZ-Potsdam)</p>
            <p>Alexander Brauser (GFZ-Potsdam)</p>
            <p>Dr. Arne Ramisch (GFZ-Potsdam)</p>
            <p>Dr. Boris Biskaborn (AWI Potsdam)</p>
            <hr>
            <h6> Mail: </h6>
            <p>1</p>
            <p>2</p>
            <p>3</p>
            <p>4</p>

            <h6>
              <FontAwesomeIcon icon="hands-helping" fixed-width/>
              Participate!
            </h6>
            <p>Help this project to grow by sharing your thoughts with us.</p>
            <p>We appreciate all your suggestions, bug reports and further cooperations.</p>
          </BContainer>
        </BCard>
      </BCol>
      <BCol>
        <BCard>
          <BContainer fluid class="small">
            <h6> Get in contact: </h6>
            <p>Please use this form to get in touch, as it is supposed to be the easiest way.</p>
            <hr>
            <BRow>
              <BCol>
                <BFormGroup label="Name:">
                  <BFormInput v-model="contact.name"/>
                </BFormGroup>
              </BCol>
              <BCol>
                <BFormGroup label="Surname:">
                  <BFormInput v-model="contact.surname" prepend="Surname:"/>
                </BFormGroup>
              </BCol>
            </BRow>
            <BRow>
              <BCol>
                <BFormGroup label="Your email:">
                  <BFormInput v-model="contact.email" prepend="Email:"/>
                </BFormGroup>
              </BCol>
              <BCol>
                <BFormGroup label="Your institution:">
                  <BFormInput v-model="contact.institution" prepend="Name:"/>
                </BFormGroup>
              </BCol>
            </BRow>
            <BFormGroup label="Subject:">
              <BFormInput v-model="contact.subject" prepend="Subject:"/>
            </BFormGroup>
            <BFormGroup label="Your message:">
              <BFormTextarea v-model="contact.message" prepend="Message:" rows="2"/>
            </BFormGroup>
            <BRow>
              <p>contact form output:</p> <br>
              <div><p>{{ contact }}</p></div>
            </BRow>
          </BContainer>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import BFormTextarea from 'bootstrap-vue/es/components/form-textarea/form-textarea';

export default {
  name: 'ViewContact',
  components: {
    BFormTextarea,
  },

  data () {
    return {
      contact: {
        name: '',
        surname: '',
        email: '',
        institution: '',
        subject: '',
        message: '',

      },
    };
  },
};
</script>
