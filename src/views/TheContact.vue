<template>
  <b-container>
    <b-row>
      <b-col>
        <b-card>
          <b-container fluid class="small">
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
              <font-awesome-icon icon="hands-helping" fixed-width/>
              Participate!
            </h6>
            <p>Help this project to grow by sharing your thoughts with us.</p>
            <p>We appreciate all your suggestions, bug reports and further cooperations.</p>
          </b-container>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <b-container fluid class="small">
            <h6> Get in contact: </h6>
            <p>Please use this form to get in touch, as it is supposed to be the easiest way.</p>
            <hr>
            <b-row>
              <b-col>
                <b-form-group label="Name:">
                  <b-form-input v-model="contact.name"/>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="Surname:">
                  <b-form-input v-model="contact.surname" prepend="Surname:"/>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group label="Your email:">
                  <b-form-input v-model="contact.email" prepend="Email:"/>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="Your institution:">
                  <b-form-input v-model="contact.institution" prepend="Name:"/>
                </b-form-group>
              </b-col>
            </b-row>
            <b-form-group label="Subject:">
              <b-form-input v-model="contact.subject" prepend="Subject:"/>
            </b-form-group>
            <b-form-group label="Your message:">
              <b-form-textarea v-model="contact.message" prepend="Message:" rows="2"/>
            </b-form-group>


            <b-row>
              <p>contact form output:</p> <br>
              <div><p>{{ contact }}</p></div>
            </b-row>
          </b-container>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import bFormTextarea from 'bootstrap-vue/es/components/form-textarea/form-textarea';

export default {
  name: 'the-contact',
  components: {
    bFormTextarea,
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
<style>

</style>
