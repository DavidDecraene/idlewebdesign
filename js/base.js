
/* jshint esversion: 6 */
(function() {
  const webevo = window.webevo = {};

  webevo.Footer = class {
    constructor($element, options) {
      this.$element = $element;
      this.data = $.extend(true, { }, options);
      this.$text = $('.text', $element);
      this.render();
    }

    render() {
      this.$text.text(this.data.text);
    }
  };



  webevo.Frame = class {
    constructor(model) {
      this.time = 0;
      this.model =  model;
      this.cycles = 0;
    }

    cycle(timestamp) {
      if (!this.time) { this.time = timestamp; }
      const progress = timestamp - this.time;
      if(progress > 1000) {
        this.time = this.time + 1000;
        if (this.model.phase) this.model.phase.update(1);
        if (! (++this.cycles % 30)) {
          console.log('should save');
        }
      }
      window.requestAnimationFrame(this.cycle.bind(this));
    }

    start() {
        window.requestAnimationFrame(this.cycle.bind(this));
    }


  };

  webevo.Phase = class {
    constructor($element, options) {
      this.$element = $element;
      this.incrementors = [];
      this.$title = $('h1', $element);
      this.$log = $('.log', $element);
      this.data = $.extend(true, { footer: {}}, options);
      this.footer = new webevo.Footer($('.footer', $element), this.data.footer);
      this.render();
    }

    restore(json) {
      if(!json) return;
    }

    save() {
      return {

      }
    }

    render() {
      this.$element.removeClass();
      this.$element.addClass('phase');
      this.$element.addClass(this.data.id);
      if (this.data.title) {
        this.$title.text(this.data.title);
      }
    }

    notifyVisitors(count) {

    }

    toggle(state) {
      const vis = this.$element.is(':visible');
      if(state !== undefined) {
        if(state === vis) { return; }
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

  webevo.Visitors = class {

    constructor(){
      this.$element = $('.visitors');
      this.count = 0;
      this.iCount = 0;
    }

    add(count ) {
      this.count += count;
      const oldCount = this.iCount;
      this.iCount = Math.floor(this.count);
      if(oldCount !== this.iCount) this.$element.text(this.iCount);
    }

    restore(json) {
      if(!json) return;
      this.count = json.count;
      this.iCount =  Math.floor(this.count);
    }

    save() {
      return {
        count: this.count
      };
    }

  };

  webevo.VisitIncrementor  = class {

    constructor() {
      this.rate =  1;
      this.value = 0;
      this.multiplier = 1.07;
      this.costBase = 10;
      this.cost = this.costBase;
    }

    calculateNext() {
      this.cost = this.costBase * Math.pow(this.multiplier, this.value);
    }

    buy(model, amount = 1) {
      if (amount == 1 || !this.value) {
        if(model.visitors.count < this.cost) return false;
        model.visitors.add(-this.cost);
        this.value++;
        this.calculateNext();
        return true;
      } else if(amount > 1) {
        const r = this.multiplier;
        const pluralCost = this.costBase * Math.pow(r, this.value) * ( Math.pow(r, amount)  - 1) / (r - 1);
        if(model.visitors.count < pluralCost) return false;
        model.visitors.add(-pluralCost);
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
      model.visitors.add(this.value * this.rate); // Linear grow
    }
  };

  webevo.WOMOption = class {


      constructor($parent, model, options) {
        this.data = $.extend({}, options);
        this.value = new webevo.VisitIncrementor();
        this.$element = $('<div></div>').appendTo($parent);
        this.initRender();
        this.updateCost();
        this.update = this.value.update.bind(this.value);
      }


      initRender() {
        $('<span/>').text(this.data.name).appendTo(this.$element);
        $('<span>: </span>').appendTo(this.$element);
        this.$button = $('<span class="old-button">+</span>').appendTo(this.$element).click(() => {
          if(this.value.buy(model, 1))
          this.updateCost();
        });
        $('<span>: Requires </span>').appendTo(this.$element);
        this.$cost = $('<span class="cost">10</span>').appendTo(this.$element);
        $('<span> visitors.</span>').appendTo(this.$element);

      }

      updateCost() {
        this.$cost.text(Math.ceil(this.value.cost));
      }
  };

})();
