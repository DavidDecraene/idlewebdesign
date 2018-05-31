/* jshint esversion: 6 */
(function() {
  const webevo = window.webevo = {};

  webevo.Footer = class {
    constructor($element, options) {
      this.$element = $element;
      this.data = $.extend(true, {}, options);
      this.$text = $('.text', $element);
      // this.render(this.data.text);
    }

    render(text) {
      this.$text.text(text);
    }
  };



  webevo.Frame = class {
    constructor(model) {
      this.time = 0;
      this.model = model;
      this.cycles = 0;
    }

    cycle(timestamp) {
      if (!this.time) {
        this.time = timestamp;
      }
      const progress = timestamp - this.time;
      if (progress > 1000) {
        this.time = this.time + 1000;
        if (this.model.phase) this.model.phase.update(1);
        if (!(++this.cycles % 30)) {
          console.log('saved');
          localStorage.setItem('webevo', JSON.stringify(this.model.save()));
        }
      }
      window.requestAnimationFrame(this.cycle.bind(this));
    }

    start() {
      window.requestAnimationFrame(this.cycle.bind(this));
    }


  };

  webevo.Phase = class {
    get title() {
      return this.$title.text();
    }

    set title(value) {
      this.$title.text(value);
    }

    constructor($element, options) {
      this.$element = $element;
      this.incrementors = [];
      if (options && options.template) {
        $(options.template).appendTo(this.$element);
      }
      this.$titleWrapper = $('h1', $element);
      this.$title = $('<span/>').appendTo(this.$titleWrapper);
      this.title = "The start of it all";
      this.$body = $('.body', $element);
      this.$icons = $('.icons', $element);
      this.$log = $('.log', $element);
      this.data = $.extend(true, {
        footer: {}
      }, options);
      this.footer = new webevo.Footer($('.footer', $element), this.data.footer);
      this.render();
    }

    restore(json) {
      if (!json) return;
      if(json.incrementors) {
        const map = {};
        this.incrementors.forEach(i => {
          map[i.name] = i;
        });
        json.incrementors.forEach(i => {
          const match = map[i.name];
          console.log(match, i);
          if(match) { match.restore(i); }
        });
      }
    }

    save() {
      return {
        incrementors: this.incrementors.map(i => i.save())
      }
    }

    render() {
      this.$element.removeClass();
      this.$element.addClass('phase');
      this.$element.addClass(this.data.id);
      this.$element.addClass('button1');
    }

    notifyCounter(counter) {

    }

    toggle(state) {
      const vis = this.$element.is(':visible');
      if (state !== undefined) {
        if (state === vis) {
          return;
        }
        this.$element.toggle();
        return;
      }
      this.$element.toggle();
    }

    update(ticks) {
      this.incrementors.forEach(incr => {
        incr.update(this.model);
      });
    }

  };

  webevo.Counter = class {

    get name() {
      return this.data.name;
    }

    constructor($element, options) {
      this.data = options;
      this.$element = $element ;
      this.listeners = [];
      this.round = options.round ? options.round : 0;
      this.reset();
    }

    odometer(theme) {
      if(this.$odometer) {
        const $parent = this.$element.parent();
        this.$element.remove();
        this.$element = $('<span/>').appendTo($parent);
      }
      this.$odometer = new Odometer({ el: this.$element[0], theme: theme });
      this.$odometer.render();
    }

    updateText() {
      if (this.round) {
        const digits = Math.floor(Math.log10(this.count));
        if(digits < this.round) {
          this.$element.text(this.count.toFixed(this.round));
          return;
        }
      }
      this.$element.text(this.count.toFixed(0));

    }

    add(count) {
      if(!count) { return false; }
      // console.log(count);
      if(count < 0) { return this.remove(-count); }
      this.count += count;
      const oldCount = this.iCount;
      this.iCount = Math.floor(this.count);
      if (oldCount !== this.iCount) {
        this.updateText();
        this.listeners.forEach(l => l.notifyCounter(this));
      }
      return true;
    }

    remove(count) {
      if (!count) { return false; }
      if (count < 0) { count *= -1; }
      if (this.count < count) { return false; }
      this.count -= count;
      const oldCount = this.iCount;
      this.iCount = Math.floor(this.count);
      if (oldCount !== this.iCount) {
        this.updateText();
        this.listeners.forEach(l => l.notifyCounter(this));
      }
      return true;

    }

    reset() {
      this.count = 0;
      this.iCount = 0;
    }

    restore(json) {
      if (!json) return;
      this.count = json.count;
      this.iCount = Math.floor(this.count);
      this.updateText();
    }

    save() {
      return {
        count: this.count
      };
    }

  };

  webevo.Incrementor = class {

    constructor(options) {
      this.counter = options.counter;
      this.targetCounter = options.targetCounter ? options.targetCounter : options.counter;
      this.rate = options.rate ? options.rate : 1;
      this.value = 0;
      this.multiplier = 1.07;
      this.costBase = options.costBase ? options.costBase : 10;
      this.cost = this.costBase;
    }

    calculateNext() {
      this.cost = this.costBase * Math.pow(this.multiplier, this.value);
    }

    buy(model, amount = 1) {
      if (amount == 1 || !this.value) {
        if (this.counter.count < this.cost) return false;
        this.counter.add(-this.cost);
        this.value++;
        this.calculateNext();
        return true;
      } else if (amount > 1) {
        const r = this.multiplier;
        const pluralCost = this.costBase * Math.pow(r, this.value) * (Math.pow(r, amount) - 1) / (r - 1);
        if (this.counter.count < pluralCost) return false;
        this.counter.add(-pluralCost);
        this.value += amount;
        this.calculateNext();
        return true;
      }
      return false;
    }

    maxBuy(income) {
      const ll = (income * (r - 1) / (this.costBase * Math.pow(this.multiplier, this.value))) + 1;
      const maxBuy = Math.floor(Math.log(ll) / Math.log(this.multiplier));
      return maxBuy;
    }

    update(model) {
      this.targetCounter.add(this.value * this.rate); // Linear grow
    }
  };

  webevo.WOMOption = class {

    get name() {
      return this.data.name;
    }

    get counter() {
      return this.data.counter;
    }

    get targetCounter() {
      return this.data.targetCounter;
    }


    constructor($parent, model, options) {
      this.data = $.extend({}, options);
      this.model = model;
      this.value = new webevo.Incrementor(this.data);
      this.$element = $('<div class="WOMOption"></div>').hide().appendTo($parent);
      this.initRender();
      this.updateCost();
      this.update = this.value.update.bind(this.value);
    }

    show() {
      if(this.data.parent) this.data.parent.show();
      this.$element.show();
    }

    notifyCounter(counter) {
      if(this.counter !== counter) { return; }
      // console.log(counter, 'noififed', this.value.value, counter.count, this.value.costBase);
      if (!this.value.value && counter.count >= this.value.costBase) {
        this.show();
      }
    }

    restore(json) {
      const value = json.value ? json.value : 0;
      this.data = $.extend(this.data, json.data);
      this.value.value = value;
      this.value.calculateNext();
      this.updateCost();
      if(this.value.value) {
        this.show();
      }
    }

    save() {
      return {
        name: this.name,
        value: this.value.value
      }
    }


    initRender() {
      $('<span/>').text(this.data.name).appendTo(this.$element);
      $('<span>: </span>').appendTo(this.$element);
      this.$button = $('<button>+</button>').appendTo(this.$element).click(() => {
        if (this.value.buy(this.model, 1))
          this.updateCost();
      });
      $('<span>: Requires </span>').appendTo(this.$element);
      this.$cost = $('<span class="cost">10</span>').appendTo(this.$element);
      $('<span></span>').text(' '+this.counter.name + '.').appendTo(this.$element);

    }

    updateCost() {
      if (this.$cost) this.$cost.text(Math.ceil(this.value.cost));
    }
  };

})();
