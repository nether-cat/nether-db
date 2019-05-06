export default {
  data: function () {
    return {
      state: {
        timers: new WeakMap(),
        waiting: false,
      },
    };
  },
  methods: {
    /**
     * Triggers validation of the specified field
     * @param {object} field Field to be validated e.g. `$v.myForm.myInput`
     * @param {int} [delay=750] Minimum wait in ms to throttle validations
     * @param [value=null] Pass value manually if not using `v-model`
     */
    validate (field, delay = 750, value = undefined) {
      if (delay) {
        field.$reset();
      }
      if (value !== undefined && !this.$v.form.$invalid && (delay || this.state.timers.has(this.$v.form))) {
        clearTimeout(this.state.timers.get(this.$v.form));
        let resetFlag = () => (this.state.waiting = false) || this.state.timers.delete(this.$v.form);
        (this.state.waiting = true) && this.state.timers.set(this.$v.form, setTimeout(resetFlag, delay));
      }
      if (delay || this.state.timers.has(field)) {
        clearTimeout(this.state.timers.get(field));
        let probablySetValue = () => (value !== undefined) && (field.$model = value) && 0;
        let touchField = () => field.$touch() && 0;
        let handleState = () => probablySetValue() || touchField() || this.state.timers.delete(field);
        this.state.timers.set(field, setTimeout(handleState, delay));
      } else if (value !== undefined) {
        field.$model = value;
      }
    },
  },
};
