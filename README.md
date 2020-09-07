# vue1-vee-validate
> [vee-validate](https://github.com/logaretm/vee-validate/tree/v2) v2 for Vue.js 1.x

### Installation

#### npm
```
npm i vue1-vee-validate --save
```
#### yarn
```
yarn add vue1-vee-validate
```

### Getting Started
```javascript
import Vue from 'vue';
import VeeValidate from 'vee-validate';
import Vue1VeeValidate from 'vue1-vee-validate';

Vue.use(VeeValidate);
```

or include the script directly

```html
<script src="path/to/vue.js"></script>
<script src="path/to/vee-validate.js"></script>
<script src="path/to/vue1-vee-validate.js"></script>
<script>
  Vue.use(VeeValidate); // good to go.
</script>
```

### Basic Example
```html
<input v-validate="'required|email'" name="email" type="text">
<span>{{ errors.first('email') }}</span>
```

### Documentation
Read VeeValidate v2 [documentation](https://vee-validate.logaretm.com/v2/).