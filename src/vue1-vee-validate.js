(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue1VeeValidate = factory());
}(this, function() {
  /**
   * helper function
   */

  // Gets the value in an object safely.
  var getPath = function (path, target, def) {
    if ( def === void 0 ) def = undefined;

    if (!path || !target) { return def; }

    var value = target;
    path.split('.').every(function (prop) {
      if (prop in value) {
        value = value[prop];

        return true;
      }

      value = def;

      return false;
    });

    return value;
  };

  // Checks if a function is callable.
  var isCallable = function (func) { return typeof func === 'function'; };

  // Converts an array-like object to array, provides a simple polyfill for Array.from
  var toArray = function (arrayLike) {
    if (isCallable(Array.from)) {
      return Array.from(arrayLike);
    }

    var array = [];
    var length = arrayLike.length;
    /* istanbul ignore next */
    for (var i = 0; i < length; i++) {
      array.push(arrayLike[i]);
    }

    /* istanbul ignore next */
    return array;
  };

  // finds the first element that satisfies the predicate callback, polyfills array.find
  var findIndex = function (arrayLike, predicate) {
    var array = Array.isArray(arrayLike) ? arrayLike : toArray(arrayLike);
    for (var i = 0; i < array.length; i++) {
      if (predicate(array[i])) {
        return i;
      }
    }

    return -1;
  };
  var find = function (arrayLike, predicate) {
    var array = Array.isArray(arrayLike) ? arrayLike : toArray(arrayLike);
    var idx = findIndex(array, predicate);

    return idx === -1 ? undefined : array[idx];
  };

  /**
   * Custom resolver
   */
  let Resolver = function Resolver () {};
  Resolver.getCtorConfig = function getCtorConfig (el) {
    if (!el.__vue__) { return null; }
    const config = getPath('$options.$_veeValidate', el.__vue__);
    return config;
  };
  Resolver.resolveName = function resolveName(el) {
    const name = el.getAttribute("data-vv-name") || el.name;

    if(!name && el.__vue__) {
      const config = Resolver.getCtorConfig(el);
      const boundGetter = config.name.bind(el.__vue__);
      return boundGetter();
    }

    return name;
  };
  Resolver.resolveGetter = function resolveGetter(el) {
    const config = Resolver.getCtorConfig(el);
    if(config && typeof config.value === 'function') {
      const boundGetter = config.value.bind(el.__vue__);
      return function() {
        return boundGetter();
      }
    }

    switch (el.type) {
      case 'checkbox': return function () {
        let els = document.querySelectorAll(("input[name=\"" + (el.name) + "\"]"));

        els = toArray(els).filter(function (el) { return el.checked; });
        if (!els.length) { return undefined; }

        return els.map(function (checkbox) { return checkbox.value; });
      };
      case 'radio': return function () {
        let els = document.querySelectorAll(("input[name=\"" + (el.name) + "\"]"));
        let elm = find(els, function (el) { return el.checked; });

        return elm && elm.value;
      };
      case 'file': return function (context) {
        return toArray(el.files);
      };
      case 'select-multiple': return function () {
        return toArray(el.options).filter(function (opt) { return opt.selected; }).map(function (opt) { return opt.value; });
      };
      default: return function () {
        return el && el.value;
      };
    }
  };
  Resolver.resolveDelay = function resolveDelay(el, globalConfig) {
    const delayAttr = el.getAttribute("data-vv-delay");
    const globalDelay = (globalConfig && 'delay' in globalConfig) ? globalConfig.delay : 0;
    const delay = delayAttr || globalDelay;

    if (typeof delay === 'number') { return delay; }
    if (typeof delay === 'string') { return parseInt(delay); }

    var map = {};
    for (var element in delay) {
      map[element] = parseInt(delay[element]);
    }

    return map;
  };
  Resolver.resolveEvents = function resolveEvents(el) {
    let events = el.getAttribute("data-vv-validate-on");

    if(!events && el.__vue__) {
      const config = Resolver.getCtorConfig(el);
      events = config && config.events;
    }

    return events;
  };
  Resolver.resolveScope = function resolveScope(el) {
    let scope = el.getAttribute('data-vv-scope');
    if(!scope) {
      const form = el.closest('form');
      if(form) {
        scope = form.getAttribute('data-vv-scope');
      }
    }
    return scope;
  }

  /**
   * Plugin
   */
  const Vue1VeeValidate = function(){}
  Vue1VeeValidate.install = function(Vue, options) {
    // VeeValidate config
    VeeValidate.configure(options);

    // init validator
    const validator = new VeeValidate.Validator;
    validator.localize(VeeValidate.config.locale);
    Vue.prototype.$validator = validator;
    Vue.validator = validator;

    // directive
    Vue.directive('validate', {
      update(val) {
        if(this.vm.errors === undefined || (typeof this.vm.errors === 'object' && this.vm.errors.constructor.name !== 'ErrorBag')) {
          Vue.set(this.vm, 'errors', this.vm.$validator.errors);
        }
        const globalConfig = VeeValidate.config;

        const attachValidator = () => {
          const field = this.vm.$validator.fields.findById(this.el._veeValidateId);
          if(field) {
            this.vm.$validator.detach(field);;
          }
          const config = {
            name: Resolver.resolveName(this.el),
            el: this.el,
            listen: !this.modifiers.disable,
            bails: this.modifiers.bails ? true : (this.modifiers.continues === true ? false : undefined),
            scope: Resolver.resolveScope(this.el),
            vm: this.vm,
            classes: globalConfig.classes,
            classNames: globalConfig.classNames,
            getter: Resolver.resolveGetter(this.el),
            events: Resolver.resolveEvents(this.el) || globalConfig.events,
            delay: Resolver.resolveDelay(this.el, globalConfig),
            rules: val,
            immediate: !!this.modifiers.initial || !!this.modifiers.immediate,
            persist: !!this.modifiers.persist,
          };
          this.vm.$validator.attach(config);
        }
        this.vm.$nextTick(attachValidator);
      },
      unbind() {
        const field = this.vm.$validator.fields.findById(this.el._veeValidateId);
        if(field) {
          this.vm.$validator.detach(field);
        }
      }
    });
  }

  return Vue1VeeValidate;
}));