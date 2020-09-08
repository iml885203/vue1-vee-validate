(() => {
  // vue component
  Vue.component('text-input', {
    $_veeValidate: {
      name() {
        return this.label;
      },
      value() {
        return this.value;
      }
    },
    props: {
      value: String,
      label: {
        type: String
      },
      disabled: {
        type: Boolean,
        default: false
      },
      type: {
        type: String,
        default: "text",
        validator: val => {
          return (
            ["url", "text", "password", "email", "search"].indexOf(val) !== -1
          );
        }
      }
    },
    template: `
      <div>
        <label v-if="label "class="form__label">{{ label }}</label>
        <input :type="type" :value="value" @input="updateValue" @change="updateValue" @blur="$emit('blur')" :disabled="disabled" :class="{ 'form-control': true}">
      </div>
    `,
    methods: {
      updateValue(e) {
        console.log("[inupt]: ", e.target.value);
        this.value = e.target.value;
        this.$emit("input", e.target.value);
      }
    }
  });
  Vue.component('test-main', {
    data() {
      return {
        randId: Math.floor(Math.random()*10)+1,
        toggleUnbind: true,
        dynamicRule: '',
        exampleVueCode: {
          syntax: [
            "{{ errors.first('syntax_email') }}",
            "{{ errors.first('syntax_alpha') }}"
          ],
          diserrs: [
            "{{ error }}",
            "{{ error }}",
            "{{ error }}"
          ],
          modifiers: [
            "{{ errors.first('modifiers_immediate') }}",
            "{{ errors.first('modifiers_disable') }}",
            "{{ error }}"
          ],
          form: [
            "{{ errors.first('form_checkbox') }}",
            "{{ errors.first('form_radio') }}"
          ],
          vv: [
            "{{ errors.first('vv_as') }}",
            "{{ errors.first('vv_delay') }}",
            "{{ errors.first('vv_scope_form-1.email') }}",
            "{{ errors.first('vv_scope_form-1.password') }}",
            "{{ errors.first('vv_scope_form-2.email') }}",
            "{{ errors.first('vv_scope_form-2.password') }}"
          ],
          custom: [
            "{{ errors.first('custom_unit') }}"
          ],
          others: [
            "{{ errors.first('unbind_email') }}",
            "{{ errors.first('dynamic_rule') }}",
            "{{ errors.first('custom_component') }}",
            "{{ errors.first(`name-${randId}`) }}"
          ]
        }
      };
    },
    methods: {
      verify(name) {
        console.log(`call verify ${name}`);
        this.$validator.validate(name);
      },
      validateForm(scope) {
        this.$validator.validateAll(scope).then((result) => {
        if (result) {
          alert('Form Submitted!');
        }
      });
      }
    },
    ready() {
      console.log('test-main ready');
    },
  });

  // Vue use
  Vue.use(Vue1VeeValidate);

  // custom rule
  VeeValidate.Validator.extend('unit', {
    getMessage: (field, [unit]) => `${field} must be in units of ${unit}`,
    validate: (value, [unit]) => parseInt(value) % parseInt(unit) === 0
  });

  // Vue init
  new Vue({
    el: 'body',
    template: '',
    data() {
      return {};
    },
  });
})();
