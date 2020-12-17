'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, global.Vue1VeeValidate = factory());
})(undefined, function () {
  /**
   * helper function
   */

  // Gets the value in an object safely.
  var getPath = function getPath(path, target, def) {
    if (def === void 0) def = undefined;

    if (!path || !target) {
      return def;
    }

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
  var isCallable = function isCallable(func) {
    return typeof func === 'function';
  };

  // Converts an array-like object to array, provides a simple polyfill for Array.from
  var toArray = function toArray(arrayLike) {
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
  var findIndex = function findIndex(arrayLike, predicate) {
    var array = Array.isArray(arrayLike) ? arrayLike : toArray(arrayLike);
    for (var i = 0; i < array.length; i++) {
      if (predicate(array[i])) {
        return i;
      }
    }

    return -1;
  };
  var find = function find(arrayLike, predicate) {
    var array = Array.isArray(arrayLike) ? arrayLike : toArray(arrayLike);
    var idx = findIndex(array, predicate);

    return idx === -1 ? undefined : array[idx];
  };

  /**
   * Custom resolver
   */
  var Resolver = function Resolver() {};
  Resolver.getCtorConfig = function getCtorConfig(el) {
    if (!el.__vue__) {
      return null;
    }
    var config = getPath('$options.$_veeValidate', el.__vue__);
    return config;
  };
  Resolver.resolveName = function resolveName(el) {
    var name = el.getAttribute("data-vv-name") || el.name;

    if (!name && el.__vue__) {
      var config = Resolver.getCtorConfig(el);
      var boundGetter = config.name.bind(el.__vue__);
      return boundGetter();
    }

    return name;
  };
  Resolver.resolveGetter = function resolveGetter(el) {
    var config = Resolver.getCtorConfig(el);
    if (config && typeof config.value === 'function') {
      var boundGetter = config.value.bind(el.__vue__);
      return function () {
        return boundGetter();
      };
    }

    switch (el.type) {
      case 'checkbox':
        return function () {
          var els = document.querySelectorAll("input[name=\"" + el.name + "\"]");

          els = toArray(els).filter(function (el) {
            return el.checked;
          });
          if (!els.length) {
            return undefined;
          }

          return els.map(function (checkbox) {
            return checkbox.value;
          });
        };
      case 'radio':
        return function () {
          var els = document.querySelectorAll("input[name=\"" + el.name + "\"]");
          var elm = find(els, function (el) {
            return el.checked;
          });

          return elm && elm.value;
        };
      case 'file':
        return function (context) {
          return toArray(el.files);
        };
      case 'select-multiple':
        return function () {
          return toArray(el.options).filter(function (opt) {
            return opt.selected;
          }).map(function (opt) {
            return opt.value;
          });
        };
      default:
        return function () {
          return el && el.value;
        };
    }
  };
  Resolver.resolveDelay = function resolveDelay(el, globalConfig) {
    var delayAttr = el.getAttribute("data-vv-delay");
    var globalDelay = globalConfig && 'delay' in globalConfig ? globalConfig.delay : 0;
    var delay = delayAttr || globalDelay;

    if (typeof delay === 'number') {
      return delay;
    }
    if (typeof delay === 'string') {
      return parseInt(delay);
    }

    var map = {};
    for (var element in delay) {
      map[element] = parseInt(delay[element]);
    }

    return map;
  };
  Resolver.resolveEvents = function resolveEvents(el) {
    var events = el.getAttribute("data-vv-validate-on");

    if (!events && el.__vue__) {
      var config = Resolver.getCtorConfig(el);
      events = config && config.events;
    }

    return events;
  };
  Resolver.resolveScope = function resolveScope(el) {
    var scope = el.getAttribute('data-vv-scope');
    if (!scope) {
      var form = el.closest('form');
      if (form) {
        scope = form.getAttribute('data-vv-scope');
      }
    }
    return scope;
  };

  /**
   * Plugin
   */
  var Vue1VeeValidate = function Vue1VeeValidate() {};
  Vue1VeeValidate.install = function (Vue, options) {
    // VeeValidate config
    VeeValidate.configure(options);

    // init validator
    var validator = new VeeValidate.Validator();
    validator.localize(VeeValidate.config.locale);
    Vue.prototype.$validator = validator;
    Vue.validator = validator;

    // directive
    Vue.directive('validate', {
      update: function update(val) {
        var _this = this;

        if (this.vm.errors === undefined || _typeof(this.vm.errors) === 'object' && this.vm.errors.constructor.name !== 'ErrorBag') {
          Vue.set(this.vm, 'errors', this.vm.$validator.errors);
        }
        var globalConfig = VeeValidate.config;

        var attachValidator = function attachValidator() {
          var field = _this.vm.$validator.fields.findById(_this.el._veeValidateId);
          if (field) {
            _this.vm.$validator.detach(field);;
          }
          var config = {
            name: Resolver.resolveName(_this.el),
            el: _this.el,
            listen: !_this.modifiers.disable,
            bails: _this.modifiers.bails ? true : _this.modifiers.continues === true ? false : undefined,
            scope: Resolver.resolveScope(_this.el),
            vm: _this.vm,
            classes: globalConfig.classes,
            classNames: globalConfig.classNames,
            getter: Resolver.resolveGetter(_this.el),
            events: Resolver.resolveEvents(_this.el) || globalConfig.events,
            delay: Resolver.resolveDelay(_this.el, globalConfig),
            rules: val,
            immediate: !!_this.modifiers.initial || !!_this.modifiers.immediate,
            persist: !!_this.modifiers.persist
          };
          _this.vm.$validator.attach(config);
        };
        this.vm.$nextTick(attachValidator);
      },
      unbind: function unbind() {
        var field = this.vm.$validator.fields.findById(this.el._veeValidateId);
        if (field) {
          this.vm.$validator.detach(field);
        }
      }
    });
  };

  return Vue1VeeValidate;
});